# Event Bus API Test Framework

An end-to-end test framework for Event Bus testing.
Uses **webhook.site** as a live event receiver, **Jest** as the test runner, and
plain JavaScript with ESM syntax throughout.

---

## Project structure

```
event_Bus_API_Test_Framework/
├── clients/
│   ├── EventBuilder.js        # Create different events
│   ├── EventBusClient.js      # Publishes events via HTTP POST
│   └── EventReceiver.js       # Polls webhook.site; exposes awaitDelivery()
├── reporters/
│   └── EventReporter.cjs      # Custom Jest reporter
├── schemas/
│   └── OrderCreated.yaml      # OpenAPI-compatible event schema
├── setup/
│   ├── globalSetup.js         # Creates webhook.site endpoint before tests
│   └── globalTeardown.js      # Deletes endpoint and temp files after tests
├── tests/                     # Test scripts
│   └── orderCreated.test.js    
├── utils/
│   └── schemaValidator.js     # AJV + ajv-formats wrapper with schema cache
├── .gitignore                 # Local secrets (gitignored)
├── .env.example               # Template for required env vars
├── jest.config.js
└── package.json
```

---

## Prerequisites (download before setup)

- **Node.js 18+**
- **npm**

---

## Setup before running tests

```bash
npm install
# Optionally add your persenal webhook.site API key to .env (tests can work without it)
```

## Running tests

```bash
npm test
```

## Summary section covering

### Why the framework is structured this way

Each folder have it own role: **clients** for creating and receiving different types of events,
**schemas** for different types of event schemas, **setup** for global setups and teardowns, **tests** for test scripts (action + assertion), **utils** for different custom validation methods and **reporters** for custom Jest reporters.
This structure helps separate each part of testing framework one from the other, scale and fix them separately and combine when in test files.

### What would be improved or added with more time

1. **Retries in `EventBusClient`** — network errors
   currently propagate as test failures. A retry wrapper would improve reliability in
   flaky environments.
2. **Per-test isolated endpoints** — today all tests in a suite share one webhook
   token, relying on `correlationId` for isolation. A `beforeEach` / `afterEach` that
   creates and tears down a token per test would give stronger isolation at the cost
   of more API calls.
3. **CI/CD pipeline** — a Jenkins or GitHub Actions workflow that installs dependencies, runs
   `npm test`, and uploads the custom reporter output as a build artifact.
4. **Offline mock mode** — an optional `MOCK=true` env flag that replaces
   `EventReceiver` with an in-memory stub, making the suite runnable without internet
   access.
5. **TypeScript rewrite** — will help IDE recognize code errors during compilation instead of encountering them at runtime.

### How the framework scales to 100+ tests without major refactoring

- **Isolation by `correlationId`** — `awaitDelivery` filters received requests by
  `correlationId`, so parallel test workers hitting the same endpoint never
  cross-contaminate each other's results.
- **One YAML per event type** — adding a new event type is a two-file change
  (`schemas/NewEvent.yaml` + `tests/newEvent.test.js`). The validator, clients, and
  reporter require no modification.
- **Jest `--maxWorkers`** — because tests are stateless (each generates a unique
  `correlationId`) the suite is parallelised; scaling to N workers requires
   setting `--maxWorkers=N` in the script.
- **`globalSetup` / `globalTeardown` run once** — endpoint creation is a one-time
  overhead regardless of suite size. Can create global setups for each of project configurations.

## Technical notes

1. **ESM + Jest** —
The project uses `"type": "module"` so all `.js` files are ESM. Jest requires the
`--experimental-vm-modules` flag (already in the `npm test` script) to support ESM
test files, globalSetup, and globalTeardown.
2. **Schema design** —
Schemas live in `schemas/` as OpenAPI 3.0 `components/schemas` YAML objects. `utils/schemaValidator.js` loads and compiles them with AJV on
first use and caches the result, so schema compilation is paid once per process.
3. **globalSetup** — creates a fresh webhook.site token and saves it to `tmp/webhook-context.json`.
4. **Test suite** — generates a random `OrderCreated` event, publishes it via `EventBusClient`, then polls via `EventReceiver.awaitDelivery()` for up to 10 seconds.
5. **Assertions** — `eventType`, `correlationId`, `eventId`, `timestamp`, and full `payload` are verified to match the published event; the received payload is validated against `schemas/OrderCreated.yaml`.
6. **globalTeardown** — deletes the webhook.site token and removes the temp file.
---
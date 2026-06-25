import { EventBusClient } from '../clients/EventBusClient.js';
import { EventReceiver } from '../clients/EventReceiver.js';
import { validateEvent } from '../utils/schemaValidator.js';
import { EventBuilder } from '../clients/EventBuilder.js';

describe('Event Bus — OrderCreated', () => {
  let busClient;
  let receiver;
  let eventBuilder;

  beforeAll(() => {
    eventBuilder = new EventBuilder();
    const { tokenUuid, webhookUrl } = eventBuilder.loadWebhookContext();
    const apiKey = process.env.WEBHOOK_SITE_TOKEN || null;
    busClient = new EventBusClient(webhookUrl);
    receiver = new EventReceiver(tokenUuid, apiKey);
  });

  test('Publish an OrderCreated event and receives it with matching payload', async () => {
    const orderCreatedEvent = eventBuilder.buildOrderCreatedEvent();

    // 1. Publish
    const publishRes = await busClient.publish(orderCreatedEvent);
    expect(publishRes.status).toBe(200);

    // 2. Poll until delivered (max 10 s)
    const received = await receiver.awaitDelivery(orderCreatedEvent.correlationId, 10_000);

    // 3. Assert individual fields
    expect(received.eventType).toBe(orderCreatedEvent.eventType);
    expect(received.correlationId).toBe(orderCreatedEvent.correlationId);
    expect(received.eventId).toBe(orderCreatedEvent.eventId);
    expect(received.timestamp).toBe(orderCreatedEvent.timestamp);

    // 4. Assert full payload deep-equality
    expect(received.payload).toEqual(orderCreatedEvent.payload);

    // 5. Schema validation
    const { valid, errors } = validateEvent('OrderCreated', received);
    if (!valid) {
      console.error('[test] schema errors:', JSON.stringify(errors, null, 2));
    }
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  afterEach(async () => {
    await receiver.clearRequests();
  });
});

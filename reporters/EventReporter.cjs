'use strict';

/**
 * Custom Jest reporter that emits a one-line log entry for every event test
 * and prints a structured summary after the full run.
 *
 * Saved as .cjs because Jest loads reporters via require(), which cannot
 * consume ESM modules — the rest of the project uses ESM (.js with type:module).
 */
class EventReporter {
  constructor(globalConfig, _options) {
    this._globalConfig = globalConfig;
    this._log = [];
  }

  onTestResult(_test, testResult) {
    for (const result of testResult.testResults) {
      const status = result.status === 'passed' ? 'PASS' : 'FAIL';
      const durationMs = result.duration != null ? `${result.duration}ms` : 'n/a';
      const entry = `[EventReporter] ${status}  ${result.fullName}  (${durationMs})`;

      this._log.push({ status, name: result.fullName, durationMs });
      console.log(entry);

      if (result.status === 'failed') {
        for (const msg of result.failureMessages) {
          console.error(`             ${msg.split('\n')[0]}`);
        }
      }
    }
  }

  onRunComplete(_contexts, results) {
    const total = results.numTotalTests;
    const passed = results.numPassedTests;
    const failed = results.numFailedTests;
    const skipped = results.numPendingTests;
    const duration = ((results.testResults || []).reduce(
      (sum, r) => sum + (r.perfStats.runtime || 0),
      0,
    ) / 1000).toFixed(2);

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║        EventReporter — Summary        ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Total   : ${String(total).padEnd(26)}║`);
    console.log(`║  Passed  : ${String(passed).padEnd(26)}║`);
    console.log(`║  Failed  : ${String(failed).padEnd(26)}║`);
    console.log(`║  Skipped : ${String(skipped).padEnd(26)}║`);
    console.log(`║  Duration: ${String(duration + 's').padEnd(26)}║`);
    console.log('╚══════════════════════════════════════╝\n');
  }
}

module.exports = EventReporter;

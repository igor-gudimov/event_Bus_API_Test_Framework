import axios from 'axios';

const POLL_INTERVAL_MS = 1000;

export class EventReceiver {
  constructor(tokenUuid, apiKey = null) {
    this.tokenUuid = tokenUuid;
    this.http = axios.create({
      baseURL: process.env.WEBHOOK_SITE_BASE_URL,
      headers: apiKey ? { 'Api-Key': apiKey } : {},
    });
  }

  async getRequests() {
    const response = await this.http.get(`/token/${this.tokenUuid}/requests`);
    return response.data.data ?? [];
  }

  /**
   * Polls webhook.site until an event with the given correlationId arrives
   * or the timeout (ms) is exhausted.
   */
  async awaitDelivery(correlationId, timeout = 10000) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const requests = await this.getRequests();

      for (const req of requests) {
        let body;
        try {
          body = JSON.parse(req.content);
        } catch {
          continue;
        }
        if (body.correlationId === correlationId) {
          return body;
        }
      }

      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(POLL_INTERVAL_MS, remaining)));
    }

    throw new Error(
      `Event with correlationId "${correlationId}" was not received within ${timeout}ms`,
    );
  }

  async clearRequests() {
    await this.http.delete(`/token/${this.tokenUuid}/request`);
  }
}

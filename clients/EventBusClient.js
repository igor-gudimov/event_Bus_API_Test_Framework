import axios from 'axios';

export class EventBusClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.http = axios.create({
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async publish(event) {
    const response = await this.http.post(this.webhookUrl, event);
    return response;
  }
}

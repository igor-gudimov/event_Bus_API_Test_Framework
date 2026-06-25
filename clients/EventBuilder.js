import { faker } from '@faker-js/faker';
import _ from 'lodash';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class EventBuilder {
  constructor() {}

  loadWebhookContext() {
    const contextFile = resolve(__dirname, '../tmp/webhook-context.json');
    return JSON.parse(readFileSync(contextFile, 'utf8'));
  }

  buildOrderCreatedEvent() {
    const itemCount = faker.number.int({ min: 1, max: 4 });

    const items = Array.from({ length: itemCount }, () => ({
      productId: faker.string.uuid(),
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      unitPrice: parseFloat(faker.commerce.price({ min: 1, max: 500, dec: 2 })),
    }));

    const totalAmount = parseFloat(
      _.sumBy(items, (item) => item.quantity * item.unitPrice).toFixed(2),
    );

    return {
      eventId: `evt-${faker.string.uuid()}`,
      eventType: 'OrderCreated',
      correlationId: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      payload: {
        orderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
        totalAmount,
      },
    };
  }
}

import 'dotenv/config';
import axios from 'axios';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const CONTEXT_FILE = resolve(__dirname, '../tmp/webhook-context.json');

export default async function globalSetup() {
  const apiKey = process.env.WEBHOOK_SITE_TOKEN;
  const headers = apiKey ? { 'Api-Key': apiKey } : {};

  const response = await axios.post(
    `${process.env.WEBHOOK_SITE_BASE_URL}/token`,
    {
      default_status: 200,
      default_content: 'OK',
      default_content_type: 'text/plain',
      cors: true,
    },
    { headers },
  );

  const { uuid: tokenUuid } = response.data;
  const webhookUrl = `${process.env.WEBHOOK_SITE_BASE_URL}/${tokenUuid}`;

  mkdirSync(resolve(__dirname, '../tmp'), { recursive: true });
  writeFileSync(CONTEXT_FILE, JSON.stringify({ tokenUuid, webhookUrl }), 'utf8');

  console.log(`\n[globalSetup] Webhook endpoint ready: ${webhookUrl}`);
}

import 'dotenv/config';
import axios from 'axios';
import { readFileSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTEXT_FILE = resolve(__dirname, '../tmp/webhook-context.json');

export default async function globalTeardown() {
  let tokenUuid;
  try {
    ({ tokenUuid } = JSON.parse(readFileSync(CONTEXT_FILE, 'utf8')));
  } catch {
    console.warn('[globalTeardown] No webhook context file found — skipping cleanup.');
    return;
  }

  const apiKey = process.env.WEBHOOK_SITE_TOKEN;
  const headers = apiKey ? { 'Api-Key': apiKey } : {};

  try {
    await axios.delete(`${process.env.WEBHOOK_SITE_BASE_URL}/token/${tokenUuid}`, { headers });
    console.log(`\n[globalTeardown] Webhook token deleted: ${tokenUuid}`);
  } catch (err) {
    // Deletion requires a Pro API key; on free tier this is expected to fail.
    console.warn(`[globalTeardown] Could not delete token (free tier?): ${err.message}`);
  }

  try {
    unlinkSync(CONTEXT_FILE);
  } catch {
    // ignore — file may already be absent
  }
}

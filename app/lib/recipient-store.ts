import fs from 'node:fs/promises';
import path from 'node:path';

// The admin-configured recipient survives restarts by living in a small JSON
// file rather than module state (each route handler may run in its own worker).
const STORE_PATH = path.join(process.cwd(), 'data', 'recipient.json');

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getRecipient(): Promise<string | null> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { recipient?: unknown };
    return typeof parsed.recipient === 'string' && parsed.recipient ? parsed.recipient : null;
  } catch {
    return null;
  }
}

export async function setRecipient(recipient: string): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify({ recipient }, null, 2));
}

import { NextRequest } from 'next/server';
import { EMAIL_RE, getRecipient, setRecipient } from '../../lib/recipient-store';

export async function GET() {
  const recipient = await getRecipient();
  return Response.json({ recipient });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { recipient?: unknown } | null;
  const recipient = typeof body?.recipient === 'string' ? body.recipient.trim() : '';

  if (!EMAIL_RE.test(recipient)) {
    return Response.json({ error: 'Adresse e-mail invalide' }, { status: 400 });
  }

  await setRecipient(recipient);
  return Response.json({ ok: true, recipient });
}

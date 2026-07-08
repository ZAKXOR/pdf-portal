import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { exec } from 'node:child_process';
import path from 'node:path';
import { getRecipient } from '../../lib/recipient-store';

interface PdfAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export async function sendEmailWithPdfs(
  attachments: PdfAttachment[],
  name: string,
  recipient: string,
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const fileList = attachments.map((a) => `• ${a.filename}`).join('\n');

  const result = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: recipient,
    subject: `Inscription CJE — ${name} (${attachments.length} document(s))`,
    text: `Nom : ${name}\n\nDocuments reçus :\n${fileList}`,
    attachments,
  });

  console.log('EMAIL SENT:', result.messageId);

  // Fire the post-send hook script. Don't block the response on it.
  const batPath = path.join(process.cwd(), 'scripts', 'on-email-sent.bat');
  exec(`"${batPath}"`, (err) => {
    if (err) console.error('ON-EMAIL-SENT HOOK ERROR:', err);
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const name = (formData.get('name') as string | null)?.trim();
  if (!name) {
    return Response.json({ error: 'Le nom est requis' }, { status: 400 });
  }

  // The target address is configured once on /admin, not sent by the form.
  const recipient = await getRecipient();
  if (!recipient) {
    return Response.json(
      { error: "Aucun destinataire configuré. Rendez-vous sur /admin pour en définir un." },
      { status: 500 },
    );
  }

  // Each card appends its file under its own field name, so we don't look for
  // one fixed key — we collect every File the form carried.
  const attachments: PdfAttachment[] = [];
  for (const [field, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      const buffer = Buffer.from(await value.arrayBuffer());
      attachments.push({
        filename: `${field}.pdf`,
        content: buffer,
        contentType: value.type || 'application/pdf',
      });
    }
  }

  if (attachments.length === 0) {
    return Response.json({ error: 'Aucun fichier reçu' }, { status: 400 });
  }

  try {
    await sendEmailWithPdfs(attachments, name, recipient);
  } catch (err) {
    console.error('EMAIL ERROR:', err);
    return Response.json({ error: "Échec de l'envoi de l'e-mail" }, { status: 500 });
  }

  return Response.json({ ok: true, count: attachments.length });
}

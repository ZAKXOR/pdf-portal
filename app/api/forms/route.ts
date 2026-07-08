import fs from 'fs';
import path from 'path';

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const files = fs.readdirSync(publicDir);
  const filtered = files.filter((s) => s.endsWith('.pdf'));

  return Response.json({ files: filtered });
}

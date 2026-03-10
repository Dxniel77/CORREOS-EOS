export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to_email, to_name, subject, html } = req.body || {};

  if (!to_email || !subject || !html) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (!to_email.includes('@') || !to_email.includes('.')) {
    return res.status(400).json({ error: 'Email inválido: ' + to_email });
  }

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'RESEND_API_KEY no configurada en Vercel' });

  const FROM = process.env.FROM_EMAIL || 'EOS Community <onboarding@resend.dev>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to_email], subject, html })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || 'Error de Resend' });
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

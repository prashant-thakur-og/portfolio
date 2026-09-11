const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: 'Visitor counter is not configured' });
  }

  const visitorKey = typeof req.body?.visitorKey === 'string' ? req.body.visitorKey : '';
  if (visitorKey.length < 16 || visitorKey.length > 256) {
    return res.status(400).json({ error: 'Invalid visitor key' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_visitor`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_visitor_key: visitorKey })
    });

    if (!response.ok) {
      console.error('[v0] Supabase visitor counter error:', response.status);
      return res.status(502).json({ error: 'Visitor counter unavailable' });
    }

    const count = Number(await response.json());
    if (!Number.isInteger(count) || count < 0) {
      return res.status(502).json({ error: 'Invalid visitor counter response' });
    }

    return res.status(200).json({ count });
  } catch (error) {
    console.error('[v0] Visitor counter request failed:', error);
    return res.status(502).json({ error: 'Visitor counter unavailable' });
  }
}

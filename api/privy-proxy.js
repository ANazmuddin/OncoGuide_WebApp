export default async function handler(req, res) {
  // Menangani permintaan preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Hanya mengizinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  try {
    const response = await fetch('https://auth.privy.io/api/v1/apps/cmazcqao400dzjp0md68x79jj/jwks.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Jika API Privy memerlukan Authorization, tambahkan header berikut:
        // 'Authorization': `Bearer ${process.env.PRIVY_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Menambahkan header CORS pada respons
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Kesalahan pada proxy:', error);
    res.status(500).json({ error: 'Kesalahan internal server' });
  }
}

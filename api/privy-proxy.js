export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  console.log("Incoming Body:", req.body);
  console.log("Using Secret:", PRIVY_APP_SECRET?.slice(0, 6) + "...");

  try {
    const response = await fetch("https://auth.privy.io/api/v1/apps/cmazcqao400dzjp0md68x79jj/jwks.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PRIVY_APP_SECRET}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log("Privy Response:", data);

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: error.message });
  }
}

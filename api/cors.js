export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get the URL to proxy from query parameter
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
      // Fetch from the target URL
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(targetUrl).host,
        },
        body: req.method !== 'GET' ? req.body : undefined,
      });

      // Get the response body
      const data = await response.text();

      // Return the proxied response
      res.status(response.status).send(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

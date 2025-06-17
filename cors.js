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
    // Clean headers - remove problematic ones
    const headers = {};
    const skipHeaders = ['host', 'connection', 'content-length', 'accept-encoding'];
    
    Object.keys(req.headers).forEach(key => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        headers[key] = req.headers[key];
      }
    });
    
    // Handle body for POST requests
    let body = undefined;
    if (req.method !== 'GET') {
      if (req.body) {
        // Body is already parsed by Vercel
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else {
        // Handle raw body for cases where Vercel doesn't auto-parse
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        await new Promise(resolve => req.on('end', resolve));
        const rawBody = Buffer.concat(chunks).toString();
        if (rawBody) {
          body = rawBody;
        }
      }
    }
    
    // Fetch from the target URL
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });
    
    // Get the response body
    const data = await response.text();
    
    // Return the proxied response
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
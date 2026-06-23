// Vercel Serverless Function (Node.js runtime)

import serverHandler from '../dist/server/server.js';

export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      } else if (value) {
        headers.set(key, value);
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // In Vercel Node Serverless functions, `req.body` might be parsed automatically,
      // but if we need a raw stream, we can pass `req` directly as body if it's unparsed.
      // However, to be safe with Vercel's body parser, we serialize it if it's an object:
      if (req.body) {
        init.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      } else {
        init.body = req;
        init.duplex = 'half';
      }
    }

    const request = new Request(url, init);
    const response = await serverHandler.fetch(request, process.env, {});

    if (!response) {
      res.statusCode = 500;
      res.end('No response from handler');
      return;
    }

    res.statusCode = response.status || 200;
    
    // Copy headers from Response to ServerResponse
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      if (typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.end(await response.text());
      }
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}

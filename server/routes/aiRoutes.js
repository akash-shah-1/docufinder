const express = require('express');
const router = express.Router();
const https = require('https');

// Hugging Face Inference API endpoint - using new router endpoint
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Proxy endpoint for Perplexity API calls
router.post('/perplexity', async (req, res) => {
  try {
    const apiKey = req.headers['x-perplexity-api-key'];

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required in x-perplexity-api-key header' });
    }

    const url = 'https://api.perplexity.ai/chat/completions';
    const postData = JSON.stringify(req.body);

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const proxyReq = https.request(url, options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.status(proxyRes.statusCode).json(jsonData);
        } catch (error) {
          console.error('Failed to parse Perplexity response:', data);
          res.status(proxyRes.statusCode).json({ 
            error: 'Invalid response from Perplexity', 
            details: data 
          });
        }
      });
    });

    proxyReq.on('error', (error) => {
      console.error('Perplexity proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy request to Perplexity' });
    });

    proxyReq.write(postData);
    proxyReq.end();
  } catch (error) {
    console.error('Perplexity proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to Perplexity' });
  }
});

// Proxy endpoint for Hugging Face API calls
// Use wildcard to capture model path with slashes
router.post('/huggingface/*', async (req, res) => {
  try {
    // Extract model from the URL path
    const model = req.params[0]; // Gets everything after /huggingface/
    const apiKey = req.headers['x-hf-api-key'];

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required in x-hf-api-key header' });
    }

    const url = `${HF_API_URL}/${model}`;
    const postData = JSON.stringify(req.body);

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const proxyReq = https.request(url, options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.status(proxyRes.statusCode).json(jsonData);
        } catch (error) {
          console.error('Failed to parse Hugging Face response:', data);
          res.status(proxyRes.statusCode).json({ 
            error: 'Invalid response from Hugging Face', 
            details: data,
            url: url 
          });
        }
      });
    });

    proxyReq.on('error', (error) => {
      console.error('Hugging Face proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy request to Hugging Face' });
    });

    proxyReq.write(postData);
    proxyReq.end();
  } catch (error) {
    console.error('Hugging Face proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to Hugging Face' });
  }
});

module.exports = router;

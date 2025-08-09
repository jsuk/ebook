#!/usr/bin/env node

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8001;

// Create a simple CORS proxy server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }
  
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;
  
  if (!targetUrl) {
    res.writeHead(400);
    res.end('Missing url parameter');
    return;
  }
  
  console.log('Proxying request to:', targetUrl);
  
  // Make request to target URL
  const targetReq = https.request(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'KNL-Proxy/1.0'
    }
  }, (targetRes) => {
    // Forward status and headers
    res.writeHead(targetRes.statusCode, {
      'Content-Type': targetRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Pipe the response
    targetRes.pipe(res);
  });
  
  targetReq.on('error', (error) => {
    console.error('Proxy error:', error.message);
    res.writeHead(500);
    res.end('Proxy error: ' + error.message);
  });
  
  targetReq.end();
});

server.listen(PORT, () => {
  console.log(`KNL CORS Proxy running on http://localhost:${PORT}`);
  console.log('Usage: http://localhost:8001/?url=<encoded_url>');
  console.log('Press Ctrl+C to stop');
});

// Test the proxy
setTimeout(async () => {
  console.log('\nTesting proxy...');
  
  const knlQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(?label = "유시민")
}
LIMIT 1`;

  const encodedQuery = encodeURIComponent(knlQuery);
  const knlUrl = `https://lod.nl.go.kr/sparql?query=${encodedQuery}&format=json&type=json`;
  const proxyUrl = `http://localhost:${PORT}/?url=${encodeURIComponent(knlUrl)}`;
  
  try {
    const result = await fetch(proxyUrl);
    console.log('Proxy test status:', result.status);
    
    if (result.ok) {
      const data = await result.json();
      console.log('✅ Proxy working! Results:', data.results.bindings.length);
    } else {
      console.log('❌ Proxy test failed');
    }
  } catch (error) {
    console.log('❌ Proxy test error:', error.message);
  }
}, 1000);
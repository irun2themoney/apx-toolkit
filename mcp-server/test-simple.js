#!/usr/bin/env node

/**
 * Simple test script - Tests one tool at a time
 * Easier to debug than the full test suite
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test: Generate Python code
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'generate_code',
    arguments: {
      apiUrl: 'https://api.example.com/users',
      method: 'GET',
      language: 'python',
      headers: {
        'Authorization': 'Bearer token123',
      },
    },
  },
};

console.log('🧪 Testing MCP Server...\n');
console.log('Request:', JSON.stringify(testRequest, null, 2));
console.log('\n---\n');

const serverPath = join(__dirname, 'dist', 'server.js');
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
  const lines = output.split('\n').filter(line => line.trim());
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      if (response.id === testRequest.id) {
        console.log('✅ Response received:\n');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.result && response.result.content) {
          console.log('\n📝 Generated Code:\n');
          console.log(response.result.content[0].text);
        }
        
        serverProcess.kill();
        process.exit(0);
      }
    } catch (e) {
      // Not JSON yet, continue
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  process.stderr.write(data);
});

// Send request
serverProcess.stdin.write(JSON.stringify(testRequest) + '\n');

// Timeout after 5 seconds
setTimeout(() => {
  console.log('\n⏱️  Timeout - No response received');
  console.log('Output:', output);
  console.log('Error:', errorOutput);
  serverProcess.kill();
  process.exit(1);
}, 5000);


#!/usr/bin/env node

/**
 * Test script for MCP Server
 * Tests all tools by sending MCP requests
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test cases
const tests = [
  {
    name: 'List Tools',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    },
    validate: (response) => {
      return response.result && Array.isArray(response.result.tools) && response.result.tools.length === 7;
    },
  },
  {
    name: 'Generate Code - Python',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'generate_code',
        arguments: {
          apiUrl: 'https://api.example.com/users',
          method: 'GET',
          language: 'python',
        },
      },
    },
    validate: (response) => {
      return response.result && 
             response.result.content && 
             response.result.content[0] && 
             response.result.content[0].text &&
             response.result.content[0].text.includes('python');
    },
  },
  {
    name: 'Generate Code - TypeScript',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'generate_code',
        arguments: {
          apiUrl: 'https://api.example.com/users',
          method: 'GET',
          language: 'typescript',
        },
      },
    },
    validate: (response) => {
      return response.result && 
             response.result.content && 
             response.result.content[0] && 
             response.result.content[0].text;
    },
  },
  {
    name: 'Generate TypeScript Types',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'generate_typescript_types',
        arguments: {
          apiUrl: 'https://api.example.com/users',
          apiMethod: 'GET',
        },
      },
    },
    validate: (response) => {
      return response.result && 
             response.result.content && 
             response.result.content[0] && 
             response.result.content[0].text;
    },
  },
  {
    name: 'Generate Test Suite - Jest',
    request: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'generate_test_suite',
        arguments: {
          apiUrl: 'https://api.example.com/users',
          method: 'GET',
          framework: 'jest',
        },
      },
    },
    validate: (response) => {
      return response.result && 
             response.result.content && 
             response.result.content[0] && 
             response.result.content[0].text &&
             response.result.content[0].text.includes('jest');
    },
  },
  {
    name: 'Generate SDK Package - TypeScript',
    request: {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'generate_sdk_package',
        arguments: {
          apis: [
            {
              baseUrl: 'https://api.example.com/users',
              method: 'GET',
              headers: {},
            },
          ],
          language: 'typescript',
        },
      },
    },
    validate: (response) => {
      return response.result && 
             response.result.content && 
             response.result.content[0] && 
             response.result.content[0].text;
    },
  },
  {
    name: 'Generate Documentation - OpenAPI',
    request: {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'generate_documentation',
        arguments: {
          apis: [
            {
              baseUrl: 'https://api.example.com/users',
              method: 'GET',
              headers: {},
            },
          ],
          format: 'openapi',
        },
      },
    },
    validate: (response) => {
      return response.result && 
             response.result.content && 
             response.result.content[0] && 
             response.result.content[0].text;
    },
  },
];

// Run a single test
function runTest(test, serverProcess) {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send request
    const request = JSON.stringify(test.request) + '\n';
    serverProcess.stdin.write(request);

    // Wait for response
    setTimeout(() => {
      try {
        const lines = output.split('\n').filter(line => line.trim());
        let response = null;

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.id === test.request.id) {
              response = parsed;
              break;
            }
          } catch (e) {
            // Not JSON, skip
          }
        }

        if (response) {
          const isValid = test.validate(response);
          resolve({
            name: test.name,
            passed: isValid,
            response: response,
            error: errorOutput,
          });
        } else {
          resolve({
            name: test.name,
            passed: false,
            error: 'No response received',
            output: output,
          });
        }
      } catch (error) {
        resolve({
          name: test.name,
          passed: false,
          error: error.message,
          output: output,
        });
      }
    }, 2000);
  });
}

// Run all tests
async function runAllTests() {
  log('\n🧪 Starting MCP Server Tests\n', 'blue');

  const serverPath = join(__dirname, 'dist', 'server.js');
  const results = [];

  for (const test of tests) {
    log(`Testing: ${test.name}...`, 'yellow');
    
    const serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const result = await runTest(test, serverProcess);
    results.push(result);

    serverProcess.kill();

    if (result.passed) {
      log(`  ✅ ${test.name} - PASSED`, 'green');
    } else {
      log(`  ❌ ${test.name} - FAILED`, 'red');
      if (result.error) {
        log(`     Error: ${result.error}`, 'red');
      }
    }
  }

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  log(`\n📊 Test Results: ${passed}/${total} passed\n`, 'blue');

  if (passed === total) {
    log('🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed', 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Test runner error: ${error.message}`, 'red');
  process.exit(1);
});


/**
 * API Contract Testing Generator
 * 
 * Generates contract tests to prevent breaking changes
 */

import type { DiscoveredAPI } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ContractDefinition {
    endpoint: string;
    method: string;
    requestSchema: any;
    responseSchema: any;
    examples: {
        request: any;
        response: any;
    }[];
}

export interface ContractTestOutput {
    pactContracts: string;
    schemathesisTests: string;
    contractJson: string;
    ciConfig: string;
}

/**
 * Generate contract definitions from discovered APIs
 */
export function generateContractDefinitions(apis: DiscoveredAPI[]): ContractDefinition[] {
    return apis.map(api => ({
        endpoint: api.url,
        method: api.method,
        requestSchema: inferSchema(api.requestExample),
        responseSchema: inferSchema(api.responseExample || api.data),
        examples: [
            {
                request: api.requestExample || {},
                response: api.responseExample || api.data || {},
            },
        ],
    }));
}

/**
 * Generate Pact contract files
 */
export function generatePactContracts(contracts: ContractDefinition[]): string {
    return `// Auto-generated Pact contracts by APX Toolkit
const { Pact } = require('@pact-foundation/pact');
const path = require('path');

const provider = new Pact({
  consumer: 'APX-Generated-Client',
  provider: 'API-Provider',
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'INFO',
});

describe('API Contract Tests', () => {
${contracts.map((contract, index) => `
  describe('${contract.method} ${contract.endpoint}', () => {
    it('should match the contract', async () => {
      await provider.addInteraction({
        state: 'default',
        uponReceiving: 'a request for ${contract.endpoint}',
        withRequest: {
          method: '${contract.method}',
          path: '${new URL(contract.endpoint).pathname}',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: ${JSON.stringify(contract.examples[0].response, null, 12)},
        },
      });

      // Verify contract
      await provider.verify();
    });
  });`).join('\n')}
});
`;
}

/**
 * Generate Schemathesis tests
 */
export function generateSchemathesisTests(contracts: ContractDefinition[]): string {
    return `# Auto-generated Schemathesis tests by APX Toolkit
import schemathesis
from schemathesis import case

# API base URL
BASE_URL = "https://api.example.com"

${contracts.map((contract, index) => `
@schemathesis.test
def test_${index}_${contract.method.toLowerCase()}_${extractEndpointName(contract.endpoint)}(case):
    """Test contract for ${contract.method} ${contract.endpoint}"""
    response = case.call(BASE_URL + "${new URL(contract.endpoint).pathname}")
    assert response.status_code == 200
    assert response.headers.get("Content-Type") == "application/json"
    # Add schema validation here
`).join('\n')}
`;
}

function extractEndpointName(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    return pathParts[pathParts.length - 1] || 'root';
}

/**
 * Infer JSON schema from data
 */
function inferSchema(data: any): any {
    if (!data) return { type: 'object' };
    
    if (Array.isArray(data)) {
        return {
            type: 'array',
            items: data.length > 0 ? inferSchema(data[0]) : { type: 'object' },
        };
    }
    
    if (typeof data === 'object') {
        const properties: Record<string, any> = {};
        const required: string[] = [];
        
        for (const [key, value] of Object.entries(data)) {
            properties[key] = inferSchema(value);
            if (value !== null && value !== undefined) {
                required.push(key);
            }
        }
        
        return {
            type: 'object',
            properties,
            required,
        };
    }
    
    return { type: typeof data };
}

/**
 * Generate contract test output
 */
export function generateContractTests(apis: DiscoveredAPI[]): ContractTestOutput {
    const contracts = generateContractDefinitions(apis);
    
    return {
        pactContracts: generatePactContracts(contracts),
        schemathesisTests: generateSchemathesisTests(contracts),
        contractJson: JSON.stringify(contracts, null, 2),
        ciConfig: generateCIConfig(),
    };
}

/**
 * Generate CI/CD configuration
 */
function generateCIConfig(): string {
    return `# GitHub Actions for Contract Testing
name: Contract Tests

on:
  pull_request:
    paths:
      - 'contracts/**'
  schedule:
    - cron: '0 0 * * *' # Daily

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:contracts
      - name: Publish Pact
        uses: pact-foundation/pact-publish-action@v1
        with:
          pact_files: 'pacts/*.json'
          pact_broker: \${{ secrets.PACT_BROKER_URL }}
          pact_broker_token: \${{ secrets.PACT_BROKER_TOKEN }}
`;
}

/**
 * Save contract tests
 */
export async function saveContractTests(
    output: ContractTestOutput,
    outputPath: string
): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });
    await fs.mkdir(path.join(outputPath, 'contracts'), { recursive: true });

    // Save Pact contracts
    await fs.writeFile(
        path.join(outputPath, 'contracts', 'pact-contracts.test.js'),
        output.pactContracts
    );

    // Save Schemathesis tests
    await fs.writeFile(
        path.join(outputPath, 'contracts', 'schemathesis_tests.py'),
        output.schemathesisTests
    );

    // Save contract JSON
    await fs.writeFile(
        path.join(outputPath, 'contracts', 'contracts.json'),
        output.contractJson
    );

    // Save CI config
    await fs.writeFile(
        path.join(outputPath, '.github', 'workflows', 'contract-tests.yml'),
        output.ciConfig
    );
}


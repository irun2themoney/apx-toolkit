/**
 * Code Generator - Generate code snippets in multiple languages
 * Makes the tool a developer's dream by providing ready-to-use code
 */

import type { DiscoveredAPI } from '../types.js';

export type CodeLanguage = 
    | 'typescript'
    | 'javascript'
    | 'python'
    | 'go'
    | 'rust'
    | 'java'
    | 'php'
    | 'ruby'
    | 'curl'
    | 'powershell'
    | 'csharp'
    | 'kotlin';

export interface CodeSnippet {
    language: CodeLanguage;
    code: string;
    description: string;
}

/**
 * Generates code snippets for an API in multiple languages
 */
export function generateCodeSnippets(api: DiscoveredAPI): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];

    // Generate WebSocket-specific code if detected
    if (api.isWebSocket) {
        snippets.push(generateWebSocketTypeScriptSnippet(api));
        snippets.push(generateWebSocketPythonSnippet(api));
        snippets.push(generateWebSocketJavaScriptSnippet(api));
    } else if (api.isGraphQL) {
        // Generate GraphQL-specific code if detected
        snippets.push(generateGraphQLTypeScriptSnippet(api));
        snippets.push(generateGraphQLPythonSnippet(api));
        snippets.push(generateGraphQLJavaScriptSnippet(api));
    } else {
        // Standard REST API code
        snippets.push(generateTypeScriptSnippet(api));
        snippets.push(generateJavaScriptSnippet(api));
        snippets.push(generatePythonSnippet(api));
        snippets.push(generateGoSnippet(api));
        snippets.push(generateRustSnippet(api));
        snippets.push(generateJavaSnippet(api));
        snippets.push(generatePhpSnippet(api));
        snippets.push(generateRubySnippet(api));
        snippets.push(generateCurlSnippet(api));
        snippets.push(generatePowerShellSnippet(api));
    }
    
    // Always include C# and Kotlin
    snippets.push(generateCSharpSnippet(api));
    snippets.push(generateKotlinSnippet(api));

    return snippets;
}

function generateTypeScriptSnippet(api: DiscoveredAPI): CodeSnippet {
    const url = new URL(api.baseUrl);
    let code = `// TypeScript/Node.js\n`;
    code += `const response = await fetch('${api.baseUrl}'`;

    // Add query params
    const queryParams = buildQueryString(api);
    if (queryParams) {
        code += ` + '?${queryParams}'`;
    }
    code += `, {\n`;
    code += `  method: '${api.method}',\n`;

    // Add headers
    if (Object.keys(api.headers).length > 0) {
        code += `  headers: {\n`;
        for (const [key, value] of Object.entries(api.headers)) {
            code += `    '${key}': '${value}',\n`;
        }
        code += `  },\n`;
    }

    // Add body for POST
    if (api.method === 'POST' && api.body) {
        code += `  body: JSON.stringify(${JSON.stringify(api.body, null, 2)}),\n`;
    }

    code += `});\n`;
    code += `const data = await response.json();\n`;
    code += `console.log(data);`;

    return {
        language: 'typescript',
        code,
        description: 'TypeScript/Node.js with fetch API',
    };
}

function generateJavaScriptSnippet(api: DiscoveredAPI): CodeSnippet {
    const snippet = generateTypeScriptSnippet(api);
    snippet.language = 'javascript';
    snippet.code = snippet.code.replace('// TypeScript/Node.js', '// JavaScript/Node.js');
    return snippet;
}

function generatePythonSnippet(api: DiscoveredAPI): CodeSnippet {
    const url = new URL(api.baseUrl);
    let code = `# Python\n`;
    code += `import requests\n\n`;

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `url = '${fullUrl}'\n`;
    code += `headers = {\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `    '${key}': '${value}',\n`;
    }
    code += `}\n\n`;

    if (api.method === 'POST' && api.body) {
        code += `payload = ${JSON.stringify(api.body, null, 2)}\n\n`;
        code += `response = requests.${api.method.toLowerCase()}('${api.baseUrl}', headers=headers, json=payload)\n`;
    } else {
        code += `response = requests.${api.method.toLowerCase()}('${fullUrl}', headers=headers)\n`;
    }

    code += `data = response.json()\n`;
    code += `print(data)`;

    return {
        language: 'python',
        code,
        description: 'Python with requests library',
    };
}

function generateGoSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `// Go\n`;
    code += `package main\n\n`;
    code += `import (\n`;
    code += `    "bytes"\n`;
    code += `    "encoding/json"\n`;
    code += `    "fmt"\n`;
    code += `    "net/http"\n`;
    code += `)\n\n`;

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `func main() {\n`;
    code += `    url := "${fullUrl}"\n\n`;

    if (api.method === 'POST' && api.body) {
        code += `    payload, _ := json.Marshal(${JSON.stringify(api.body)})\n`;
        code += `    req, _ := http.NewRequest("${api.method}", url, bytes.NewBuffer(payload))\n`;
    } else {
        code += `    req, _ := http.NewRequest("${api.method}", url, nil)\n`;
    }

    code += `\n    // Set headers\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `    req.Header.Set("${key}", "${value}")\n`;
    }

    code += `\n    client := &http.Client{}\n`;
    code += `    resp, _ := client.Do(req)\n`;
    code += `    defer resp.Body.Close()\n\n`;
    code += `    var data map[string]interface{}\n`;
    code += `    json.NewDecoder(resp.Body).Decode(&data)\n`;
    code += `    fmt.Println(data)\n`;
    code += `}`;

    return {
        language: 'go',
        code,
        description: 'Go with net/http',
    };
}

function generateRustSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `// Rust (requires reqwest and serde_json)\n`;
    code += `use reqwest;\n`;
    code += `use serde_json::json;\n\n`;

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `#[tokio::main]\n`;
    code += `async fn main() -> Result<(), Box<dyn std::error::Error>> {\n`;
    code += `    let client = reqwest::Client::new();\n\n`;

    if (api.method === 'POST' && api.body) {
        code += `    let payload = json!(${JSON.stringify(api.body)});\n\n`;
        code += `    let res = client\n`;
        code += `        .${api.method.toLowerCase()}("${api.baseUrl}")\n`;
        for (const [key, value] of Object.entries(api.headers)) {
            code += `        .header("${key}", "${value}")\n`;
        }
        code += `        .json(&payload)\n`;
        code += `        .send()\n`;
        code += `        .await?;\n`;
    } else {
        code += `    let res = client\n`;
        code += `        .${api.method.toLowerCase()}("${fullUrl}")\n`;
        for (const [key, value] of Object.entries(api.headers)) {
            code += `        .header("${key}", "${value}")\n`;
        }
        code += `        .send()\n`;
        code += `        .await?;\n`;
    }

    code += `\n    let data: serde_json::Value = res.json().await?;\n`;
    code += `    println!("{:?}", data);\n\n`;
    code += `    Ok(())\n`;
    code += `}`;

    return {
        language: 'rust',
        code,
        description: 'Rust with reqwest',
    };
}

function generateJavaSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `// Java (requires OkHttp)\n`;
    code += `import okhttp3.*;\n`;
    code += `import java.io.IOException;\n\n`;

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `public class ApiClient {\n`;
    code += `    public static void main(String[] args) throws IOException {\n`;
    code += `        OkHttpClient client = new OkHttpClient();\n\n`;

    code += `        Request.Builder requestBuilder = new Request.Builder()\n`;
    code += `            .url("${fullUrl}")\n`;

    if (api.method === 'POST' && api.body) {
        code += `            .post(RequestBody.create(\n`;
        code += `                ${JSON.stringify(JSON.stringify(api.body))},\n`;
        code += `                MediaType.parse("application/json")))\n`;
    } else {
        code += `            .${api.method.toLowerCase()}()\n`;
    }

    for (const [key, value] of Object.entries(api.headers)) {
        code += `            .addHeader("${key}", "${value}")\n`;
    }

    code += `            .build();\n\n`;

    code += `        try (Response response = client.newCall(requestBuilder.build()).execute()) {\n`;
    code += `            String data = response.body().string();\n`;
    code += `            System.out.println(data);\n`;
    code += `        }\n`;
    code += `    }\n`;
    code += `}`;

    return {
        language: 'java',
        code,
        description: 'Java with OkHttp',
    };
}

function generatePhpSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `<?php\n`;
    code += `// PHP with cURL\n\n`;

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `$url = '${fullUrl}';\n\n`;

    code += `$headers = [\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `    '${key}: ${value}',\n`;
    }
    code += `];\n\n`;

    code += `$ch = curl_init($url);\n`;
    code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;

    if (api.method === 'POST' && api.body) {
        code += `curl_setopt($ch, CURLOPT_POST, true);\n`;
        code += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${JSON.stringify(api.body)}));\n`;
    }

    code += `\n$response = curl_exec($ch);\n`;
    code += `curl_close($ch);\n\n`;
    code += `$data = json_decode($response, true);\n`;
    code += `print_r($data);\n`;
    code += `?>`;

    return {
        language: 'php',
        code,
        description: 'PHP with cURL',
    };
}

function generateRubySnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `# Ruby (requires net/http and json)\n`;
    code += `require 'net/http'\n`;
    code += `require 'json'\n\n`;

    const url = new URL(api.baseUrl);
    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `uri = URI('${fullUrl}')\n\n`;

    if (api.method === 'POST') {
        code += `req = Net::HTTP::Post.new(uri)\n`;
        if (api.body) {
            code += `req.body = ${JSON.stringify(api.body)}.to_json\n`;
        }
    } else {
        code += `req = Net::HTTP::Get.new(uri)\n`;
    }

    code += `\n# Set headers\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `req['${key}'] = '${value}'\n`;
    }

    code += `\nres = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|\n`;
    code += `  http.request(req)\n`;
    code += `end\n\n`;
    code += `data = JSON.parse(res.body)\n`;
    code += `puts data`;

    return {
        language: 'ruby',
        code,
        description: 'Ruby with net/http',
    };
}

function generateCurlSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `# cURL\n`;
    code += `curl -X ${api.method}`;

    // Add headers
    for (const [key, value] of Object.entries(api.headers)) {
        code += ` \\\n  -H "${key}: ${value}"`;
    }

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    // Add body for POST
    if (api.method === 'POST' && api.body) {
        code += ` \\\n  -d '${JSON.stringify(api.body)}'`;
        code += ` \\\n  -H "Content-Type: application/json"`;
    }

    code += ` \\\n  "${fullUrl}"`;

    return {
        language: 'curl',
        code,
        description: 'cURL command',
    };
}

function generatePowerShellSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `# PowerShell\n`;

    const fullUrl = api.baseUrl + (api.queryParams ? '?' + buildQueryString(api) : '');

    code += `$headers = @{\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `    "${key}" = "${value}"\n`;
    }
    code += `}\n\n`;

    if (api.method === 'POST' && api.body) {
        code += `$body = ${JSON.stringify(api.body)} | ConvertTo-Json\n\n`;
        code += `$response = Invoke-RestMethod -Uri "${api.baseUrl}" -Method ${api.method} -Headers $headers -Body $body -ContentType "application/json"\n`;
    } else {
        code += `$response = Invoke-RestMethod -Uri "${fullUrl}" -Method ${api.method} -Headers $headers\n`;
    }

    code += `$response | ConvertTo-Json`;

    return {
        language: 'powershell',
        code,
        description: 'PowerShell with Invoke-RestMethod',
    };
}

function buildQueryString(api: DiscoveredAPI): string {
    const params: string[] = [];

    // Add query params
    if (api.queryParams) {
        for (const [key, value] of Object.entries(api.queryParams)) {
            params.push(`${key}=${encodeURIComponent(String(value))}`);
        }
    }

    // Add pagination params
    if (api.paginationInfo) {
        const paramName = api.paginationInfo.paramName || 'page';
        const paramValue = api.paginationInfo.currentPage || api.paginationInfo.currentOffset || 1;
        params.push(`${paramName}=${paramValue}`);
    }

    return params.join('&');
}

/**
 * Generates GraphQL code snippets
 */
function generateGraphQLTypeScriptSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `// TypeScript/Node.js with GraphQL\n`;
    code += `// Requires: npm install @apollo/client graphql\n\n`;
    code += `import { ApolloClient, InMemoryCache, gql } from '@apollo/client';\n\n`;
    code += `const client = new ApolloClient({\n`;
    code += `  uri: '${api.baseUrl}',\n`;
    code += `  cache: new InMemoryCache(),\n`;
    if (Object.keys(api.headers).length > 0) {
        code += `  headers: {\n`;
        for (const [key, value] of Object.entries(api.headers)) {
            code += `    '${key}': '${value}',\n`;
        }
        code += `  },\n`;
    }
    code += `});\n\n`;
    
    if (api.graphQLQuery) {
        code += `const ${api.graphQLOperationName || 'QUERY'} = gql\`\n`;
        code += api.graphQLQuery;
        code += `\`;\n\n`;
        code += `const { data } = await client.query({\n`;
        code += `  query: ${api.graphQLOperationName || 'QUERY'},\n`;
        if (api.body && typeof api.body === 'object' && 'variables' in api.body) {
            code += `  variables: ${JSON.stringify((api.body as any).variables, null, 2)},\n`;
        }
        code += `});\n`;
        code += `console.log(data);`;
    } else {
        code += `// GraphQL query detected but not captured\n`;
        code += `// Use Apollo Client to execute queries`;
    }

    return {
        language: 'typescript',
        code,
        description: 'TypeScript with Apollo Client (GraphQL)',
    };
}

function generateGraphQLPythonSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `# Python with GraphQL\n`;
    code += `# Requires: pip install gql requests\n\n`;
    code += `from gql import gql, Client\n`;
    code += `from gql.transport.requests import RequestsHTTPTransport\n\n`;
    code += `headers = {\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `    '${key}': '${value}',\n`;
    }
    code += `}\n\n`;
    code += `transport = RequestsHTTPTransport(\n`;
    code += `    url='${api.baseUrl}',\n`;
    code += `    headers=headers\n`;
    code += `)\n\n`;
    code += `client = Client(transport=transport, fetch_schema_from_transport=True)\n\n`;
    
    if (api.graphQLQuery) {
        code += `query = gql("""\n`;
        code += api.graphQLQuery;
        code += `""")\n\n`;
        code += `result = client.execute(query`;
        if (api.body && typeof api.body === 'object' && 'variables' in api.body) {
            code += `, variable_values=${JSON.stringify((api.body as any).variables)}`;
        }
        code += `)\n`;
        code += `print(result)`;
    } else {
        code += `# GraphQL query detected but not captured\n`;
        code += `# Use gql client to execute queries`;
    }

    return {
        language: 'python',
        code,
        description: 'Python with gql library (GraphQL)',
    };
}

function generateGraphQLJavaScriptSnippet(api: DiscoveredAPI): CodeSnippet {
    const snippet = generateGraphQLTypeScriptSnippet(api);
    snippet.language = 'javascript';
    snippet.code = snippet.code.replace('// TypeScript/Node.js', '// JavaScript/Node.js');
    snippet.code = snippet.code.replace('import {', 'const {');
    snippet.code = snippet.code.replace('} from', '} = require');
    return snippet;
}

/**
 * Generates C# code snippet
 */
function generateCSharpSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `// C# (.NET)\n`;
    code += `using System;\n`;
    code += `using System.Net.Http;\n`;
    code += `using System.Text;\n`;
    code += `using System.Text.Json;\n`;
    code += `using System.Threading.Tasks;\n\n`;
    code += `public class ApiClient\n`;
    code += `{\n`;
    code += `    private static readonly HttpClient client = new HttpClient();\n\n`;
    code += `    public static async Task Main(string[] args)\n`;
    code += `    {\n`;
    
    if (api.method === 'GET') {
        code += `        var request = new HttpRequestMessage(HttpMethod.Get, "${api.baseUrl}");\n`;
    } else {
        code += `        var request = new HttpRequestMessage(HttpMethod.Post, "${api.baseUrl}");\n`;
        if (api.body) {
            code += `        var json = JsonSerializer.Serialize(${JSON.stringify(api.body)});\n`;
            code += `        request.Content = new StringContent(json, Encoding.UTF8, "application/json");\n`;
        }
    }
    
    code += `\n        // Add headers\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `        request.Headers.Add("${key}", "${value}");\n`;
    }
    
    code += `\n        var response = await client.SendAsync(request);\n`;
    code += `        var content = await response.Content.ReadAsStringAsync();\n`;
    code += `        var data = JsonSerializer.Deserialize<object>(content);\n`;
    code += `        Console.WriteLine(data);\n`;
    code += `    }\n`;
    code += `}`;

    return {
        language: 'csharp',
        code,
        description: 'C# with HttpClient (.NET)',
    };
}

/**
 * Generates Kotlin code snippet
 */
function generateKotlinSnippet(api: DiscoveredAPI): CodeSnippet {
    let code = `// Kotlin\n`;
    code += `// Requires: implementation("com.squareup.okhttp3:okhttp:4.11.0")\n\n`;
    code += `import okhttp3.*\n`;
    code += `import java.io.IOException\n\n`;
    code += `fun main() {\n`;
    code += `    val client = OkHttpClient()\n\n`;
    
    if (api.method === 'GET') {
        code += `    val request = Request.Builder()\n`;
        code += `        .url("${api.baseUrl}")\n`;
    } else {
        code += `    val json = """${api.body ? JSON.stringify(api.body) : '{}'}""".trimIndent()\n`;
        code += `    val body = RequestBody.create(\n`;
        code += `        MediaType.parse("application/json; charset=utf-8"),\n`;
        code += `        json\n`;
        code += `    )\n\n`;
        code += `    val request = Request.Builder()\n`;
        code += `        .url("${api.baseUrl}")\n`;
        code += `        .post(body)\n`;
    }
    
    code += `        .apply {\n`;
    for (const [key, value] of Object.entries(api.headers)) {
        code += `            addHeader("${key}", "${value}")\n`;
    }
    code += `        }\n`;
    code += `        .build()\n\n`;
    code += `    client.newCall(request).execute().use { response ->\n`;
    code += `        val data = response.body?.string()\n`;
    code += `        println(data)\n`;
    code += `    }\n`;
    code += `}`;

    return {
        language: 'kotlin',
        code,
        description: 'Kotlin with OkHttp',
    };
}

/**
 * Generates WebSocket code snippets
 */
function generateWebSocketTypeScriptSnippet(api: DiscoveredAPI): CodeSnippet {
    const url = api.webSocketUrl || api.url;
    const protocols = api.webSocketProtocols && api.webSocketProtocols.length > 0 
        ? api.webSocketProtocols[0] 
        : undefined;

    let code = `// WebSocket Client Code\n`;
    code += `// Auto-generated by APX\n\n`;
    code += `const ws = new WebSocket('${url}'`;
    if (protocols) {
        code += `, '${protocols}'`;
    }
    code += `);\n\n`;
    code += `ws.onopen = () => {\n`;
    code += `  console.log('WebSocket connected');\n`;
    code += `  // Send messages here\n`;
    code += `};\n\n`;
    code += `ws.onmessage = (event) => {\n`;
    code += `  console.log('Message received:', event.data);\n`;
    code += `  // Handle message\n`;
    code += `};\n\n`;
    code += `ws.onerror = (error) => {\n`;
    code += `  console.error('WebSocket error:', error);\n`;
    code += `};\n\n`;
    code += `ws.onclose = () => {\n`;
    code += `  console.log('WebSocket closed');\n`;
    code += `};\n`;

    return {
        language: 'typescript',
        code,
        description: 'TypeScript WebSocket client',
    };
}

function generateWebSocketPythonSnippet(api: DiscoveredAPI): CodeSnippet {
    const url = api.webSocketUrl || api.url;
    const protocols = api.webSocketProtocols && api.webSocketProtocols.length > 0 
        ? api.webSocketProtocols[0] 
        : undefined;

    let code = `# WebSocket Client Code\n`;
    code += `# Auto-generated by APX\n`;
    code += `# Requires: pip install websockets\n\n`;
    code += `import asyncio\n`;
    code += `import websockets\n`;
    code += `import json\n\n`;
    code += `async def connect_websocket():\n`;
    code += `    uri = '${url}'\n`;
    code += `    async with websockets.connect(uri`;
    if (protocols) {
        code += `, subprotocols=['${protocols}']`;
    }
    code += `) as websocket:\n`;
    code += `        print('WebSocket connected')\n`;
    code += `        \n`;
    code += `        async for message in websocket:\n`;
    code += `            print(f'Message received: {message}')\n`;
    code += `            # Handle message\n\n`;
    code += `if __name__ == '__main__':\n`;
    code += `    asyncio.run(connect_websocket())\n`;

    return {
        language: 'python',
        code,
        description: 'Python WebSocket client (websockets library)',
    };
}

function generateWebSocketJavaScriptSnippet(api: DiscoveredAPI): CodeSnippet {
    const snippet = generateWebSocketTypeScriptSnippet(api);
    snippet.language = 'javascript';
    return snippet;
}

/**
 * Generates code snippets for all discovered APIs
 */
export function generateAllCodeSnippets(apis: DiscoveredAPI[]): Record<string, CodeSnippet[]> {
    const result: Record<string, CodeSnippet[]> = {};

    for (const api of apis) {
        const url = new URL(api.baseUrl);
        const key = api.isWebSocket 
            ? `WS_${url.pathname || url.hostname}` 
            : `${api.method}_${url.pathname}`;
        result[key] = generateCodeSnippets(api);
    }

    return result;
}


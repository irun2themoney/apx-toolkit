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
    | 'powershell';

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
 * Generates code snippets for all discovered APIs
 */
export function generateAllCodeSnippets(apis: DiscoveredAPI[]): Record<string, CodeSnippet[]> {
    const result: Record<string, CodeSnippet[]> = {};

    for (const api of apis) {
        const url = new URL(api.baseUrl);
        const key = `${api.method}_${url.pathname}`;
        result[key] = generateCodeSnippets(api);
    }

    return result;
}


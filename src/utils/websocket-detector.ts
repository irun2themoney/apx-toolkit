/**
 * WebSocket API Detector
 * Detects WebSocket connections and captures their configuration
 * This addresses real-time APIs that use WebSocket protocol
 */

import type { Page } from 'playwright';

export interface WebSocketConnection {
    url: string;
    protocols?: string[];
    headers?: Record<string, string>;
    messages?: Array<{
        type: 'sent' | 'received';
        data: string;
        timestamp: number;
    }>;
    closed: boolean;
    closeReason?: string;
    closeCode?: number;
}

/**
 * Detects WebSocket connections from a page
 * 
 * @param page - Playwright page instance
 * @param log - Logger instance
 * @returns Array of detected WebSocket connections
 */
export async function detectWebSockets(
    page: Page,
    log: any
): Promise<WebSocketConnection[]> {
    const connections: WebSocketConnection[] = [];
    
    log.info('Starting WebSocket detection...');

    try {
        // Intercept WebSocket connections
        page.on('websocket', (ws) => {
            const url = ws.url();
            const connection: WebSocketConnection = {
                url,
                protocols: undefined, // Playwright doesn't expose protocol directly
                closed: false,
                messages: [],
            };

            log.info(`WebSocket connection detected: ${connection.url}`);

            // Capture sent messages
            ws.on('framesent', (event) => {
                if (!connection.messages) {
                    connection.messages = [];
                }
                connection.messages.push({
                    type: 'sent',
                    data: typeof event.payload === 'string' 
                        ? event.payload 
                        : JSON.stringify(event.payload),
                    timestamp: Date.now(),
                });
                log.debug(`WebSocket message sent to ${connection.url}`);
            });

            // Capture received messages
            ws.on('framereceived', (event) => {
                if (!connection.messages) {
                    connection.messages = [];
                }
                connection.messages.push({
                    type: 'received',
                    data: typeof event.payload === 'string'
                        ? event.payload
                        : JSON.stringify(event.payload),
                    timestamp: Date.now(),
                });
                log.debug(`WebSocket message received from ${connection.url}`);
            });

            // Capture close event
            ws.on('close', () => {
                connection.closed = true;
                log.info(`WebSocket connection closed: ${connection.url}`);
            });

            connections.push(connection);
        });

        // Also try to detect WebSocket connections via JavaScript injection
        // Some WebSockets are created before we can intercept them
        try {
            const wsInfo = await page.evaluate(() => {
                const info: Array<{ url: string; readyState: number }> = [];
                
                // Check if there are any WebSocket instances in the page
                // This is a best-effort approach since we can't directly access WebSocket instances
                // But we can check for common WebSocket patterns in the code
                const scripts = Array.from(document.querySelectorAll('script'));
                scripts.forEach((script) => {
                    const content = script.textContent || '';
                    // Look for WebSocket constructor calls
                    const wsPattern = /new\s+WebSocket\s*\(\s*['"]([^'"]+)['"]/g;
                    let match;
                    while ((match = wsPattern.exec(content)) !== null) {
                        info.push({
                            url: match[1],
                            readyState: 0, // Unknown state
                        });
                    }
                });
                
                return info;
            });

            for (const ws of wsInfo) {
                // Only add if not already in connections
                if (!connections.find(c => c.url === ws.url)) {
                    connections.push({
                        url: ws.url,
                        closed: ws.readyState === 3, // CLOSED
                    });
                    log.info(`WebSocket detected in page code: ${ws.url}`);
                }
            }
        } catch (error) {
            log.debug(`Could not detect WebSockets via code inspection: ${error}`);
        }

        log.info(`WebSocket detection complete. Found ${connections.length} connection(s).`);
    } catch (error) {
        log.warning(`WebSocket detection error: ${error}`);
    }

    return connections;
}

/**
 * Generates WebSocket client code for a connection
 */
export function generateWebSocketCode(connection: WebSocketConnection, language: 'typescript' | 'javascript' | 'python'): string {
    const url = connection.url;
    const protocols = connection.protocols && connection.protocols.length > 0 
        ? connection.protocols[0] 
        : undefined;

    switch (language) {
        case 'typescript':
        case 'javascript':
            let code = `// WebSocket Client Code\n`;
            code += `// Auto-generated by APX\n\n`;
            code += `const ws = new WebSocket('${url}'`;
            if (protocols) {
                code += `, '${protocols}'`;
            }
            code += `);\n\n`;
            code += `ws.onopen = () => {\n`;
            code += `  console.log('WebSocket connected');\n`;
            if (connection.messages && connection.messages.some(m => m.type === 'sent')) {
                const sentMessage = connection.messages.find(m => m.type === 'sent');
                if (sentMessage) {
                    code += `  // Example message from discovery\n`;
                    code += `  ws.send(${JSON.stringify(sentMessage.data)});\n`;
                }
            }
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
            return code;

        case 'python':
            let pyCode = `# WebSocket Client Code\n`;
            pyCode += `# Auto-generated by APX\n`;
            pyCode += `# Requires: pip install websockets\n\n`;
            pyCode += `import asyncio\n`;
            pyCode += `import websockets\n`;
            pyCode += `import json\n\n`;
            pyCode += `async def connect_websocket():\n`;
            pyCode += `    uri = '${url}'\n`;
            pyCode += `    async with websockets.connect(uri`;
            if (protocols) {
                pyCode += `, subprotocols=['${protocols}']`;
            }
            pyCode += `) as websocket:\n`;
            pyCode += `        print('WebSocket connected')\n`;
            if (connection.messages && connection.messages.some(m => m.type === 'sent')) {
                const sentMessage = connection.messages.find(m => m.type === 'sent');
                if (sentMessage) {
                    pyCode += `        # Example message from discovery\n`;
                    try {
                        const parsed = JSON.parse(sentMessage.data);
                        pyCode += `        await websocket.send(json.dumps(${JSON.stringify(parsed)}))\n`;
                    } catch {
                        pyCode += `        await websocket.send('${sentMessage.data}')\n`;
                    }
                }
            }
            pyCode += `        \n`;
            pyCode += `        async for message in websocket:\n`;
            pyCode += `            print(f'Message received: {message}')\n`;
            pyCode += `            # Handle message\n\n`;
            pyCode += `if __name__ == '__main__':\n`;
            pyCode += `    asyncio.run(connect_websocket())\n`;
            return pyCode;

        default:
            return `// WebSocket connection: ${url}`;
    }
}


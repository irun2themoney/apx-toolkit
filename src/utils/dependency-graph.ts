/**
 * API Dependency Graph Generator
 * 
 * Creates visual dependency graphs showing API relationships
 */

import type { DiscoveredAPI } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface APIDependency {
    from: string;
    to: string;
    type: 'data' | 'auth' | 'reference';
    description?: string;
}

export interface DependencyGraph {
    nodes: Array<{
        id: string;
        label: string;
        method: string;
        url: string;
        group?: string;
    }>;
    edges: Array<{
        from: string;
        to: string;
        label: string;
        arrows: string;
    }>;
    criticalPaths: string[][];
}

/**
 * Analyze API dependencies
 */
export function analyzeDependencies(apis: DiscoveredAPI[]): DependencyGraph {
    const nodes = apis.map(api => ({
        id: api.url,
        label: `${api.method} ${extractEndpointName(api.url)}`,
        method: api.method,
        url: api.url,
        group: extractGroup(api.url),
    }));

    const edges: Array<{ from: string; to: string; label: string; arrows: string }> = [];
    const dependencies: APIDependency[] = [];

    // Analyze dependencies
    for (const api of apis) {
        // Check for references to other endpoints in response data
        if (api.responseExample) {
            const referencedEndpoints = findReferencedEndpoints(api.responseExample, apis);
            for (const ref of referencedEndpoints) {
                dependencies.push({
                    from: api.url,
                    to: ref.url,
                    type: 'data',
                    description: 'Data dependency',
                });
                
                edges.push({
                    from: api.url,
                    to: ref.url,
                    label: 'uses',
                    arrows: 'to',
                });
            }
        }

        // Check for authentication dependencies
        if (api.headers?.Authorization || api.bearerToken) {
            const authEndpoint = findAuthEndpoint(apis);
            if (authEndpoint && authEndpoint.url !== api.url) {
                dependencies.push({
                    from: api.url,
                    to: authEndpoint.url,
                    type: 'auth',
                    description: 'Authentication dependency',
                });
                
                edges.push({
                    from: api.url,
                    to: authEndpoint.url,
                    label: 'auth',
                    arrows: 'to',
                });
            }
        }
    }

    // Find critical paths
    const criticalPaths = findCriticalPaths(nodes, edges);

    return {
        nodes,
        edges,
        criticalPaths,
    };
}

function extractEndpointName(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    return pathParts[pathParts.length - 1] || 'root';
}

function extractGroup(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    return pathParts[0] || 'root';
}

function findReferencedEndpoints(data: any, apis: DiscoveredAPI[]): DiscoveredAPI[] {
    const referenced: DiscoveredAPI[] = [];
    const dataStr = JSON.stringify(data);

    for (const api of apis) {
        const endpointName = extractEndpointName(api.url);
        if (dataStr.includes(endpointName) || dataStr.includes(api.url)) {
            referenced.push(api);
        }
    }

    return referenced;
}

function findAuthEndpoint(apis: DiscoveredAPI[]): DiscoveredAPI | undefined {
    return apis.find(api => 
        api.url.includes('/auth') ||
        api.url.includes('/login') ||
        api.url.includes('/token')
    );
}

function findCriticalPaths(
    nodes: DependencyGraph['nodes'],
    edges: DependencyGraph['edges']
): string[][] {
    // Simple critical path analysis - find longest dependency chains
    const paths: string[][] = [];
    
    // Find entry points (nodes with no incoming edges)
    const entryPoints = nodes.filter(node => 
        !edges.some(edge => edge.to === node.id)
    );

    for (const entry of entryPoints) {
        const path = findLongestPath(entry.id, edges, []);
        if (path.length > 1) {
            paths.push(path);
        }
    }

    return paths.sort((a, b) => b.length - a.length).slice(0, 5); // Top 5 critical paths
}

function findLongestPath(
    nodeId: string,
    edges: DependencyGraph['edges'],
    visited: string[]
): string[] {
    if (visited.includes(nodeId)) {
        return [nodeId]; // Cycle detected
    }

    visited.push(nodeId);
    const outgoing = edges.filter(e => e.from === nodeId);
    
    if (outgoing.length === 0) {
        return [nodeId];
    }

    const paths = outgoing.map(edge => 
        [nodeId, ...findLongestPath(edge.to, edges, [...visited])]
    );

    return paths.reduce((longest, current) => 
        current.length > longest.length ? current : longest
    , [nodeId]);
}

/**
 * Generate Mermaid diagram
 */
export function generateMermaidDiagram(graph: DependencyGraph): string {
    return `graph TD
${graph.nodes.map(node => 
    `    ${node.id.replace(/[^a-zA-Z0-9]/g, '_')}["${node.label}"]`
).join('\n')}

${graph.edges.map(edge => 
    `    ${edge.from.replace(/[^a-zA-Z0-9]/g, '_')} -->|${edge.label}| ${edge.to.replace(/[^a-zA-Z0-9]/g, '_')}`
).join('\n')}

classDef getMethod fill:#90EE90
classDef postMethod fill:#FFB6C1
classDef putMethod fill:#87CEEB
classDef deleteMethod fill:#FFA07A

${graph.nodes.filter(n => n.method === 'GET').map(n => 
    `class ${n.id.replace(/[^a-zA-Z0-9]/g, '_')} getMethod`
).join('\n')}
${graph.nodes.filter(n => n.method === 'POST').map(n => 
    `class ${n.id.replace(/[^a-zA-Z0-9]/g, '_')} postMethod`
).join('\n')}
${graph.nodes.filter(n => n.method === 'PUT').map(n => 
    `class ${n.id.replace(/[^a-zA-Z0-9]/g, '_')} putMethod`
).join('\n')}
${graph.nodes.filter(n => n.method === 'DELETE').map(n => 
    `class ${n.id.replace(/[^a-zA-Z0-9]/g, '_')} deleteMethod`
).join('\n')}
`;
}

/**
 * Generate interactive HTML graph (using vis.js)
 */
export function generateInteractiveGraph(graph: DependencyGraph): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>API Dependency Graph - APX Toolkit</title>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        #graph { width: 100%; height: 800px; border: 1px solid #ccc; }
        .info { margin: 20px 0; padding: 10px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>API Dependency Graph</h1>
    <div class="info">
        <p><strong>Total APIs:</strong> ${graph.nodes.length}</p>
        <p><strong>Dependencies:</strong> ${graph.edges.length}</p>
        <p><strong>Critical Paths:</strong> ${graph.criticalPaths.length}</p>
    </div>
    <div id="graph"></div>
    
    <script type="text/javascript">
        const nodes = new vis.DataSet(${JSON.stringify(graph.nodes.map(n => ({
            id: n.id,
            label: n.label,
            group: n.method,
            title: n.url,
        })))});
        
        const edges = new vis.DataSet(${JSON.stringify(graph.edges.map(e => ({
            from: e.from,
            to: e.to,
            label: e.label,
            arrows: e.arrows,
        })))});
        
        const data = { nodes, edges };
        const options = {
            nodes: {
                shape: 'box',
                font: { size: 14 },
            },
            edges: {
                arrows: { to: { enabled: true } },
                smooth: { type: 'continuous' },
            },
            layout: {
                hierarchical: {
                    direction: 'UD',
                    sortMethod: 'directed',
                },
            },
            physics: {
                enabled: true,
            },
        };
        
        const container = document.getElementById('graph');
        const network = new vis.Network(container, data, options);
    </script>
</body>
</html>`;
}

/**
 * Save dependency graph
 */
export async function saveDependencyGraph(
    graph: DependencyGraph,
    outputPath: string
): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });

    // Save Mermaid diagram
    await fs.writeFile(
        path.join(outputPath, 'dependency-graph.mmd'),
        generateMermaidDiagram(graph)
    );

    // Save interactive HTML
    await fs.writeFile(
        path.join(outputPath, 'dependency-graph.html'),
        generateInteractiveGraph(graph)
    );

    // Save JSON data
    await fs.writeFile(
        path.join(outputPath, 'dependency-graph.json'),
        JSON.stringify(graph, null, 2)
    );

    // Save critical paths report
    const criticalPathsReport = `# Critical API Paths

## Analysis

Found ${graph.criticalPaths.length} critical dependency paths.

${graph.criticalPaths.map((path, index) => `
### Critical Path ${index + 1} (${path.length} endpoints)

${path.map((endpoint, i) => `${i + 1}. ${endpoint}`).join('\n')}
`).join('\n')}

## Recommendations

- Monitor critical paths for performance issues
- Consider caching for frequently accessed endpoints
- Implement circuit breakers for critical dependencies
- Add retry logic for critical path endpoints

---
Generated by APX Toolkit
`;

    await fs.writeFile(
        path.join(outputPath, 'CRITICAL-PATHS.md'),
        criticalPathsReport
    );
}


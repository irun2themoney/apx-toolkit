/**
 * APX Toolkit VS Code Extension
 * Provides seamless API discovery and code generation from VS Code
 */

import * as vscode from 'vscode';
import { runAPXCore } from 'apx-toolkit/core-runner';
import type { ActorInput } from 'apx-toolkit/types';

export function activate(context: vscode.ExtensionContext) {
    console.log('APX Toolkit extension is now active!');

    // Command: Discover API
    const discoverCommand = vscode.commands.registerCommand('apx.discoverAPI', async (uri?: vscode.Uri) => {
        const url = await vscode.window.showInputBox({
            prompt: 'Enter URL to discover APIs from',
            placeHolder: 'https://api.example.com',
        });

        if (!url) {
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'APX: Discovering APIs...',
            cancellable: false,
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Starting discovery...' });

                const input: ActorInput = {
                    startUrls: [{ url }],
                    maxPages: 10,
                    generateDocumentation: true,
                };

                const result = await runAPXCore(input, {
                    onProgress: (message) => {
                        progress.report({ message });
                    },
                });

                progress.report({ increment: 100, message: 'Complete!' });

                vscode.window.showInformationMessage(
                    `APX: Discovered ${result.summary.apisDiscovered} API(s) and generated ${result.summary.itemsExtracted} items!`
                );

                // Open output folder
                const outputUri = vscode.Uri.file(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.');
                vscode.commands.executeCommand('revealFileInOS', outputUri);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `APX Error: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        });
    });

    // Command: Generate Code
    const generateCommand = vscode.commands.registerCommand('apx.generateCode', async () => {
        vscode.window.showInformationMessage('APX: Code generation feature coming soon!');
    });

    context.subscriptions.push(discoverCommand, generateCommand);
}

export function deactivate() {}


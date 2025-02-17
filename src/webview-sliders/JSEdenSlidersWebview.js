const vscode = require("vscode");

class JSEdenSlidersWebview {
    static currentPanel = undefined;
    static viewType = 'variableSlider';

    constructor(panel, extensionUri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.disposables = [];

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'updateVariable':
                        // Handle variable update
                        console.log(`Variable ${message.variable} updated to ${message.value}`);
                        return;
                }
            },
            null,
            this.disposables
        );
    }

    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (JSEdenSlidersWebview.currentPanel) {
            JSEdenSlidersWebview.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            JSEdenSlidersWebview.viewType,
            'Variable Sliders',
            column || vscode.ViewColumn.One,
            {
                // Enable JavaScript in the webview
                enableScripts: true,
                retainContextWhenHidden: true,
                // Restrict the webview to only load resources from the `media` directory
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        JSEdenSlidersWebview.currentPanel = new JSEdenSlidersWebview(panel, extensionUri);
    }

    dispose() {
        JSEdenSlidersWebview.currentPanel = undefined;

        // Clean up resources
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    _update() {
        this.panel.webview.html = this._getHtmlForWebview();
    }

    _getHtmlForWebview() {
        // Get variables from your notebook or other source
        const variables = [
            { name: 'x', value: 42 },
            { name: 'y', value: 10 }
        ];

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Variable Sliders</title>
                <style>
                    body {
                        padding: 20px;
                        color: var(--vscode-foreground);
                        font-family: var(--vscode-font-family);
                    }
                    .slider-container {
                        margin-bottom: 20px;
                    }
                    .slider-group {
                        margin: 15px 0;
                    }
                    input[type="range"] {
                        width: 200px;
                    }
                    label {
                        display: block;
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="slider-container">
                    ${variables.map(variable => `
                        <div class="slider-group">
                            <label>${variable.name}: <span id="${variable.name}-value">${variable.value}</span></label>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value="${variable.value}" 
                                id="${variable.name}-slider"
                                onchange="updateVariable('${variable.name}', this.value)"
                            >
                        </div>
                    `).join('')}
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function updateVariable(name, value) {
                        // Update the display
                        document.getElementById(name + '-value').textContent = value;

                        // Send message to extension
                        vscode.postMessage({
                            command: 'updateVariable',
                            variable: name,
                            value: parseInt(value)
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }

    // Method to update variables from extension
    updateVariables(variables) {
        this.panel.webview.postMessage({
            command: 'updateVariables',
            variables: variables
        });
    }
}

module.exports = {
    JSEdenSlidersWebview
}
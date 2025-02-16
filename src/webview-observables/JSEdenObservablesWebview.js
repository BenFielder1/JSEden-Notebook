const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "./treeview.html"), 'utf-8');

class JSEdenObservablesWebview{
    static currentPanel = undefined;

    static createOrShow(extensionUri, edenTreeview) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (JSEdenObservablesWebview.currentPanel) {
            JSEdenObservablesWebview.currentPanel._panel.reveal(column);
            JSEdenObservablesWebview.currentPanel._sendTreeData();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'customTreeview',
            'Custom Treeview',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        JSEdenObservablesWebview.currentPanel = new JSEdenObservablesWebview(panel, extensionUri, edenTreeview);
    }

    constructor(panel, extensionUri, edenTreeview) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._edenTreeview = edenTreeview;

        // Set the webview's initial HTML content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, null);

        // Listen for tree data changes to refresh the webview
        this._edenTreeview.onDidChangeTreeData(() => {
            this._sendTreeData();
        });

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'itemClick':
                        vscode.window.showInformationMessage(`Clicked on: ${message.text}`);
                        // Implement additional logic, e.g., open a file
                        return;
                }
            },
            null,
            null
        );
    }

    dispose() {
        JSEdenObservablesWebview.currentPanel = undefined;
        this._panel.dispose();
    }

    _update() {
        this._panel.webview.html = this._getHtmlForWebview();
        this._sendTreeData();
    }

    _getHtmlForWebview() {
        return html;
    }

    _sendTreeData() {
        if (!this._edenTreeview || !this._panel.webview) {
            return;
        }

        const treeItems = this._edenTreeview.getItems().map(item => ({
            label: item.label,
            description: item.description || "",
            tooltip: item.tooltip || "",
            collapsibleState: item.collapsibleState, // Not used in webview but kept for consistency
            // Add other properties if needed
        }));

        this._panel.webview.postMessage({ command: 'updateTree', data: treeItems });
    }
}

module.exports = {
    JSEdenObservablesWebview
}
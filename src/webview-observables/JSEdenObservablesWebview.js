const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "./treeview.html"), "utf-8");

class JSEdenObservablesWebview{
    constructor(context, jsedenTreeview){
        this.context = context;
        this.treeview = jsedenTreeview;

        this.panel = vscode.window.createWebviewPanel(
            "js-eden-observables",
            "JS-Eden Observables",
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        this.panel.webview.html = html;

        this.sendTreeData();

        this.panel.onDidDispose(() => this.panel.dispose(), null, null);

        this.treeview.onDidChangeTreeData(() => {
            setTimeout(() => {
                this.sendTreeData();
            }, 100);
        });
    }

    sendTreeData() {
        if (!this.treeview || !this.panel.webview) {
            return;
        }

        const treeItems = this.treeview.getItems().map(item => ({
            label: item.label,
            description: item.description || "",
            tooltip: item.tooltip || "",
            collapsibleState: item.collapsibleState, // Not used in webview but kept for consistency
            // Add other properties if needed
        }));

        this.panel.webview.postMessage({ command: 'updateTree', data: treeItems });
    }
}

module.exports = {
    JSEdenObservablesWebview
}
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "./view.html"), 'utf-8');

class JSEdenWebview{
    panel;
    context;
    active;

    constructor(context){
        this.active = true;
        this.context = context;
        this.panel = vscode.window.createWebviewPanel(
            'js-eden-visuals',
            'JS-Eden',
            vscode.ViewColumn.One,
            { 
                enableScripts: true,
            }
        );

        this.panel.webview.html = html;

        this.panel.onDidDispose(() => { this.active = false; }, null, this.context.subscriptions);
    }

    sendObservable(name, value){
        this.panel.webview.postMessage({ observable: name, content: value });
    }

    isActive(){
        return this.active;
    }
}

module.exports = {
    JSEdenWebview
}

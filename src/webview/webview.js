const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "./test.html"), 'utf-8');

class JSEdenWebView{
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

    sendMessage(message){
        this.panel.webview.postMessage({ command: message });
    }

    isActive(){
        return this.active;
    }
}

module.exports = {
    JSEdenWebView
}

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "./view.html"), 'utf-8');

class JSEdenCanvasWebview{
    constructor(context, count){
        this.active = true;
        this.context = context;
        this.count = count;
        this.panel = vscode.window.createWebviewPanel(
            "js-eden-visuals",
            "JS-Eden picture" + this.count,
            vscode.ViewColumn.One,
            { 
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        this.panel.webview.html = html;

        this.panel.onDidDispose(() => { this.active = false; }, null, this.context.subscriptions);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'mouseMove':
                        const { x, y } = message;
                        console.log(`Mouse coordinates: (${x}, ${y})`);
                        break;
                    default:
                        console.warn(`Unknown command: ${message.command}`);
                }
            },
            undefined,
            context.subscriptions
        );
    }

    sendPicture(data){
        this.panel.webview.postMessage({ picture: data });
    }

    isActive(){
        return this.active;
    }
}

module.exports = {
    JSEdenCanvasWebview
}

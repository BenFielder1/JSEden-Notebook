const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const { JSEdenNotebookKernel } = require("../notebook/JSEdenNotebookKernel");

const html = fs.readFileSync(path.join(__dirname, "./svgCanvas.html"), "utf-8");

class JSEdenCanvasWebview{
    constructor(context, count){
        this.active = true;
        this.context = context;
        this.count = count;
        this.panel = vscode.window.createWebviewPanel(
            "js-eden-visuals",
            "JS-Eden picture" + this.count,
            vscode.ViewColumn.Active,
            { 
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        this.panel.webview.html = html;

        this.panel.onDidDispose(() => { 
            this.active = false;
            this.panel.dispose();
        }, null, this.context.subscriptions);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'mouseMove':
                        const { x, y } = message;
                        JSEdenNotebookKernel.updateMouseCoords(x, y);
                        break;
                    case 'resize':
                        const { width, height } = message;
                        JSEdenNotebookKernel.updateCanvasSize(width, height);
                        break;
                    case "mousePress":
                        const { mousePressed } = message;
                        console.log("mouse");
                        JSEdenNotebookKernel.updateMousePressed(mousePressed);
                        break;
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

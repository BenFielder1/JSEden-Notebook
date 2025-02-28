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
        this.picture = "picture" + this.count;
        this.panel = vscode.window.createWebviewPanel(
            "js-eden-visuals",
            "JS-Eden " + this.picture,
            vscode.ViewColumn.Active,
            { 
                enableScripts: true,
                retainContextWhenHidden: false,
            }
        );

        this.panel.webview.html = html;

        this.panel.onDidChangeViewState((e)=>{
            if(e.webviewPanel.visible){
                let data = JSEdenNotebookKernel.getPicture(this.picture);
                this.panel.webview.postMessage({ picture: data });
            }
        });

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
                        JSEdenNotebookKernel.updateMousePressed(mousePressed);
                        break;
                }
            },
            null,
            null
        );

        this.panel.onDidDispose(() => { 
            this.active = false;
            this.panel.dispose();
        }, null, null);
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

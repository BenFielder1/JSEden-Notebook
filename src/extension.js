const vscode = require("vscode");

const { JSEdenNotebookSerializer } = require("./notebook/JSEdenNotebookSerializer");
const { JSEdenNotebookKernel } = require("./notebook/JSEdenNotebookKernel");
const { JSEdenWebview } = require("./webview/JSEdenWebview");

function activate(context) {
    let kernel = new JSEdenNotebookKernel(context);
    let webviewCount = 0;

    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('js-eden-notebook', new JSEdenNotebookSerializer()),
	    kernel
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('js-eden-visuals.start', ()=>{
            webviewCount++;
            kernel.setWebview(new JSEdenWebview(context, webviewCount), webviewCount)
        })
    );
}

module.exports = {
	activate
}
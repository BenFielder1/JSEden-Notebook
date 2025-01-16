const vscode = require("vscode");

const { JSEdenNotebookSerializer } = require("./notebook/JSEdenNotebookSerializer");
const { JSEdenNotebookKernel } = require("./notebook/JSEdenNotebookKernel");
const { JSEdenWebview } = require("./webview/JSEdenWebview");

function activate(context) {
    let kernel = new JSEdenNotebookKernel(context);

    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('js-eden-notebook', new JSEdenNotebookSerializer()),
	    kernel
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('js-eden-visuals.start', ()=>{
            kernel.addObserverCallback(new JSEdenWebview(context))
        })
    );
}

module.exports = {
	activate
}
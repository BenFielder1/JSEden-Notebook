const vscode = require("vscode");

const { JSEdenNotebookSerializer } = require("./notebook/serializer");
const { JSEdenNotebookController, updateWebView } = require("./notebook/controller");
const { JSEdenWebView } = require("./webview/webview");

const { JSEdenNotebookKernel } = require("./notebook/kernel");

function activate(context) {
    let kernel = new JSEdenNotebookKernel(context);

    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('js-eden-notebook', new JSEdenNotebookSerializer()),
        // new JSEdenNotebookController(context)
	    kernel
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('js-eden-visuals.start', ()=>{
			// updateWebView(new JSEdenWebView(context));
            kernel.addObserverCallback(new JSEdenWebView(context))
        })
    );
}

module.exports = {
	activate
}
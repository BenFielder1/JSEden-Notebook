const vscode = require("vscode");

const { JSEdenNotebookSerializer } = require("./notebook/serializer");
const { JSEdenNotebookController, updateWebView } = require("./notebook/controller");
const { JSEdenWebView } = require("./webview/webview");
const { setupKernel } = require("./kernel/kernel");

function activate(context) {
	setupKernel(context);

    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('js-eden-notebook', new JSEdenNotebookSerializer()),
	    new JSEdenNotebookController()
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('js-eden-visuals.start', ()=>{
			updateWebView(new JSEdenWebView(context));
        })
    );
}

module.exports = {
	activate
}
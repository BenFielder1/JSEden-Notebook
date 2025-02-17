const vscode = require("vscode");

const { JSEdenNotebookSerializer } = require("./notebook/JSEdenNotebookSerializer");
const { JSEdenNotebookKernel } = require("./notebook/JSEdenNotebookKernel");
const { JSEdenCanvasWebview } = require("./webview-canvas/JSEdenCanvasWebview");
const { JSEdenTreeview } = require("./treeview/JSEdenTreeview");
const { JSEdenObservablesWebview } = require("./webview-observables/JSEdenObservablesWebview");
const { JSEdenSlidersWebview } = require("./webview-sliders/JSEdenSlidersWebview");

function activate(context) {
    let kernel = new JSEdenNotebookKernel(context);
    let webviewCount = 0;

    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer("js-eden-notebook", new JSEdenNotebookSerializer()),
	    kernel
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("js-eden-visuals.start", ()=>{
            webviewCount++;
            kernel.setWebview(new JSEdenCanvasWebview(context, webviewCount), webviewCount);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('myExtension.showVariableSliders', () => {
            JSEdenSlidersWebview.createOrShow(context.extensionUri);
        })
    );

    let treeview = new JSEdenTreeview();

    kernel.setTreeview(treeview);

    const disposable = vscode.commands.registerCommand('extension.openCustomTreeview', () => {
        new JSEdenObservablesWebview(context, treeview);
    });

    context.subscriptions.push(disposable);
}

module.exports = {
	activate
}
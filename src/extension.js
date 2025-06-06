const vscode = require("vscode");

const { JSEdenNotebookSerializer } = require("./notebook/JSEdenNotebookSerializer");
const { JSEdenNotebookKernel } = require("./notebook/JSEdenNotebookKernel");
const { JSEdenCanvasWebview } = require("./webview-canvas/JSEdenCanvasWebview");
const { JSEdenTreeview } = require("./treeview/JSEdenTreeview");
const { JSEdenObservablesWebview } = require("./webview-observables/JSEdenObservablesWebview");
const { JSEdenSlidersWebview } = require("./webview-sliders/JSEdenSlidersWebview");

function activate(context) {
    let kernel = new JSEdenNotebookKernel(context);

    let treeview = new JSEdenTreeview();

    kernel.setTreeview(treeview);

    let webviewCount = 0;

    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer("js-eden-notebook", new JSEdenNotebookSerializer()),

	    vscode.commands.registerCommand("js-eden-notebook.launch-canvas", ()=>{
            webviewCount++;
            kernel.setWebview(new JSEdenCanvasWebview(context, webviewCount), webviewCount);
        }),

        vscode.commands.registerCommand("js-eden-notebook.launch-observables", () => {
            new JSEdenObservablesWebview(context, treeview);
        }),
        
        vscode.commands.registerCommand("js-eden-notebook.launch-variable-sliders", () => {
            if(JSEdenSlidersWebview.currentPanel){
                JSEdenSlidersWebview.currentPanel.panel.reveal();
            }
            else{
                new JSEdenSlidersWebview(context, treeview);
            }
        })
    );
}

module.exports = {
	activate
}
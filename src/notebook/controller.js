const vscode = require("vscode");

const { setupKernel, executeCell, addObserverCallback } = require("../kernel/kernel");

function updateWebView(webview){
    addObserverCallback(webview);
}

class JSEdenNotebookController {
    controllerId = 'js-eden-notebook-controller-id';
    notebookType = 'js-eden-notebook';
    label = 'JS-Eden Notebook';
    supportedLanguages = ["jseden"];
    
    constructor(context) {
        this.controller = vscode.notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );
    
        this.controller.supportedLanguages = this.supportedLanguages;
        this.controller.supportsExecutionOrder = true;
        this.controller.executeHandler = this.execute.bind(this);

        this.executionOrder = 0;

        setupKernel(context);
    }
    
    execute(cells){
        cells.forEach(async (cell)=>{
            let execution = this.controller.createNotebookCellExecution(cell);
            execution.executionOrder = ++this._executionOrder;
            execution.start(Date.now());
  
            let code = cell.document.getText();

            let output = executeCell(code, cell.index);
  
            execution.replaceOutput([
                new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text(output)
                ])
            ]);
  
            execution.end(true, Date.now());
        });
    }
}

module.exports = {
	JSEdenNotebookController,
    updateWebView
}
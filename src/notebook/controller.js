const vscode = require("vscode");

const { executeCell, addObserverCallback } = require("../kernel/kernel");

function updateWebView(webview){
    addObserverCallback(webview);
}

class JSEdenNotebookController {
    controllerId = 'js-eden-notebook-controller-id';
    notebookType = 'js-eden-notebook';
    label = 'JS-Eden Notebook';
    supportedLanguages = ["jseden"];
  
    _controller;
    _executionOrder = 0;
    
    constructor() {
        this._controller = vscode.notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );
    
        this._controller.supportedLanguages = this.supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._execute.bind(this);
    }
    
    _execute(cells){
        for (let cell of cells) {
            this._doExecution(cell);
        }
    }
    
    async _doExecution(cell){
        const execution = this._controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());
  
        var code = cell.document.getText();

        let output = executeCell(code, cell.index);
  
        execution.replaceOutput([
            new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.text(output)
            ])
        ]);
  
        execution.end(true, Date.now());
    }
  
    dispose(){ }
}

module.exports = {
	JSEdenNotebookController,
    updateWebView
}
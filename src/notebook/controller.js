const vscode = require("vscode");

const { executeLine } = require("../kernel/kernel")

let jsedenWebView;

function updateWebView(webview){
    jsedenWebView = webview;
}

class JSEdenNotebookController {
    controllerId = 'js-eden-notebook-controller-id';
    notebookType = 'js-eden-notebook';
    label = 'JS-Eden Notebook';
    supportedLanguages = ["javascript", "js-eden"];
  
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
    
    _execute(cells, _notebook, _controller){
        for (let cell of cells) {
            this._doExecution(cell);
        }
    }
    
    async _doExecution(cell){
        const execution = this._controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());
  
        var code = cell.document.getText();

        let lines = code.split("\n");
        let output = ""

        for(let i = 0; i < lines.length; i++){
            lines[i] = lines[i].replace(";", "")
            output += executeLine(lines[i]) + "\n";
        }
  
        if(jsedenWebView && jsedenWebView.isActive()){
            jsedenWebView.sendMessage(code);
        }
  
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
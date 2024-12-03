const { TextDecoder, TextEncoder } = require('util');
// import * as vscode from 'vscode';

const vscode = require("vscode");

// import { TestWebView } from './webview';

const { TestWebView } = require("./webview");

var testWebView;

function activate(context) {
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('js-eden-notebook', new SampleSerializer()),
	    new Controller()
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('js-eden-visuals.start', ()=>{
            testWebView = new TestWebView(context);
        })
    );
}
  
class SampleSerializer{
    async deserializeNotebook(content, _token){
        var contents = new TextDecoder().decode(content);
  
        let raw = [];
  
        if(contents){
            raw = JSON.parse(contents);
        }
  
        let cells= [];
  
        for (let i = 0; i < raw.length; i++) {
            let item = raw[i];
              let cell = new vscode.NotebookCellData(
                  item.cell_type === 'code'
                      ? vscode.NotebookCellKind.Code
                      : vscode.NotebookCellKind.Markup,
                  item.source.join('\n'),
                  item.cell_type === 'code' ? 'javascript' : 'markdown'
              );
            cells.push(cell);
        }
  
        return new vscode.NotebookData(cells);
    }
  
    async serializeNotebook(data, _token){
        let contents= [];
  
        for (const cell of data.cells) {
            contents.push({
                cell_type: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
                source: cell.value.split(/\r?\n/g)
            });
        }
      
        return new TextEncoder().encode(JSON.stringify(contents));
    }
}
  
class Controller {
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
        var name = cell.index.toString();
  
        if(testWebView && testWebView.isActive()){
            testWebView.sendMessage(code);
        }
  
        execution.replaceOutput([
            new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.text(name)
            ])
        ]);
  
        execution.end(true, Date.now());
    }
  
    dispose(){ }
}

module.exports = {
	activate
}
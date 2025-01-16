const vscode = require("vscode");

const { Eden } = require("../js-eden/js/core/eden.js");
require("./kernelRequirements.js");

class JSEdenNotebookKernel{
    constructor(context){
        this.context = context;
        this.executionOrder = 0;

        this.controllerId = "js-eden-notebook-controller-id";
        this.notebookType = "js-eden-notebook";
        this.label = "JS-Eden Notebook";
        this.supportedLanguages = ["jseden"];

        this.Eden = Eden;

        this.setupController()

        this.setupKernel();
    }

    setupController(){
        this.controller = vscode.notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );

        this.controller.supportedLanguages = this.supportedLanguages;
        this.controller.supportsExecutionOrder = true;
        this.controller.executeHandler = this.execute.bind(this);
    }

    setupKernel(){
        this.Eden.projectPath = this.context.extensionPath + "/src/js-eden/";

        this.eden = new this.Eden();

        this.eden.ready.then(()=>{
            this.eden.root.lookup("jseden_parser_cs3").assign(true, this.eden.root.scope, this.Eden.EdenSymbol.defaultAgent);
            this.eden.root.lookup("jseden_parser_cs3").addJSObserver("parser",(sym, value) => {
                if (value) {
                    this.Eden.AST.version = this.Eden.AST.VERSION_CS3;
                } else {
                    this.Eden.AST.version = this.Eden.AST.VERSION_CS2;
                }
            });

            global.eden = this.eden;
            global.EdenSymbol = this.Eden.EdenSymbol;

            this.Eden.Project.newFromExisting("NewProject", this.eden);
        });
    }

    execute(cells){
        cells.forEach(async (cell)=>{
            let execution = this.controller.createNotebookCellExecution(cell);
            execution.executionOrder = ++this._executionOrder;
            execution.start(Date.now());

            let code = cell.document.getText();

            let output = this.executeCell(code, cell.index);

            execution.replaceOutput([
                new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text(output)
                ])
            ]);

            execution.end(true, Date.now());
        });
    }

    addObserverCallback(webview){
        this.webview = webview;

        this.eden.root.lookup("picture").assign(undefined, this.eden.root.scope, this.Eden.EdenSymbol.jsAgent);
        this.eden.root.lookup("picture").addJSObserver("pictureUpdate", (e,v)=>{
            if(this.webview && this.webview.isActive()){
                this.webview.sendMessage(v);
            }
        })
    }

    executeCell(code, cell){
        if(code.startsWith("?")){
            return this.getValue(code.substring(1));
        }
        let myFragment = new this.Eden.Fragment("Cell"+cell, ()=>{
            myFragment.setSourceInitial(code);
            myFragment.makeReal("Cell"+cell);
            myFragment.ast.execute(this.Eden.EdenSymbol.defaultAgent, this.eden.root.scope);
        })
        return ""
    }

    getValue(str){
        return this.eden.root.lookup(str).value();
    }
}

module.exports = {
    JSEdenNotebookKernel
}
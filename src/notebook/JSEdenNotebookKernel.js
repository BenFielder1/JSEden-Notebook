const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const { Eden } = require("../js-eden/js/core/eden.js");
require("./kernelRequirements.js");

class JSEdenNotebookKernel{
    static currentKernel;

    constructor(context){
        this.context = context;
        this.executionOrder = 0;

        this.controllerId = "js-eden-notebook-controller-id";
        this.notebookType = "js-eden-notebook";
        this.label = "JS-Eden Notebook";
        this.supportedLanguages = ["jseden"];

        this.setupController()

        this.setupKernel();

        JSEdenNotebookKernel.currentKernel = this;
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
        const rectangle = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/rectangle.jse"), "utf-8");
        const circle = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/circle.jse"), "utf-8");
        const ellipse = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/ellipse.jse"), "utf-8");
        const line = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/line.jse"), "utf-8");
        const text = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/text.jse"), "utf-8");
        const counter = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/counter.jse"), "utf-8");

        this.Eden = Eden;

        this.Eden.projectPath = this.context.extensionPath + "/src/js-eden/";

        this.eden = new this.Eden();

        this.observables = [];

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
            
            setTimeout(()=>{
                this.executeCell(rectangle, "R");
                this.executeCell(circle, "C");
                this.executeCell(ellipse, "E");
                this.executeCell(line, "L");
                this.executeCell(text, "T");
                this.executeCell(counter, "Counter");
            }, 1000);            
        });
    }

    execute(cells){
        cells.forEach(async (cell)=>{
            let execution = this.controller.createNotebookCellExecution(cell);
            execution.executionOrder = ++this._executionOrder;
            execution.start(Date.now());

            let code = cell.document.getText();

            this.executeCell(code, cell.index);

            execution.end(true, Date.now());
        });
    }

    executeCell(code, cell){
        let myFragment = new this.Eden.Fragment("Cell"+cell, ()=>{
            myFragment.setSourceInitial(code);
            myFragment.makeReal("Cell"+cell);
            myFragment.ast.execute(this.Eden.EdenSymbol.defaultAgent, this.eden.root.scope);
        });

        this.treeview.updateEden(this.eden);
        this.treeview.refresh();
    }

    setWebview(webview, webviewCount){
        let picture = "picture" + webviewCount;

        this.eden.root.lookup(picture).assign(undefined, this.eden.root.scope, this.Eden.EdenSymbol.jsAgent);
        this.eden.root.lookup(picture).addJSObserver(picture + "Update", (e,v)=>{
            if(webview && webview.isActive()){
                webview.sendPicture(v);
            }
        });
    }

    setTreeview(treeview){
        this.treeview = treeview;
    }

    static updateVariableFromSlider(name, value){
        if(JSEdenNotebookKernel.currentKernel){
            let code = name + " = " + value;
            JSEdenNotebookKernel.currentKernel.executeCell(code, 999);
        }
    }
}

module.exports = {
    JSEdenNotebookKernel
}
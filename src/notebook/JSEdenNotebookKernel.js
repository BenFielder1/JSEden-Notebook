const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

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
        const rectangle = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/rectangle.jse"), "utf-8");
        const circle = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/circle.jse"), "utf-8");
        const ellipse = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/ellipse.jse"), "utf-8");
        const line = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/line.jse"), "utf-8");
        const text = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/text.jse"), "utf-8");
        const image = fs.readFileSync(path.join(this.context.extensionPath, "/src/kernel/image.jse"), "utf-8");

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
                this.executeCell(image, "I");
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
    }

    setWebview(webview){
        this.webview = webview;

        this.eden.root.lookup("picture").assign(undefined, this.eden.root.scope, this.Eden.EdenSymbol.jsAgent);
        this.eden.root.lookup("picture").addJSObserver("pictureUpdate", (e,v)=>{
            if(this.webview && this.webview.isActive()){
                this.webview.sendPicture(v);
            }
        });
    }
}

module.exports = {
    JSEdenNotebookKernel
}
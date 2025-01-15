const { Eden } = require("./js-eden/js/core/eden.js");
require("./requirements.js");

let eden;
let jsedenWebView;

function setupKernel(context){
    Eden.projectPath = context.extensionPath + "/src/kernel/js-eden/";

    eden = new Eden();
    
    eden.ready.then(()=>{
        eden.root.lookup("jseden_parser_cs3").assign(true, eden.root.scope, Eden.EdenSymbol.defaultAgent);
        eden.root.lookup("jseden_parser_cs3").addJSObserver("parser",(sym, value) => {
            if (value) {
                Eden.AST.version = Eden.AST.VERSION_CS3;
            } else {
                Eden.AST.version = Eden.AST.VERSION_CS2;
            }
        });

        global.eden = eden;
        global.EdenSymbol = Eden.EdenSymbol;
        
        Eden.Project.newFromExisting("NewProject", eden);
    });
}

function addObserverCallback(webview){
    jsedenWebView = webview;

    eden.root.lookup("picture").assign(undefined, eden.root.scope, Eden.EdenSymbol.jsAgent);
    eden.root.lookup("picture").addJSObserver("pictureUpdate", (e,v)=>{
        if(jsedenWebView && jsedenWebView.isActive()){
            jsedenWebView.sendMessage(v);
        }
    })
}

function getValue(str){
    return eden.root.lookup(str).value();
}
async function exec(str){
    return await eden.exec(str);
}

function executeLine(line){
    exec(line);
    if(line.startsWith("?")){
        return getValue(line.substring(1));
    }
    return "";
}

function executeCell(line, cell){
    if(line.startsWith("?")){
        return getValue(line.substring(1));
    }
    let myFragment = new Eden.Fragment("Cell"+cell, ()=>{
        myFragment.setSourceInitial(line);
        myFragment.makeReal("Cell"+cell);
        myFragment.ast.execute(Eden.EdenSymbol.defaultAgent, eden.root.scope);
    })
    return ""
}

module.exports = {
    setupKernel,
    addObserverCallback,
    executeLine,
    executeCell
}
let CLI;
let jsedenWebView;

function setupKernel(context){
    const { CLIEden } = require('./js-eden/js/cli.js');
    CLI = CLIEden;

    CLI.eden = new CLI.Eden();
    global.eden = CLI.eden;
    CLI.Eden.projectPath = context.extensionPath + "/src/kernel/js-eden/"
    console.log(CLI.Eden.projectPath)

    CLI.initialise();
}

function addObserverCallback(webview){
    jsedenWebView = webview;

    CLI.eden.root.lookup("picture").assign(undefined, CLI.eden.root.scope, CLI.EdenSymbol.jsAgent);
    CLI.eden.root.lookup("picture").addJSObserver("pictureUpdate", (e,v)=>{
        if(jsedenWebView && jsedenWebView.isActive()){
            jsedenWebView.sendMessage(v);
        }
    })
}

function getValue(str){
    return CLI.eden.root.lookup(str).value();
}
async function exec(str){
    return await CLI.eden.exec(str);
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
    let myFragment = new CLI.Eden.Fragment("Cell"+cell, ()=>{
        myFragment.setSourceInitial(line);
        myFragment.makeReal("Cell"+cell);
        myFragment.ast.execute(CLI.EdenSymbol.defaultAgent, CLI.eden.root.scope);
    })
    return ""
}

module.exports = {
    setupKernel,
    addObserverCallback,
    executeLine,
    executeCell
}


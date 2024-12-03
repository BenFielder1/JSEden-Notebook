let CLI;

function setupKernel(){
    const { CLIEden } = require('./js-eden/js/cli.js');
    CLI = CLIEden;

    CLI.eden = new CLI.Eden();
    global.eden = CLI.eden;
    CLI.Eden.projectPath = "./js-eden/"

    CLI.initialise();
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

module.exports = {
    setupKernel,
    executeLine
}


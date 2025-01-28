const vscode = require("vscode");

class JSEdenTreeview{
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(){
        this.eden = null;
    }

    getTreeItem(element){
        return element;
    }
    
    getChildren(){
        return Promise.resolve(this.getItems());
    }

    getItems(){
        let symbols = [];

        if(this.eden == null) return symbols;

        let keys = Object.keys(this.eden.root.symbols);

        keys.forEach((key)=>{
            let symbol = this.eden.root.symbols[key];
            symbols.push(new JSEdenSymbol(symbol.name, symbol.value(), vscode.TreeItemCollapsibleState.None));
        });

        return symbols;
    }


    updateEden(eden){
        this.eden = eden;
    }

    refresh(){
        this._onDidChangeTreeData.fire();
    }
}

class JSEdenSymbol extends vscode.TreeItem{
    constructor(label, value, collapsibleState) {
        super(label, collapsibleState);

        if(value != undefined){
            this.tooltip = `${label} = ${value}`;
            this.description = "= " + value;
        }
        else{
            this.tooltip = `${label}`;
            this.description = "";
        }
    }
}

module.exports = {
    JSEdenTreeview
}
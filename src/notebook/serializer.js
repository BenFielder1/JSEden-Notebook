const { TextDecoder, TextEncoder } = require('util');
const vscode = require("vscode");

class JSEdenNotebookSerializer{
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

module.exports = {
    JSEdenNotebookSerializer
}
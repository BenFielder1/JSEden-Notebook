const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const { JSEdenNotebookKernel } = require("../notebook/JSEdenNotebookKernel");

const html = fs.readFileSync(path.join(__dirname, "./variableSliders.html"), "utf-8");
const sliderTemplate = fs.readFileSync(path.join(__dirname, "./slider-template.html"), "utf-8");

class JSEdenSlidersWebview{
    static currentPanel;

    constructor(context, jsedenTreeview){
        if (JSEdenSlidersWebview.currentPanel) {
            JSEdenSlidersWebview.currentPanel.panel.reveal();
            return;
        }

        this.context = context;
        this.treeview = jsedenTreeview;

        this.panel = vscode.window.createWebviewPanel(
            "js-eden-variable-sliders",
            'JS-Eden Variable Sliders',
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: false,
            }
        );

        this.movingSlider = false;

        this.dontInclude = ["autocalc", "PI", "semicircleAngle", "_time", "view_myscript_current", "mouseX", "mouseY", "book_width", "book_height"];

        this.panel.webview.html = this.renderVariableSlidersFromTemplate();

        this.treeview.onDidChangeTreeData(() => {
            setTimeout(() => {
                if(!this.movingSlider){
                    this.panel.webview.html = this.renderVariableSlidersFromTemplate();
                }
            }, 100);
        });

        this.panel.onDidChangeViewState((e)=>{
            if(e.webviewPanel.visible){
                this.panel.webview.html = this.renderVariableSlidersFromTemplate();
            }
        });

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case "updateVariable":
                        JSEdenNotebookKernel.updateVariableFromSlider(message.variable, message.value);
                        break;
                    case "movingSlider":
                        this.movingSlider = message.value;
                        break;
                }
            },
            null,
            null
        );

        this.panel.onDidDispose(() => this.panel.dispose(), null, null);

        JSEdenSlidersWebview.currentPanel = this;
    }

    renderVariableSlidersFromTemplate() {
        if (!this.treeview || !this.panel.webview) {
            return;
        }

        const filteredTreeItems = this.treeview.getItems().filter(item => typeof item.value === typeof 1 && !this.dontInclude.includes(item.label));

        const variablesForSliders = filteredTreeItems.map(item => ({
            name: item.label,
            value: item.value
        }));

        const slidersHtml = variablesForSliders.map(variable => {
            return sliderTemplate
                .replace(/{{name}}/g, variable.name)
                .replace(/{{value}}/g, variable.value);
        }).join('');

        const finalHtml = html.replace(/{{sliders}}/g, slidersHtml);

        return finalHtml;
    }
}

module.exports = {
    JSEdenSlidersWebview
}
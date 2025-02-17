const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "./variableSliders.html"), "utf-8");
const sliderTemplate = fs.readFileSync(path.join(__dirname, "./slider-template.html"), "utf-8");

class JSEdenSlidersWebview{
    static currentPanel;

    constructor(context){
        if (JSEdenSlidersWebview.currentPanel) {
            JSEdenSlidersWebview.currentPanel.panel.reveal();
            return;
        }

        this.context = context;

        this.panel = vscode.window.createWebviewPanel(
            "js-eden-variable-sliders",
            'JS-Eden Variable Sliders',
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
            }
        );

        this.panel.webview.html = this.getHtmlForWebview();

        this.panel.onDidDispose(() => this.panel.dispose(), null, null);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'updateVariable':
                        // Handle variable update
                        console.log(`Variable ${message.variable} updated to ${message.value}`);
                        return;
                }
            },
            null,
            null
        );

        JSEdenSlidersWebview.currentPanel = this.panel;
    }

    getHtmlForWebview() {
        // Get variables from your notebook or other source
        const variables = [
            { name: 'x', value: 42 },
            { name: 'y', value: 10 }
        ];

        // Generate sliders HTML using the template
        const slidersHtml = variables.map(variable => {
            return sliderTemplate
                .replace(/{{name}}/g, variable.name)
                .replace(/{{value}}/g, variable.value);
        }).join('');

        // Insert the sliders into the main template
        const finalHtml = html.replace(/{{sliders}}/g, slidersHtml);

        return finalHtml;
    }

    updateVariables(variables) {
        this.panel.webview.postMessage({
            command: 'updateVariables',
            variables: variables
        });
    }
}

module.exports = {
    JSEdenSlidersWebview
}
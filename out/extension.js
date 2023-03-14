"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const HelloWorldPanel_1 = require("./panels/HelloWorldPanel");
const getHandlers_1 = require("./utilities/getHandlers");
function activate(context) {
    // Create output channel.
    const outputChannel = vscode.window.createOutputChannel("Move2Kube");
    (0, getHandlers_1.setOutputChannelForDesktopCommands)(outputChannel);
    // Create the show hello world command
    const showHelloWorldCommand = vscode.commands.registerCommand("m2k.showHelloWorld", () => {
        HelloWorldPanel_1.HelloWorldPanel.render(context.extensionUri);
    });
    // `plan` command.
    const planCommand = vscode.commands.registerCommand("m2k.plan", getHandlers_1.makePlan);
    // `transform` command.
    const transformCommand = vscode.commands.registerCommand("m2k.transform", () => {
        vscode.window.showInformationMessage("Transform command initiated.");
    });
    // Add command to the extension context
    context.subscriptions.push(showHelloWorldCommand);
    context.subscriptions.push(transformCommand);
    context.subscriptions.push(planCommand);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
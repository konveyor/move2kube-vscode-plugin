import * as vscode from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { makePlan, setOutputChannelForDesktopCommands } from "./utilities/getHandlers";

export function activate(context: vscode.ExtensionContext) {
  // Create output channel.
  const outputChannel = vscode.window.createOutputChannel("Move2Kube");
  setOutputChannelForDesktopCommands(outputChannel);

  // Create the show hello world command
  const showHelloWorldCommand = vscode.commands.registerCommand("m2k.showHelloWorld", () => {
    HelloWorldPanel.render(context.extensionUri);
  });

  // `plan` command.
  const planCommand = vscode.commands.registerCommand("m2k.plan", makePlan);

  // `transform` command.
  const transformCommand = vscode.commands.registerCommand("m2k.transform", () => {
    vscode.window.showInformationMessage("Transform command initiated.");
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
  context.subscriptions.push(transformCommand);
  context.subscriptions.push(planCommand);
}

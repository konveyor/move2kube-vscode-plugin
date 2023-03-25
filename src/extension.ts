import * as vscode from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { getLatestVersionFromGithub, isCLIInstalled } from "./utilities/checkCLI";
import {
  checkForUpdates,
  createTransform,
  makePlan,
  setOutputChannelForDesktopCommands,
} from "./utilities/getHandlers";

export async function activate(context: vscode.ExtensionContext) {
  // https://move2kube.konveyor.io/releaseinfo.json

  // Create output channel.
  const outputChannel = vscode.window.createOutputChannel("Move2Kube");
  setOutputChannelForDesktopCommands(outputChannel);

  // Check if `move2kube` is installed or not.
  if (!(await isCLIInstalled("0.3.6"))) {
    vscode.window.showErrorMessage(
      `move2kube is not installed or installed version is not compatible with the current system.`
    );
  } else {
    vscode.window.showInformationMessage(`move2kube is installed and is compatible.`);
  }

  //Check for updates.
  const checkForUpdatesCommand = vscode.commands.registerCommand(
    "m2k.checkForUpdates",
    checkForUpdates
  );

  // Create the show hello world command
  const showHelloWorldCommand = vscode.commands.registerCommand("m2k.showHelloWorld", () => {
    HelloWorldPanel.render(context.extensionUri);
  });

  // `plan` command.
  const planCommand = vscode.commands.registerCommand("m2k.plan", makePlan);

  // `transform` command.
  const transformCommand = vscode.commands.registerCommand("m2k.transform", createTransform);

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
  context.subscriptions.push(transformCommand);
  context.subscriptions.push(planCommand);
  context.subscriptions.push(checkForUpdatesCommand);
}

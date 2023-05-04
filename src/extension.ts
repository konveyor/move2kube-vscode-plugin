import * as vscode from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { isCLIInstalled } from "./utilities/checkCLI";
import {
  addHelmChartOption,
  checkForUpdates,
  createCustomizationTransform,
  createTransform,
  makePlan,
  transformAllOptions,
} from "./utilities/getHandlers";

import { setOutputChannelForDesktopCommands } from "./utilities/utils";

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

  // `transform` command with customizations.
  const customizationTransformCommand = vscode.commands.registerCommand(
    "m2k.customizationTransform",
    createCustomizationTransform
  );

  // `transform` command with all options.
  const allOptionsTransformCommand = vscode.commands.registerCommand(
    "m2k.transformAllOptions",
    transformAllOptions
  );

  // `addHelmChart` option.
  const addHelmChartCommand = vscode.commands.registerCommand(
    "m2k.addHelmChart",
    addHelmChartOption
  );

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
  context.subscriptions.push(transformCommand);
  context.subscriptions.push(customizationTransformCommand);
  context.subscriptions.push(planCommand);
  context.subscriptions.push(allOptionsTransformCommand);
  context.subscriptions.push(addHelmChartCommand);
  context.subscriptions.push(checkForUpdatesCommand);
}

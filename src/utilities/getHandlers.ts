import * as vscode from "vscode";
import * as child_process from "child_process";
import { getLatestVersionFromGithub } from "./checkCLI";

let outputChannel: vscode.OutputChannel;

export function setOutputChannelForDesktopCommands(oc: vscode.OutputChannel) {
  outputChannel = oc;
}

export function getTerminalForDesktopCommands() {
  return vscode.window.createTerminal({
    name: "Move2Kube",
  });
}

export async function makePlan(uri: vscode.Uri | undefined) {
  try {
    vscode.window.showInformationMessage(`Move2Kube: Running plan command...`);

    const cwd =
      uri?.fsPath ||
      (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath) ||
      process.cwd();

    outputChannel.show();
    outputChannel.clear();

    const result = child_process.spawn("move2kube", ["plan"], { cwd }); // async spawn

    result.stdout.on("data", (data) => {
      outputChannel.appendLine(data.toString());
    });

    result.stderr.on("data", (data) => {
      outputChannel.appendLine(data.toString());
    });

    result.on("exit", () =>
      vscode.window.showInformationMessage(`Successfully generated plan for ${cwd} directory.`)
    );
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to generate plan.\n [ERROR] : ${err}`);
  }
  return false; // Maybe remove this return statement.
}

export async function createTransform(uri: vscode.Uri | undefined) {
  try {
    vscode.window.showInformationMessage(`Move2Kube: Starting transform command...`); // TODO: Window should fade away.

    const terminal = getTerminalForDesktopCommands();
    const cwd =
      uri?.fsPath ||
      (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath) ||
      process.cwd();

    terminal.show();
    terminal.sendText(`move2kube transform -s ${cwd}`);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to run transform.\n [ERROR] : ${err}`);
  }
  return false; // Maybe remove this return statement.
}

export async function checkForUpdates() {
  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Checking for updates...",
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ increment: 0 });
          const latestVersion = await getLatestVersionFromGithub();
          vscode.window.showInformationMessage(`Latest Version is : ${latestVersion}`);
        } catch (error) {
          vscode.window.showErrorMessage("Error checking for updates");
        }
      }
    );
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to check for updates.\n [ERROR] : ${err}`);
  }
  return false;
}

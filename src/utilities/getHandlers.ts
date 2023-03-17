import * as vscode from "vscode";
import * as child_process from "child_process";

let outputChannel: vscode.OutputChannel;

export function setOutputChannelForDesktopCommands(oc: vscode.OutputChannel) {
  outputChannel = oc;
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

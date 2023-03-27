import { title } from "process";
import * as vscode from "vscode";

let outputChannel: vscode.OutputChannel;

export function setOutputChannelForDesktopCommands(oc: vscode.OutputChannel) {
  outputChannel = oc;
}

export function getTerminalForDesktopCommands() {
  return vscode.window.createTerminal({
    name: "Move2Kube",
  });
}

export async function selectFolder(title: string | ""): Promise<string | undefined> {
  const options: vscode.OpenDialogOptions = {
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: `Select Folder`,
    title: title,
  };
  const result = await vscode.window.showOpenDialog(options);

  if (result && result.length > 0) {
    const folderPath = result[0].fsPath;
    return folderPath;
  }

  // If the user does not select any folder, return undefined.
  return undefined;
}

export function showTimedInformationMessage(message: string, duration: number): void {
  const closeMessageItem: vscode.MessageItem = { title: "Close" };
  const promise = vscode.window.showInformationMessage(message, closeMessageItem);

  const timeout = setTimeout(() => {
    promise.then((selectedItem) => {
      if (!selectedItem) {
        vscode.commands.executeCommand("workbench.action.closeMessages");
      }
    });
  }, duration);

  promise.then((selectedItem) => {
    if (selectedItem === closeMessageItem) {
      clearTimeout(timeout);
    }
  });
}

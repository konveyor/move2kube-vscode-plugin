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

export async function selectFile(title: string | ""): Promise<string | undefined> {
  const options: vscode.OpenDialogOptions = {
    canSelectFolders: false,
    canSelectFiles: true,
    canSelectMany: false,
    openLabel: `Select File`,
    title: title,
  };
  const result = await vscode.window.showOpenDialog(options);

  if (result && result.length > 0) {
    const filePath = result[0].fsPath;
    return filePath;
  }

  // If the user does not select any folder, return undefined.
  return undefined;
}

export async function getUserConfigOption(): Promise<string[]> {
  const selectFileOption = "Select File";
  const enterInTerminalOption = "Answer config in terminal";
  const skipOption = "Skip : Uses default";

  const userChoice = await vscode.window.showQuickPick(
    [selectFileOption, enterInTerminalOption, skipOption],
    { placeHolder: "Select how you would like to add config details" }
  );

  let args: string[] = [];

  switch (userChoice) {
    case selectFileOption:
      const fileUri = await selectFile("Select <config>.yaml file");
      if (fileUri) {
        args.push("-f", fileUri);
      }
      break;
    case enterInTerminalOption:
      // Run the command with default arguments.
      break;
    case skipOption:
      args.push("--qa-skip");
      break;
    default:
      // Running the command with default arguments. Same as "enterInTerminalOption" as it gives the user to answer the questions and modify the config.
      break;
  }

  return args;
}

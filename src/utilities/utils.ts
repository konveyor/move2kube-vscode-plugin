import path = require("path");
import fs = require("fs");

import * as vscode from "vscode";
import * as os from "os";
import { defaultProjectName, pluginOutput } from "./constants";

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

// Maybe remove this.
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
  const selectFileOption = "No, I will provide a config file";
  const enterInTerminalOption = "Yes (default)";
  const skipOption = "Skip all questions";

  const userChoice = await vscode.window.showQuickPick(
    [enterInTerminalOption, selectFileOption, skipOption],
    {
      placeHolder:
        "Move2Kube will ask a few questions, do you want to answer them in the terminal?",
    }
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

export async function getProjectName(): Promise<string> {
  const userInput = await vscode.window.showInputBox({
    value: defaultProjectName,
    prompt: `Specify the project name. (or press Enter for ${defaultProjectName})`,
  });

  return userInput ? userInput : defaultProjectName;
}

export async function showOutputFolderInWorkspace(path: string) {
  const yes = "Yes";
  const no = "No";

  const userChoice = await vscode.window.showQuickPick([yes, no], {
    placeHolder: "Do you wish to add the output folder to workspace?",
  });

  switch (userChoice) {
    case yes:
      updateVSCodeWorkspaceFolders(vscode.Uri.file(path));
    default:
      break;
  }
}

export function updateVSCodeWorkspaceFolders(path: vscode.Uri) {
  const { workspaceFolders } = vscode.workspace;
  vscode.workspace.updateWorkspaceFolders(workspaceFolders ? workspaceFolders.length : 0, 0, {
    uri: path,
  });
}

export function posixToWindowsPath(posixPath: string): string {
  const posix = path.posix;
  const win32 = path.win32;

  const parsedPosixPath = posix.parse(posixPath);
  const convertedPath = win32.format(parsedPosixPath);

  return convertedPath;
}

/*
Terminal: vscode.Terminal is used for creating and moving between directories.
cwd: The source folder on which "transform" or other command is clicked. It is needed as the output folder should be
generated in the same level as source.
*/
export function changeOutputLocation(
  terminal: vscode.Terminal,
  cwd: string,
  projectName: string = defaultProjectName
): string {
  // All generated output is stored in a folder name defined by variable `pluginOutput/projectName`.
  const outputFolder = path.join(cwd, "..", pluginOutput, projectName);

  const mkdirCommand =
    os.platform() === "win32"
      ? `mkdir ${posixToWindowsPath(outputFolder)}`
      : `mkdir -p ${outputFolder}`;

  const cdCommand =
    os.platform() === "win32" ? `cd ${posixToWindowsPath(outputFolder)}` : `cd ${outputFolder}`;

  if (!fs.existsSync(outputFolder)) {
    terminal.sendText(`${mkdirCommand}`);
  }
  terminal.sendText(`${cdCommand}`);
  return outputFolder;
}
export async function copyDirectory(sourceUri: vscode.Uri, destUri: vscode.Uri): Promise<void> {
  try {
    await vscode.workspace.fs.copy(sourceUri, destUri, { overwrite: true });
  } catch (error) {
    if (error instanceof vscode.FileSystemError) {
      if (error.code === "FileNotFound") {
        vscode.window.showErrorMessage(
          `Failed to copy '${sourceUri.path}' to '${destUri.path}': Source not found.`
        );
      } else if (error.code === "PermissionDenied") {
        vscode.window.showErrorMessage(
          `Failed to copy '${sourceUri.path}' to '${destUri.path}': Permission denied.`
        );
      } else {
        vscode.window.showErrorMessage(
          `Failed to copy '${sourceUri.path}' to '${destUri.path}': ${error.message}`
        );
      }
    } else {
      vscode.window.showErrorMessage(
        `Failed to copy '${sourceUri.path}' to '${destUri.path}': ${(<Error>error).message}`
      );
    }
  }
}

export function showTimedStatusBarItem(
  message: string,
  timeout: number = 10000,
  steps: number = 15
) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.text = message;
  statusBarItem.color = "#ffffff";
  statusBarItem.show();

  let opacity = 1.0;
  let step = 0;

  const fadeOut = setInterval(() => {
    opacity = 1.0 - step / steps;
    statusBarItem.color = `rgba(255, 255, 255, ${opacity})`;
    step++;
    if (step >= steps) {
      clearInterval(fadeOut);
      statusBarItem.hide();
    }
  }, timeout / steps);
}

export async function addHelmChart(path: string): Promise<string | undefined> {
  const yes = "Yes";
  const no = "No";
  const userChoice = await vscode.window.showQuickPick([yes, no], {
    placeHolder: "Do you wish to add the helm chart folder to project?",
  });
  switch (userChoice) {
    case yes:
      return path;
    default:
      return undefined;
  }
}

export async function createTempDir(): Promise<vscode.Uri | undefined> {
  const tempDirName = `m2k-temp-dir-${Date.now()}`;
  const tempDirUri = vscode.Uri.file(path.join(os.tmpdir(), tempDirName));
  await vscode.workspace.fs.createDirectory(tempDirUri);
  return tempDirUri;
}

import * as vscode from "vscode";
import * as child_process from "child_process";
import { getLatestVersionFromGithub } from "./checkCLI";
import {
  changeOutputLocation,
  copyDirectory,
  createTempDir,
  getProjectName,
  getTerminalForDesktopCommands,
  getUserConfigOption,
  posixToWindowsPath,
  selectFile,
  selectFolder,
  showOutputFolderInWorkspace,
  showTimedInformationMessage,
  showTimedStatusBarItem,
} from "./utils";
import path = require("path");
import os = require("os");
import { defaultProjectName, pluginOutput } from "./constants";

let outputChannel: vscode.OutputChannel;

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
          showTimedInformationMessage(
            `Latest version for move2kube is : ${latestVersion}.\n If you wish to update to the latest version, please visit: https://move2kube.konveyor.io/installation/ `,
            5000
          );
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

export async function makePlan(uri: vscode.Uri | undefined) {
  try {
    showTimedStatusBarItem(`Move2Kube: Running plan command...`);

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
      showTimedInformationMessage(`Successfully generated plan for ${cwd} directory.`, 3000)
    );
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to generate plan.\n [ERROR] : ${err}`);
  }
  return false; // Maybe remove this return statement.
}

export async function createTransform(uri: vscode.Uri | undefined) {
  try {
    showTimedStatusBarItem(`Move2Kube: Starting transform command...`);
    const terminal = getTerminalForDesktopCommands();
    const cwd =
      uri?.fsPath ||
      (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath) ||
      process.cwd();

    let command = `move2kube transform -s ${cwd}`;
    const args = await getUserConfigOption();

    const outputPath = changeOutputLocation(terminal, cwd);
    vscode.window.showInformationMessage(
      `Move2Kube output will be generated in ${outputPath} location.`
    );

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(cwd));
    if (workspaceFolder && workspaceFolder.uri.fsPath === cwd) {
      await showOutputFolderInWorkspace(outputPath);
    }

    if (args.length > 0) {
      command += ` ${args.join(` `)}`;
    }

    terminal.show();
    terminal.sendText(command);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to run transform.\n [ERROR] : ${err}`);
  }
  return false; // Maybe remove this return statement.
}

export async function createCustomizationTransform(uri: vscode.Uri | undefined) {
  try {
    showTimedStatusBarItem(`Move2Kube: Starting transform command with customizations...`);
    const terminal = getTerminalForDesktopCommands();
    const cwd =
      uri?.fsPath ||
      (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath) ||
      process.cwd();

    const customizationFolder = await selectFolder("Select customization folder");

    // If the user presses ESC key or does not select any folder, exit the process.
    if (customizationFolder === undefined) {
      vscode.window.showWarningMessage(
        `Move2Kube will exit the transform process since customization folder is not selected.`
      );
      return;
    }

    let command = `move2kube transform -s ${cwd} -c ${customizationFolder}`;

    const args = await getUserConfigOption();

    const outputPath = changeOutputLocation(terminal, cwd);
    vscode.window.showInformationMessage(
      `Move2Kube output will be generated in ${outputPath} location.`
    );

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(cwd));
    if (workspaceFolder && workspaceFolder.uri.fsPath === cwd) {
      await showOutputFolderInWorkspace(outputPath);
    }

    if (args.length > 0) {
      command += ` ${args.join(` `)}`;
    }

    terminal.show();
    terminal.sendText(command);
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to run transform with customizations.\n [ERROR] : ${err}`
    );
  }
  return false;
}

export async function addHelmChartOption(uri: vscode.Uri | undefined) {
  try {
    showTimedStatusBarItem(`Move2Kube: Generating helm chart using transform...`);
    const terminal = getTerminalForDesktopCommands();
    const cwd =
      uri?.fsPath ||
      (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath) ||
      process.cwd();

    let command = `move2kube transform -s ${cwd}`;
    const args = await getUserConfigOption();

    // Create a temporary folder.
    const tempDirUri = await createTempDir();
    if (tempDirUri !== undefined) {
      args.push("--output", tempDirUri.fsPath);
    } else {
      vscode.window.showErrorMessage(
        `Error creating temporary directory which is necessary for running this move2kube option.`
      );
      return;
    }

    if (args.length > 0) {
      command += ` ${args.join(` `)}`;
    }
    // Here, we are using temp folder as our directory where transformation will be generated.
    terminal.show();
    terminal.sendText(command, false);
    terminal.sendText("; exit");

    // For now its '/myproject'. Later change it with "project name" if you are allowing users to change the output folder name.
    let helmChartPath = tempDirUri?.fsPath + "/myproject/deploy/yamls-parameterized/helm-chart";
    if (os.platform() === "win32") {
      helmChartPath = posixToWindowsPath(helmChartPath);
    }

    const disposeToken = vscode.window.onDidCloseTerminal(async (closedTerminal) => {
      if (closedTerminal === terminal) {
        disposeToken.dispose();
        if (terminal.exitStatus !== undefined) {
          await copyDirectory(
            vscode.Uri.file(helmChartPath),
            vscode.Uri.file(path.join(cwd, "..", pluginOutput, "helm-chart"))
          );
        } else {
          vscode.window.showErrorMessage(`Terminal exited with undefined status.`);
        }
      }
    });

    // Delete the temporary folder.
    await vscode.workspace.fs.delete(tempDirUri, { recursive: true, useTrash: false });
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to run transform with addHelmChartOption.\n [ERROR] : ${err}`
    );
  }
}

export async function transformAllOptions(uri: vscode.Uri | undefined) {
  try {
    showTimedStatusBarItem(`Move2Kube: Starting transform command with all options.`);
    const terminal = getTerminalForDesktopCommands();
    const cwd =
      uri?.fsPath ||
      (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath) ||
      process.cwd();

    let command = `move2kube transform -s ${cwd}`;

    // TODO: Refactor this. It somehow feels weird to start with getUserConfigOption every time.
    const args = await getUserConfigOption();

    const projectName = await getProjectName();
    if (projectName !== defaultProjectName) {
      args.push("--name", projectName);
    }

    const planPath = await selectFile(`Specify a plan to to execute. (default "m2k.plan")`);
    if (planPath !== undefined) {
      args.push("--plan", planPath);
    }

    const transformSelector = await selectFile(`Specify the transform selector.`);
    if (transformSelector !== undefined) {
      args.push("--transformer-selector", transformSelector);
    }

    let outputDirectory = await selectFolder(
      "Path for Output. Default will be directory with project name."
    );

    if (outputDirectory === undefined) {
      outputDirectory = cwd;
    }

    let outputPath = changeOutputLocation(terminal, outputDirectory);
    vscode.window.showInformationMessage(outputPath);
    await showOutputFolderInWorkspace(outputPath);

    if (args.length > 0) {
      command += ` ${args.join(` `)}`;
    }

    vscode.window.showInformationMessage(
      `Move2Kube output will be generated in ${outputDirectory} location.`
    );

    terminal.show();
    terminal.sendText(command);
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to run transform with customizations.\n [ERROR] : ${err}`
    );
  }
  return false;
}

import * as https from "https";
import * as child_process from "child_process";
import * as vscode from "vscode";
import axios from "axios";
import { cliName, reponame } from "./constants";

export async function getLatestVersionFromGithub(): Promise<string> {
  const response = await axios.get(`https://api.github.com/repos/${reponame}/releases/latest`, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const latestVersion = response.data.tag_name.replace(/^v/, "");
  return latestVersion;
}

export async function isCLIInstalled(expectedVersion: string): Promise<boolean> {
  try {
    let result: string | undefined;
    // let latestVersion: string | undefined;
    result = child_process.execSync(`${cliName} version`).toString().trim();

    const installedVersion = result?.match(/\d+\.\d+\.\d+/)?.[0];
    vscode.window.showInformationMessage(`Installed Version is : ${installedVersion}`);
    if (!installedVersion) {
      return false;
    }

    const [installedMajor, installedMinor, installedPatch] = installedVersion
      .split(".")
      .map(Number);

    vscode.window.showInformationMessage(`installedMinor: ${installedMinor}`);
    vscode.window.showInformationMessage(`installedMajor: ${installedMajor}`);
    vscode.window.showInformationMessage(`installedPatch: ${installedPatch}`);
    const [expectedMajor, expectedMinor, expectedPatch] = expectedVersion.split(".").map(Number);

    if (
      installedMajor !== expectedMajor ||
      installedMinor < expectedMinor ||
      (installedMinor === expectedMinor && installedPatch < expectedPatch)
    ) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

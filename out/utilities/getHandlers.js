"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePlan = exports.setOutputChannelForDesktopCommands = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
let outputChannel;
function setOutputChannelForDesktopCommands(oc) {
    outputChannel = oc;
}
exports.setOutputChannelForDesktopCommands = setOutputChannelForDesktopCommands;
function makePlan(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            vscode.window.showInformationMessage(`Move2Kube: Running plan command...`);
            const cwd = (uri === null || uri === void 0 ? void 0 : uri.fsPath) ||
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
            result.on("exit", () => vscode.window.showInformationMessage(`Successfully generated plan for ${cwd} directory.`));
        }
        catch (err) {
            vscode.window.showErrorMessage(`Failed to generate plan.\n [ERROR] : ${err}`);
        }
        return false; // Maybe remove this return statement.
    });
}
exports.makePlan = makePlan;
//# sourceMappingURL=getHandlers.js.map
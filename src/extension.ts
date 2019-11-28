// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from "fs";
import * as path from "path";
import { FileSystemWatcher, RelativePattern, window, workspace, WorkspaceFolder } from "vscode";

import { pathExists } from "./utils/common";
import WdioSnapshotTreeProvider from "./WdioSnapshotTreeProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate() {
  const initialRootPath: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];

  activateWdioTree(initialRootPath);
  workspace.onDidChangeWorkspaceFolders(() => {
    const updatedRootPath: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];
    activateWdioTree(updatedRootPath);
  });
  
  function activateWdioTree(rootPath: WorkspaceFolder | undefined): void {
    const treeProvider: WdioSnapshotTreeProvider = new WdioSnapshotTreeProvider(rootPath ? rootPath.uri.fsPath : undefined);
    window.registerTreeDataProvider("terraWdioHelper", treeProvider);

    if (rootPath) {
      const fileSystemWatcher: FileSystemWatcher = workspace.createFileSystemWatcher(path.join(rootPath.uri.fsPath, '**').replace(/\\/g, '/'));
      fileSystemWatcher.onDidChange(() => treeProvider.refresh());
      fileSystemWatcher.onDidDelete(() => treeProvider.refresh());
      fileSystemWatcher.onDidCreate(() => treeProvider.refresh());
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}

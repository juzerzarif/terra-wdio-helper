// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import { commands, Disposable, ExtensionContext, FileSystemWatcher, window, workspace, WorkspaceFolder } from "vscode";

import { SnapshotWebviewOptions } from "./models/interfaces";
import WdioSnapshot from "./models/wdioSnapshot";
import WdioSpec from "./models/wdioSpec";
import { deleteDiffSnapshots, deleteSnapshot } from "./utils/snapshotUtils";
import { deleteDiffSpecs, deleteSpec } from "./utils/specUtils";
import WdioSnapshotPanel from "./WdioSnapshotPanel";
import WdioSnapshotTreeProvider from "./WdioSnapshotTreeProvider";
import ContextStore from "./models/ContextStore";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  ContextStore.storeContext(context);
  const initialRootPath: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];

  activateWdioTree(initialRootPath);
  workspace.onDidChangeWorkspaceFolders(() => {
    const updatedRootPath: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];
    activateWdioTree(updatedRootPath);
  });
  
  function activateWdioTree(rootPath: WorkspaceFolder | undefined): void {
    const treeProvider: WdioSnapshotTreeProvider = new WdioSnapshotTreeProvider(rootPath ? rootPath.uri.fsPath : undefined);
    window.registerTreeDataProvider("terraWdioHelper", treeProvider);
    const displaySnapshotDisposable: Disposable = commands.registerCommand(
      'terraWdioHelper.displaySnapshot',
      (snapshot: SnapshotWebviewOptions): void => WdioSnapshotPanel.createOrShow(snapshot)
    );
    const deleteSnapshotDisposable: Disposable = commands.registerCommand(
      'terraWdioHelper.deleteSnapshot',
      (snapshot: WdioSnapshot): void => deleteSnapshot(snapshot)
    );
    const deleteDiffSnapshotDisposable: Disposable = commands.registerCommand(
      'terraWdioHelper.deleteDiffSnapshot',
      (snapshot: WdioSnapshot): void => deleteDiffSnapshots(snapshot)
    );
    const deleteSpecDisposable: Disposable = commands.registerCommand(
      'terraWdioHelper.deleteSpec',
      (spec: WdioSpec): void => deleteSpec(spec)
    );
    const deleteDiffSpecDisposable: Disposable = commands.registerCommand(
      'terraWdioHelper.deleteDiffSpec',
      (spec: WdioSpec): void => deleteDiffSpecs(spec)
    );
    const refreshTreeDisposable: Disposable = commands.registerCommand(
      'terraWdioHelper.refreshSnapshotTree',
      (): void => treeProvider.refresh()
    );

    if (rootPath) {
      const fileSystemWatcher: FileSystemWatcher = workspace.createFileSystemWatcher(path.join(rootPath.uri.fsPath, '**').replace(/\\/g, '/'));
      fileSystemWatcher.onDidChange(() => treeProvider.refresh(), null, context.subscriptions);
      fileSystemWatcher.onDidDelete(() => treeProvider.refresh(), null, context.subscriptions);
      fileSystemWatcher.onDidCreate(() => treeProvider.refresh(), null, context.subscriptions);
    }

    context.subscriptions.push(
      displaySnapshotDisposable,
      deleteSnapshotDisposable,
      deleteDiffSnapshotDisposable,
      deleteSpecDisposable,
      deleteDiffSpecDisposable,
      refreshTreeDisposable);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}

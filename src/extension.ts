import * as path from 'path';

import { Disposable, ExtensionContext, FileSystemWatcher, WorkspaceFolder, commands, window, workspace } from 'vscode';

import ContextStore from './utils/ContextStore';
import WdioSnapshot from './models/WdioSnapshot';
import WdioSnapshotPanel from './WdioSnapshotPanel';
import WdioSnapshotTreeProvider from './WdioSnapshotTreeProvider';
import WdioSpec from './models/WdioSpec';
import { SnapshotWebviewOptions } from './models/interfaces';
import { deleteDiffSnapshots, deleteSnapshot } from './utils/snapshotUtils';
import { deleteDiffSpecs, deleteSpec } from './utils/specUtils';

function activateWdioTree(rootPath: WorkspaceFolder | undefined, context: ExtensionContext): void {
  const treeProvider: WdioSnapshotTreeProvider = new WdioSnapshotTreeProvider(
    rootPath ? rootPath.uri.fsPath : undefined
  );
  window.registerTreeDataProvider('terraWdioHelper', treeProvider);
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
  const refreshTreeDisposable: Disposable = commands.registerCommand('terraWdioHelper.refreshSnapshotTree', (): void =>
    treeProvider.refresh()
  );

  if (rootPath) {
    const fileSystemWatcher: FileSystemWatcher = workspace.createFileSystemWatcher(
      path.join(rootPath.uri.fsPath, '**').replace(/\\/g, '/')
    );
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
    refreshTreeDisposable
  );
}

export function activate(context: ExtensionContext): void {
  ContextStore.storeContext(context);
  const initialRootPath: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];

  activateWdioTree(initialRootPath, context);
  workspace.onDidChangeWorkspaceFolders(() => {
    const updatedRootPath: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];
    activateWdioTree(updatedRootPath, context);
  });
}

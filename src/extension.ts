import * as path from 'path';

import { Disposable, ExtensionContext, RelativePattern, commands, window, workspace } from 'vscode';

import ExtensionState from './common/ExtensionState';
import WdioHelperTreeProvider from './tree-view/WdioHelperTreeProvider';
import WdioSnapshot from './tree-view/WdioSnapshot';
import WdioSpec from './tree-view/WdioSpec';
import WdioSpecGroup from './tree-view/WdioSpecGroup';
import WdioWebviewPanel from './webview/WdioWebviewPanel';
import { WdioTreeItem } from './types';
import { deleteResource, deleteWdioResources, replaceReferenceWithLatest } from './common/utils';

export function activate(context: ExtensionContext): void {
  ExtensionState.configureExtensionState(context);
  const treeProvider: WdioHelperTreeProvider = new WdioHelperTreeProvider();
  window.createTreeView<WdioTreeItem>('terraWdioHelper', { treeDataProvider: treeProvider, showCollapseAll: true });

  const openSnapshotDisposable: Disposable = commands.registerCommand(
    'terraWdioHelper.openSnapshot',
    WdioWebviewPanel.createOrShow,
    WdioWebviewPanel
  );
  const deleteResourcesDisposable: Disposable = commands.registerCommand(
    'terraWdioHelper.deleteResources',
    (item: WdioSpec | WdioSnapshot): void => deleteWdioResources(item)
  );
  const deleteDiffResourcesDisposable: Disposable = commands.registerCommand(
    'terraWdioHelper.deleteDiffResources',
    (item: WdioSpec | WdioSnapshot): void => deleteWdioResources(item, true)
  );
  const replaceWithLatestDisposable: Disposable = commands.registerCommand(
    'terraWdioHelper.replaceWithLatest',
    replaceReferenceWithLatest
  );
  const deleteFolderDisposable: Disposable = commands.registerCommand(
    'terraWdioHelper.deleteFolder',
    (item: WdioSpecGroup): void => deleteResource(item.resourceUri.fsPath)
  );
  const deleteDiffFolderDisposable: Disposable = commands.registerCommand(
    'terraWdioHelper.deleteDiffFolder',
    (item: WdioSpecGroup): void => deleteResource(path.join(item.resourceUri.fsPath, 'diff'))
  );
  const refreshTreeDisposable: Disposable = commands.registerCommand('terraWdioHelper.refreshSnapshotTree', (): void =>
    treeProvider.refresh()
  );

  workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('terraWdioHelper')) {
      ExtensionState.configureExtensionState(context);
      if (event.affectsConfiguration('terraWdioHelper.testFolderPath')) {
        treeProvider.refresh();
      }
    }
  });
  workspace.onDidChangeWorkspaceFolders(() => treeProvider.refresh(), null, context.subscriptions);

  workspace.workspaceFolders?.forEach((folder) => {
    const testFolderPath = ExtensionState.configuration.testFolderPath[folder.uri.fsPath];
    const workspaceFolderItem = ExtensionState.workspaceFolderItems.find(
      (folderItem) => folderItem.resourceUri.fsPath === folder.uri.fsPath
    );
    const fsWatcher = workspace.createFileSystemWatcher(
      new RelativePattern(path.join(folder.uri.fsPath, testFolderPath), '**')
    );
    fsWatcher.onDidChange(
      () => {
        treeProvider.refresh(workspaceFolderItem);
        WdioWebviewPanel.updateWebviewPanels();
      },
      null,
      context.subscriptions
    );
  });

  context.subscriptions.push(
    openSnapshotDisposable,
    deleteResourcesDisposable,
    deleteDiffResourcesDisposable,
    replaceWithLatestDisposable,
    deleteFolderDisposable,
    deleteDiffFolderDisposable,
    refreshTreeDisposable
  );
}

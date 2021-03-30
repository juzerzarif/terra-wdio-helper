/* istanbul ignore file */
import * as path from 'path';

import { RelativePattern, commands, window, workspace } from 'vscode';
import type { ExtensionContext } from 'vscode';

import ExtensionState from './common/ExtensionState';
import WdioHelperTreeProvider from './tree-view/WdioHelperTreeProvider';
import WdioWebviewPanel from './webview/WdioWebviewPanel';
import { deleteResource, deleteWdioResources, replaceReferenceWithLatest } from './common/utils';
import type WdioSnapshot from './tree-view/WdioSnapshot';
import type WdioSpec from './tree-view/WdioSpec';
import type WdioSpecGroup from './tree-view/WdioSpecGroup';
import type { WdioTreeItem } from './types';

export function activate(context: ExtensionContext): void {
  ExtensionState.configureExtensionState(context);
  const treeProvider: WdioHelperTreeProvider = new WdioHelperTreeProvider();
  window.createTreeView<WdioTreeItem>('terraWdioHelper', { treeDataProvider: treeProvider, showCollapseAll: true });

  context.subscriptions.push(
    commands.registerCommand('terraWdioHelper.openSnapshot', WdioWebviewPanel.createOrShow, WdioWebviewPanel),
    commands.registerCommand('terraWdioHelper.deleteResources', (item: WdioSpec | WdioSnapshot) =>
      deleteWdioResources(item)
    ),
    commands.registerCommand('terraWdioHelper.deleteDiffResources', (item: WdioSpec | WdioSnapshot) =>
      deleteWdioResources(item, true)
    ),
    commands.registerCommand('terraWdioHelper.replaceWithLatest', replaceReferenceWithLatest),
    commands.registerCommand('terraWdioHelper.deleteFolder', (item: WdioSpecGroup) =>
      deleteResource(item.resourceUri.fsPath)
    ),
    commands.registerCommand('terraWdioHelper.deleteDiffFolder', (item: WdioSpecGroup) =>
      deleteResource(path.join(item.resourceUri.fsPath, 'diff'))
    ),
    commands.registerCommand('terraWdioHelper.refreshSnapshotTree', treeProvider.refresh, treeProvider)
  );

  workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('terraWdioHelper')) {
      ExtensionState.configureExtensionState(context);
      if (event.affectsConfiguration('terraWdioHelper.testFolderPath')) {
        treeProvider.refresh();
        WdioWebviewPanel.updateAllOpenWebviews();
      }
    }
  });
  workspace.onDidChangeWorkspaceFolders(
    () => {
      ExtensionState.configureExtensionState(context);
      treeProvider.refresh();
    },
    null,
    context.subscriptions
  );

  workspace.workspaceFolders?.forEach((folder) => {
    const testFolderPath = ExtensionState.configuration.testFolderPath[folder.uri.fsPath];
    const refreshWdioSnapshots = (): void => {
      /**
       * Scoping a refresh to a workspace folder when there is only one workspace folder is pointless but also
       * will not work for refreshing the tree view because there's no actual WorkspaceFolderItem in the tree in that case.
       */
      const scopeToWorkspace = ExtensionState.workspaceFolderItems.length > 1;
      const scopedWorkspaceFolder = scopeToWorkspace
        ? ExtensionState.workspaceFolderItems.find((folderItem) => folderItem.resourceUri.fsPath === folder.uri.fsPath)
        : undefined;
      treeProvider.refresh(scopedWorkspaceFolder);
      WdioWebviewPanel.updateAllOpenWebviews(scopedWorkspaceFolder);
    };
    const fsWatcher = workspace.createFileSystemWatcher(
      new RelativePattern(path.join(folder.uri.fsPath, testFolderPath), '**')
    );
    // Need to add listeners for all three events because macOS doesn't fire change events on parent directories
    // when a file is created/deleted 😍👍
    fsWatcher.onDidCreate(refreshWdioSnapshots, null, context.subscriptions);
    fsWatcher.onDidChange(refreshWdioSnapshots, null, context.subscriptions);
    fsWatcher.onDidDelete(refreshWdioSnapshots, null, context.subscriptions);
  });
}

import * as path from 'path';

import * as fs from 'fs-extra';
import { TreeItem, TreeItemCollapsibleState, Uri, window } from 'vscode';

import ExtensionState from '../common/ExtensionState';
import ResourceRetriever from '../common/ResourceRetriever';
import { getDirectories } from '../common/utils';

import type WorkspaceFolderItem from './WorkspaceFolder';

class WdioSpecGroup extends TreeItem {
  static getAllWdioSpecGroups(workspaceFolder: WorkspaceFolderItem): WdioSpecGroup[] {
    const workspacePath = workspaceFolder.resourceUri.fsPath;
    const relativeTestFolderPath = ExtensionState.configuration.testFolderPath[workspacePath] || 'tests/wdio';
    const absoluteTestFolderPath = path.join(workspacePath, relativeTestFolderPath);

    if (!fs.existsSync(absoluteTestFolderPath)) {
      window.showErrorMessage(`Test folder path does not exist for workspace folder ${workspacePath}`);
      return [];
    }
    if (!fs.lstatSync(absoluteTestFolderPath).isDirectory()) {
      window.showErrorMessage(`Test folder path is not a directory for workspace folder ${workspacePath}`);
      return [];
    }

    return this.getSpecGroupsInDir(absoluteTestFolderPath, '.');
  }

  private static getSpecGroupsInDir(dirPath: string, labelForRoot?: string): WdioSpecGroup[] {
    const specGroups: WdioSpecGroup[] = [];
    const entries = getDirectories(dirPath);
    entries.forEach((entry) => {
      const absoluteEntryPath = path.join(dirPath, entry);

      if (entry === '__snapshots__') {
        const entryUri = Uri.file(absoluteEntryPath);
        specGroups.push(new WdioSpecGroup(entryUri, labelForRoot));
      } else {
        specGroups.push(...this.getSpecGroupsInDir(absoluteEntryPath));
      }
    });

    return specGroups;
  }

  constructor(public readonly resourceUri: Uri, label?: string) {
    super(resourceUri, TreeItemCollapsibleState.Collapsed);

    this.iconPath = fs.existsSync(path.join(resourceUri.fsPath, 'diff'))
      ? ResourceRetriever.getThemedIcon('folder_diff_icon.svg')
      : ResourceRetriever.getThemedIcon('folder_icon.svg');
    const basename = path.basename(resourceUri.fsPath);
    const secondLastName = path.basename(path.dirname(resourceUri.fsPath));
    this.label = label ?? (basename === '__snapshots__' ? secondLastName : basename);
    this.tooltip = this.label;
  }

  label = '';
  contextValue = 'terraWdioSpecGroup';
}

export default WdioSpecGroup;

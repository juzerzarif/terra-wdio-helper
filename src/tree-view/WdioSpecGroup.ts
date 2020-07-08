import * as fs from 'fs';
import * as path from 'path';

import { TreeItem, TreeItemCollapsibleState, Uri, window } from 'vscode';

import ExtensionState from '../common/ExtensionState';
import ResourceRetriever from '../common/ResourceRetriever';
import { exists } from '../common/utils';

import WorkspaceFolderItem from './WorkspaceFolder';

class WdioSpecGroup extends TreeItem {
  static getAllWdioSpecGroups(workspaceFolder: WorkspaceFolderItem): WdioSpecGroup[] {
    const workspacePath = workspaceFolder.resourceUri.fsPath;
    const relativeTestFolderPath = ExtensionState.configuration?.testFolderPath?.[workspacePath] || 'tests/wdio';
    const absoluteTestFolderPath = path.join(workspacePath, relativeTestFolderPath);

    if (!exists(absoluteTestFolderPath)) {
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
    let specGroups: WdioSpecGroup[] = [];
    const entries = fs.readdirSync(dirPath);
    entries.forEach((entry) => {
      const absoluteEntryPath = path.join(dirPath, entry);

      if (entry === '__snapshots__') {
        const entryUri = Uri.file(absoluteEntryPath);
        specGroups.push(new WdioSpecGroup(entryUri, labelForRoot));
      } else if (fs.lstatSync(absoluteEntryPath).isDirectory()) {
        const folders = this.getSpecGroupsInDir(absoluteEntryPath);
        specGroups = specGroups.concat(folders);
      }
    });

    return specGroups;
  }

  constructor(public readonly resourceUri: Uri, label?: string) {
    super(resourceUri, TreeItemCollapsibleState.Collapsed);

    if (exists(path.join(resourceUri.fsPath, 'diff'))) {
      this.iconPath = ResourceRetriever.getThemedIcon('folder_diff_icon.svg');
    } else {
      this.iconPath = ResourceRetriever.getThemedIcon('folder_icon.svg');
    }
    const basename = path.basename(resourceUri.fsPath);
    const secondLastName = path.basename(path.dirname(resourceUri.fsPath));
    this.label = label ?? (basename === '__snapshots__' ? secondLastName : basename);
    this.tooltip = this.label;
  }

  contextValue = 'terraWdioSpecGroup';
}

export default WdioSpecGroup;

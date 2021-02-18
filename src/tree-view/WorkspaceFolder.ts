import * as path from 'path';

import { TreeItem, TreeItemCollapsibleState, workspace } from 'vscode';
import type { Uri } from 'vscode';

import ResourceRetriever from '../common/ResourceRetriever';

class WorkspaceFolderItem extends TreeItem {
  public static getAllWorkspaceFolderItems = (): WorkspaceFolderItem[] => {
    if (workspace.workspaceFolders) {
      return workspace.workspaceFolders?.map((folder) => {
        return new WorkspaceFolderItem(folder.uri);
      });
    }
    return [];
  };

  constructor(public readonly resourceUri: Uri) {
    super(resourceUri, TreeItemCollapsibleState.Collapsed);

    const folderName = path.basename(resourceUri.fsPath);
    this.label = folderName;
    this.tooltip = folderName;
  }

  label = '';
  contextValue = 'terraWdioWorkspaceFolder';
  iconPath = ResourceRetriever.getThemedIcon('workspace_folder_icon.svg');
}

export default WorkspaceFolderItem;

import { EventEmitter, ProviderResult, TreeDataProvider } from 'vscode';

import ExtensionState from '../common/ExtensionState';
import { WdioTreeItem } from '../types';

import WdioSnapshot from './WdioSnapshot';
import WdioSpec from './WdioSpec';
import WdioSpecGroup from './WdioSpecGroup';
import WorkspaceFolderItem from './WorkspaceFolder';

class WdioHelperTreeProvider implements TreeDataProvider<WdioTreeItem> {
  private readonly treeDataEventEmitter = new EventEmitter<WdioTreeItem>();
  public readonly onDidChangeTreeData = this.treeDataEventEmitter.event;

  refresh(element?: WorkspaceFolderItem): void {
    this.treeDataEventEmitter.fire(element);
  }

  getTreeItem(element: WdioTreeItem): WdioTreeItem {
    return element;
  }

  getChildren(element?: Exclude<WdioTreeItem, WdioSnapshot>): ProviderResult<WdioTreeItem[]> {
    if (!element) {
      const items = WorkspaceFolderItem.getAllWorkspaceFolderItems();
      ExtensionState.workspaceFolderItems = items;
      if (items.length === 1) {
        return this.getChildren(items[0]);
      }
      return items;
    }
    if (element instanceof WorkspaceFolderItem) {
      const items = WdioSpecGroup.getAllWdioSpecGroups(element);
      if (items.length === 1) {
        return this.getChildren(items[0]);
      }
      return items;
    }
    if (element instanceof WdioSpecGroup) {
      return WdioSpec.getAllWdioSpecs(element);
    }

    return WdioSnapshot.getAllWdioSnapshots(element);
  }
}

export default WdioHelperTreeProvider;

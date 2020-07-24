import { EventEmitter, TreeDataProvider } from 'vscode';

import ExtensionState from '../common/ExtensionState';
import { WdioTreeItem } from '../types';

import WdioSnapshot from './WdioSnapshot';
import WdioSpec from './WdioSpec';
import WdioSpecGroup from './WdioSpecGroup';
import WorkspaceFolderItem from './WorkspaceFolder';

class WdioHelperTreeProvider implements TreeDataProvider<WdioTreeItem> {
  private readonly treeDataEventEmitter = new EventEmitter<WdioTreeItem | undefined>();
  public readonly onDidChangeTreeData = this.treeDataEventEmitter.event;

  refresh(element?: WorkspaceFolderItem): void {
    this.treeDataEventEmitter.fire(element);
  }

  getTreeItem(element: WdioTreeItem): WdioTreeItem {
    return element;
  }

  getChildren(element?: Exclude<WdioTreeItem, WdioSnapshot>): WdioTreeItem[] {
    let children: WdioTreeItem[];
    if (!element) {
      const items = WorkspaceFolderItem.getAllWorkspaceFolderItems();
      ExtensionState.workspaceFolderItems = items;
      if (items.length === 1) {
        return this.getChildren(items[0]);
      }
      children = items;
    } else if (element instanceof WorkspaceFolderItem) {
      const items = WdioSpecGroup.getAllWdioSpecGroups(element);
      if (items.length === 1) {
        return this.getChildren(items[0]);
      }
      children = items;
    } else if (element instanceof WdioSpecGroup) {
      children = WdioSpec.getAllWdioSpecs(element);
    } else {
      children = WdioSnapshot.getAllWdioSnapshots(element);
    }

    return children.sort((childA, childB) => {
      // Special case for '.' - should always be the first
      if (childA.label === '.') return -1;
      if (childB.label === '.') return 1;
      return childA.label.localeCompare(childB.label, 'en', { numeric: true });
    });
  }
}

export default WdioHelperTreeProvider;

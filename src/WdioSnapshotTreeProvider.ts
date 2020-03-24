import * as path from 'path';

import { Event, EventEmitter, TreeDataProvider, TreeItem, window, workspace } from 'vscode';

import WdioSnapshot from './models/WdioSnapshot';
import WdioSpec from './models/WdioSpec';
import { getAllSnapshots } from './utils/snapshotUtils';
import { getAllSpecs } from './utils/specUtils';
import { pathExists } from './utils/common';

class WdioSnapshotTreeProvider implements TreeDataProvider<WdioSnapshot | WdioSpec> {
  private _onDidChangeTreeData: EventEmitter<WdioSnapshot | WdioSpec> = new EventEmitter<WdioSnapshot | WdioSpec>();
  readonly onDidChangeTreeData: Event<WdioSnapshot | WdioSpec> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {}

  /**
   * Refreshes the tree starting at root
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Returns the spec or snapshot queried
   * @param element - An element in the tree (either a snapshot or spec)
   */
  getTreeItem(element: WdioSnapshot | WdioSpec): TreeItem {
    return element;
  }

  /**
   * Returns the snapshots under a spec or specs if at root
   * @param element - Spec folder or undefined (for root)
   */
  getChildren(element?: WdioSpec): Thenable<WdioSnapshot[] | WdioSpec[]> {
    const testFolderPath = workspace.getConfiguration('terraWdioHelper').get('wdioTestFolderRelativePath');
    if (!this.workspaceRoot) {
      console.log('No WDIO snapshots found: Empty workspace');
      return Promise.resolve([]);
    }
    if (typeof testFolderPath !== 'string' || !pathExists(path.join(this.workspaceRoot, testFolderPath))) {
      window.showErrorMessage('WDIO test folder path is invalid');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        getAllSnapshots(element).sort((snapshotA, snapshotB) => {
          return snapshotA.label.localeCompare(snapshotB.label, 'en', { numeric: true });
        })
      );
    }

    const referencePath = path.join(this.workspaceRoot, testFolderPath, '__snapshots__', 'reference');
    return Promise.resolve(
      getAllSpecs(referencePath).sort((specA, specB) => {
        return specA.label.localeCompare(specB.label, 'en', { numeric: true });
      })
    );
  }
}

export default WdioSnapshotTreeProvider;

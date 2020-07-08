import { ExtensionContext, workspace } from 'vscode';

import WorkspaceFolderItem from '../tree-view/WorkspaceFolder';
import { ExtensionConfiguration } from '../types';

class ExtensionState {
  private static _configuration = {} as ExtensionConfiguration;
  private static _context: ExtensionContext;
  private static _openSnapshots: string[] = [];

  static workspaceFolderItems: WorkspaceFolderItem[] = [];

  static get configuration(): ExtensionConfiguration {
    return this._configuration;
  }

  static get context(): ExtensionContext {
    return this._context;
  }

  static get openSnapshots(): string[] {
    return this._openSnapshots;
  }

  public static configureExtensionState(context: ExtensionContext): void {
    this._context = context;

    const windowConfig = workspace.getConfiguration('terraWdioHelper');
    this._configuration.defaultSnapshotTab = windowConfig.get('defaultSnapshotTab') ?? 'reference';
    this._configuration.defaultDiffOption = windowConfig.get('defaultDiffOption') ?? 'two-up';
    this._configuration.testFolderPath = {};
    workspace.workspaceFolders?.forEach((folder) => {
      const resourceConfig = workspace.getConfiguration('terraWdioHelper', folder.uri);
      this._configuration.testFolderPath[folder.uri.fsPath] = resourceConfig.get('testFolderPath') ?? 'tests/wdio';
    });
  }

  public static addOpenSnapshot(id: string): void {
    if (!this.openSnapshots.includes(id)) {
      this.openSnapshots.push(id);
    }
  }

  public static removeOpenSnapshot(id: string): void {
    const idIndex = this.openSnapshots.findIndex((_id) => _id === id);
    if (idIndex >= 0) {
      this.openSnapshots.splice(idIndex, 1);
    }
  }
}

export default ExtensionState;

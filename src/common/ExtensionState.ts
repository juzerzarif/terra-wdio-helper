import { ExtensionContext, workspace } from 'vscode';

import WorkspaceFolderItem from '../tree-view/WorkspaceFolder';
import { ExtensionConfiguration } from '../types';

class ExtensionState {
  private static _configuration = {} as ExtensionConfiguration;
  private static _context: ExtensionContext;

  static workspaceFolderItems: WorkspaceFolderItem[] = [];

  static get configuration(): ExtensionConfiguration {
    return this._configuration;
  }

  static get context(): ExtensionContext {
    return this._context;
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
}

export default ExtensionState;

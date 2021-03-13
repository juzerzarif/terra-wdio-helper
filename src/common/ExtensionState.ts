import { workspace } from 'vscode';
import type { ExtensionContext } from 'vscode';
import type { ReadonlyDeep } from 'type-fest';

import type WorkspaceFolderItem from '../tree-view/WorkspaceFolder';
import type { ExtensionConfiguration } from '../types';

class ExtensionState {
  private static _configuration = {} as ExtensionConfiguration;
  private static _context: ExtensionContext;

  static workspaceFolderItems: WorkspaceFolderItem[] = [];

  static get configuration(): ReadonlyDeep<ExtensionConfiguration> {
    return this._configuration;
  }

  static get context(): ExtensionContext {
    return this._context;
  }

  public static configureExtensionState(context: ExtensionContext): void {
    this._context = context;

    const windowConfig = workspace.getConfiguration('terraWdioHelper');
    this._configuration.defaultSnapshotTab = windowConfig.get('defaultSnapshotTab') ?? 'reference';
    this._configuration.fallbackSnapshotTab = windowConfig.get('fallbackSnapshotTab') ?? 'reference';
    this._configuration.defaultDiffOption = windowConfig.get('defaultDiffOption') ?? 'two-up';
    this._configuration.testFolderPath = {};
    workspace.workspaceFolders?.forEach((folder) => {
      const resourceConfig = workspace.getConfiguration('terraWdioHelper', folder.uri);
      this._configuration.testFolderPath[folder.uri.fsPath] = resourceConfig.get('testFolderPath') ?? 'tests/wdio';
    });
  }
}

export default ExtensionState;

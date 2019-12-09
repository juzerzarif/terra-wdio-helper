import * as path from 'path';

import { ExtensionContext } from 'vscode';

import { Themes } from '../models/enums';

import ContextStore from './ContextStore';

class ResourceRetriever {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getFolderIconPath(theme: Themes): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'images', theme, 'folder_icon.svg');
  }

  public static getFolderDiffIconPath(theme: Themes): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'images', theme, 'folder_diff_icon.svg');
  }

  public static getSnapshotIconPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'images', 'snapshot_icon.png');
  }

  public static getSnapshotDiffIconPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'images', 'snapshot_diff_icon.png');
  }

  public static getWebviewPanelIconPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'images', 'webview_icon.svg');
  }

  public static getJsPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'dist', 'index.min.js');
  }

  public static getStylesheetPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) {
      return '';
    }
    return path.join(context.extensionPath, 'resources', 'dist', 'index.min.css');
  }
}

export default ResourceRetriever;

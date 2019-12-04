import * as path from 'path';
import { ExtensionContext } from "vscode";

import ContextStore from "./ContextStore";
import { Themes } from "./enums";

class ResourceRetriever {
  private constructor() {}

  public static getFolderIconPath(theme: Themes): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) { return ''; }
    return path.join(context.extensionPath, 'resources', 'images', theme, 'folder_icon.svg');
  }

  public static getFolderDiffIconPath(theme: Themes): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) { return ''; }
    return path.join(context.extensionPath, 'resources', 'images', theme, 'folder_diff_icon.svg');
  }

  public static getSnapshotIconPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) { return ''; }
    return path.join(context.extensionPath, 'resources', 'images', 'snapshot_icon.png');
  }

  public static getSnapshotDiffIconPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) { return ''; }
    return path.join(context.extensionPath, 'resources', 'images', 'snapshot_diff_icon.png');
  }

  public static getJsPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) { return ''; }
    return path.join(context.extensionPath, 'resources', 'dist', 'index.min.js');
  }

  public static getStylesheetPath(): string {
    const context: ExtensionContext | null = ContextStore.getContext();
    if (!context) { return ''; }
    return path.join(context.extensionPath, 'resources', 'dist', 'index.min.css');
  }
}

export default ResourceRetriever;

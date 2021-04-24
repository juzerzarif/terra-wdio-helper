import * as path from 'path';

import { Uri } from 'vscode';

import type { ThemedIcon } from '../types';

import ExtensionState from './ExtensionState';

class ResourceRetriever {
  public static getThemedIcon(filename: string): ThemedIcon {
    if (!ExtensionState.context) {
      throw new Error('getThemedIcon was called before extension context was set');
    }
    return {
      light: Uri.file(path.join(ExtensionState.context.extensionPath, 'resources/images/light', filename)),
      dark: Uri.file(path.join(ExtensionState.context.extensionPath, 'resources/images/dark', filename)),
    };
  }

  public static getIcon(filename: string): Uri {
    if (!ExtensionState.context) {
      throw new Error('getIcon was called before extension context was set');
    }
    return Uri.file(path.join(ExtensionState.context.extensionPath, 'resources/images', filename));
  }

  public static getDistFile(relativePath: string): Uri {
    if (!ExtensionState.context) {
      throw new Error('getDistFile was called before extension context was set');
    }
    return Uri.file(path.join(ExtensionState.context.extensionPath, 'resources/dist', relativePath));
  }

  public static getFont(filename: string): Uri {
    if (!ExtensionState.context) {
      throw new Error('getFont was called before extension context was set');
    }
    return Uri.file(path.join(ExtensionState.context.extensionPath, 'resources/fonts', filename));
  }
}

export default ResourceRetriever;

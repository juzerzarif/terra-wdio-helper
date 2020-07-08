import * as path from 'path';

import { ThemedIcon } from '../types';

import ExtensionState from './ExtensionState';

class ResourceRetriever {
  public static getThemedIcon(filename: string): ThemedIcon | undefined {
    if (!ExtensionState.context) {
      return;
    }
    return {
      light: path.join(ExtensionState.context.extensionPath, 'resources/images/light', filename),
      dark: path.join(ExtensionState.context.extensionPath, 'resources/images/dark', filename),
    };
  }

  public static getIcon(filename: string): string | undefined {
    if (!ExtensionState.context) {
      return;
    }
    return path.join(ExtensionState.context.extensionPath, 'resources/images', filename);
  }

  public static getDistFile(relativePath: string): string | undefined {
    if (!ExtensionState.context) {
      return;
    }
    return path.join(ExtensionState.context.extensionPath, 'resources/dist', relativePath);
  }
}

export default ResourceRetriever;

import type { Uri } from 'vscode';

import type WdioSnapshot from '../tree-view/WdioSnapshot';
import type WdioSpec from '../tree-view/WdioSpec';
import type WdioSpecGroup from '../tree-view/WdioSpecGroup';
import type WorkspaceFolderItem from '../tree-view/WorkspaceFolder';

declare global {
  // Object.keys monkey patch
  interface ObjectConstructor {
    // eslint-disable-next-line @typescript-eslint/ban-types
    keys<T>(obj: T): T extends object ? (keyof T)[] : never;
  }
}

declare type SnapshotTabType = 'reference' | 'latest' | 'diff';

declare type DiffOptionType = 'default' | 'two-up' | 'slide' | 'onion';

declare interface ExtensionConfiguration {
  defaultSnapshotTab: SnapshotTabType;
  fallbackSnapshotTab: SnapshotTabType;
  defaultDiffOption: DiffOptionType;
  testFolderPath: {
    [key: string]: string;
  };
}

declare interface UriMap {
  uri: Uri;
  exists: boolean;
}

declare interface WdioResource {
  locale: string;
  formFactor: string;
  reference: UriMap;
  latest: UriMap;
  diff: UriMap;
}

declare type WdioTreeItem = WorkspaceFolderItem | WdioSpecGroup | WdioSpec | WdioSnapshot;

declare interface ThemedIcon {
  light: Uri;
  dark: Uri;
}

declare namespace WdioWebview {
  declare interface ImageData {
    src: string;
    exists: boolean;
  }

  declare interface Resource {
    locale: string;
    formFactor: string;
    reference: ImageData;
    latest: ImageData;
    diff: ImageData;
  }

  declare interface Snapshot {
    name: string;
    resources: Resource[];
  }

  declare type ExtensionConfig = Omit<ExtensionConfiguration, 'testFolderPath'>;

  declare interface Data {
    snapshotData: Snapshot;
    extensionConfig: ExtensionConfig;
  }

  declare interface Message {
    ready?: boolean;
  }
}

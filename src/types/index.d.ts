import { Uri } from 'vscode';

import WdioSnapshot from '../tree-view/WdioSnapshot';
import WdioSpec from '../tree-view/WdioSpec';
import WdioSpecGroup from '../tree-view/WdioSpecGroup';
import WorkspaceFolderItem from '../tree-view/WorkspaceFolder';

declare type SnapshotTabType = 'reference' | 'latest' | 'diff';

declare type DiffOptionType = 'default' | 'two-up' | 'slide' | 'onion';

declare interface ExtensionConfiguration {
  defaultSnapshotTab: SnapshotTabType;
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
  light: string;
  dark: string;
}

declare interface DiffFragmentOptions {
  reference: UriMap;
  latest: UriMap;
  diff: UriMap;
  resourceId: string;
}

declare interface EndFragmentOptions {
  scriptUri: Uri;
  nonce: string;
}

declare interface LatestFragmentOptions {
  latest: UriMap;
  resourceId: string;
}

declare interface ReferenceFragmentOptions {
  reference: UriMap;
  resourceId: string;
}

declare interface StartFragmentOptions {
  title: string;
  stylesheetUri: Uri;
  nonce: string;
}

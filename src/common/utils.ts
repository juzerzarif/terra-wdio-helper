import * as path from 'path';

import * as fs from 'fs-extra';
import * as rimraf from 'rimraf';
import { Uri, workspace } from 'vscode';
import type { WorkspaceFolder } from 'vscode';

import type WdioSnapshot from '../tree-view/WdioSnapshot';
import type WdioSpec from '../tree-view/WdioSpec';
import type { UriMap } from '../types';

import ExtensionState from './ExtensionState';

export const getDirectories = (root: string): string[] => {
  return fs.readdirSync(root).filter((item) => fs.lstatSync(path.join(root, item)).isDirectory());
};

export const getFiles = (root: string): string[] => {
  return fs.readdirSync(root).filter((item) => fs.lstatSync(path.join(root, item)).isFile());
};

export const isDirectoryEmpty = (dirPath: string): boolean => {
  const files = fs.readdirSync(dirPath);
  return !files.length;
};

export const buildUriMap = (uri: Uri | string): UriMap => {
  let resolvedUri: Uri;
  if (uri instanceof Uri) {
    resolvedUri = uri;
  } else {
    resolvedUri = Uri.file(uri);
  }
  return {
    uri: resolvedUri,
    exists: fs.existsSync(resolvedUri.fsPath),
  };
};

export const deleteResource = (resourcePath: string): void => {
  const workspaceRoot = (workspace.getWorkspaceFolder(Uri.file(resourcePath)) as WorkspaceFolder).uri.fsPath;
  const testFolderPath = ExtensionState.configuration.testFolderPath[workspaceRoot];
  const absoluteTestFolderPath = path.join(workspaceRoot, testFolderPath);
  const parentDirectory = path.dirname(resourcePath);
  rimraf.sync(resourcePath);
  if (parentDirectory !== absoluteTestFolderPath && isDirectoryEmpty(parentDirectory)) {
    deleteResource(parentDirectory);
  }
};

export const deleteWdioResources = (item: WdioSnapshot | WdioSpec, diffOnly?: boolean): void => {
  item.resources.forEach((resource) => {
    if (!diffOnly) {
      if (resource.reference.exists) {
        deleteResource(resource.reference.uri.fsPath);
      }
      if (resource.latest.exists) {
        deleteResource(resource.latest.uri.fsPath);
      }
    }
    if (resource.diff.exists) {
      deleteResource(resource.diff.uri.fsPath);
    }
  });
};

export const replaceReferenceWithLatest = (item: WdioSnapshot | WdioSpec): void => {
  item.resources.forEach((resource) => {
    const referenceDirectory = path.dirname(resource.reference.uri.fsPath);
    if (resource.latest.exists && fs.existsSync(referenceDirectory)) {
      fs.copySync(resource.latest.uri.fsPath, resource.reference.uri.fsPath);

      if (resource.diff.exists) {
        deleteResource(resource.diff.uri.fsPath);
      }
    }
  });
};

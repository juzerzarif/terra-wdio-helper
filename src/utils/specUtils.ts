import * as fs from 'fs';
import * as path from 'path';

import * as rimraf from 'rimraf';
import { TreeItemCollapsibleState, WorkspaceFolder, window, workspace } from 'vscode';

import WdioSpec from '../models/WdioSpec';
import { SpecResource } from '../models/interfaces';
import { Themes } from '../models/enums';

import ResourceRetriever from './ResourceRetriever';
import { isDirectory, pathExists } from './common';

/**
 * Get all WDIO test specs under all locales and viewports
 * @param testFolderPath - Path to the reference folder for WDIO snapshots
 * @returns An array of WdioSpecs or empty array if no specs exist
 */
export function getAllSpecs(testFolderPath: string): Array<WdioSpec> {
  if (pathExists(testFolderPath) && isDirectory(testFolderPath)) {
    const locales: Array<string> = fs.readdirSync(testFolderPath);
    const specs: Array<WdioSpec> = [];

    locales.forEach((locale: string) => {
      const localePath: string = path.join(testFolderPath, locale);
      if (pathExists(localePath) && isDirectory(localePath)) {
        const viewports: Array<string> = fs.readdirSync(localePath);

        viewports.forEach((viewport: string) => {
          const viewportPath: string = path.join(localePath, viewport);

          if (pathExists(viewportPath) && isDirectory(viewportPath)) {
            const specFolders: Array<string> = fs.readdirSync(viewportPath);

            specFolders.forEach((specFolder) => {
              if (!isDirectory(path.join(viewportPath, specFolder))) {
                return;
              }

              const i: number = specs.findIndex((spec) => spec.label === specFolder);
              const isDiffPresent: boolean = pathExists(
                path.join(testFolderPath, '..', 'diff', locale, viewport, specFolder)
              );
              const diffIconPath = {
                light: ResourceRetriever.getFolderDiffIconPath(Themes.LIGHT),
                dark: ResourceRetriever.getFolderDiffIconPath(Themes.DARK),
              };

              if (i >= 0) {
                specs[i].resources.push({ viewport: viewport, locale: locale });
                if (isDiffPresent) {
                  specs[i].iconPath = diffIconPath;
                }
              } else {
                const newSpec: WdioSpec = new WdioSpec(specFolder, TreeItemCollapsibleState.Collapsed, [
                  {
                    viewport: viewport,
                    locale: locale,
                  },
                ]);
                if (isDiffPresent) {
                  newSpec.iconPath = diffIconPath;
                }
                specs.push(newSpec);
              }
            });
          }
        });
      }
    });

    return specs;
  }

  return [];
}

/**
 * Delete all snapshots associated with the given spec
 * @param spec - The spec to delete all snapshots for
 */
export function deleteSpec(spec: WdioSpec): void {
  const resources: SpecResource[] = spec.resources;
  const workspaceRoot: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];
  const testFolderPath: string | undefined = workspace
    .getConfiguration('terraWdioHelper')
    .get('wdioTestFolderRelativePath');
  if (!workspaceRoot || !testFolderPath || typeof testFolderPath !== 'string') {
    return;
  }

  const specBasePath: string = path.join(workspaceRoot.uri.fsPath, testFolderPath, '__snapshots__');

  resources.forEach((resource: SpecResource): void => {
    const referenceSpecPath: string = path.join(
      specBasePath,
      'reference',
      resource.locale,
      resource.viewport,
      spec.label
    );
    const latestSpecPath: string = path.join(specBasePath, 'latest', resource.locale, resource.viewport, spec.label);
    const diffSpecPath: string = path.join(specBasePath, 'diff', resource.locale, resource.viewport, spec.label);

    try {
      if (pathExists(referenceSpecPath)) {
        rimraf.sync(referenceSpecPath);
      }
      if (pathExists(latestSpecPath)) {
        rimraf.sync(latestSpecPath);
      }
      if (pathExists(diffSpecPath)) {
        rimraf.sync(diffSpecPath);
      }
    } catch (err) {
      console.log(err);
      window.showErrorMessage(err);
    }
  });
}

/**
 * Delete all diff snapshots associated with a spec
 * @param spec - The spec to delete all diff snapshots for
 */
export function deleteDiffSpecs(spec: WdioSpec): void {
  const resources: SpecResource[] = spec.resources;
  const workspaceRoot: WorkspaceFolder | undefined = workspace.workspaceFolders && workspace.workspaceFolders[0];
  const testFolderPath: string | undefined = workspace
    .getConfiguration('terraWdioHelper')
    .get('wdioTestFolderRelativePath');
  if (!workspaceRoot || !testFolderPath || typeof testFolderPath !== 'string') {
    return;
  }

  const specBasePath: string = path.join(workspaceRoot.uri.fsPath, testFolderPath, '__snapshots__', 'diff');

  resources.forEach((resource: SpecResource): void => {
    const diffSpecPath: string = path.join(specBasePath, resource.locale, resource.viewport, spec.label);

    try {
      if (pathExists(diffSpecPath)) {
        rimraf.sync(diffSpecPath);
      }
    } catch (err) {
      console.log(err);
      window.showErrorMessage(err);
    }
  });
}

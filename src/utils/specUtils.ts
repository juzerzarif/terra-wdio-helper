import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { TreeItemCollapsibleState, window, workspace, WorkspaceFolder } from "vscode";

import { SpecResource } from "../models/interfaces";
import WdioSpec from "../models/wdioSpec";

import { pathExists } from "./common";

/**
 * Get all WDIO test specs under all locales and viewports
 * @param testFolderPath - Path to the reference folder for WDIO snapshots
 * @returns An array of WdioSpecs or empty array if no specs exist
 */
export function getAllSpecs(testFolderPath: string): Array<WdioSpec> {
  if (pathExists(testFolderPath)) {
    const locales: Array<string> = fs.readdirSync(testFolderPath);
    const specs: Array<WdioSpec> = [];

    locales.forEach((locale: string) => {
      const localePath: string = path.join(testFolderPath, locale);
      if (pathExists(localePath)) {
        const viewports: Array<string> = fs.readdirSync(localePath);

        viewports.forEach((viewport: string) => {
          const viewportPath: string = path.join(localePath, viewport);

          if (pathExists(viewportPath)) {
            const specFolders: Array<string> = fs.readdirSync(viewportPath);

            specFolders.forEach(specFolder => {
              const i = specs.findIndex(spec => spec.label === specFolder);
              if (i >= 0) {
                specs[i].resources.push({ viewport: viewport, locale: locale });
              } else {
                specs.push(
                  new WdioSpec(specFolder, TreeItemCollapsibleState.Collapsed, [
                    {
                      viewport: viewport,
                      locale: locale
                    }
                  ])
                );
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
  const testFolderPath: string | undefined = workspace.getConfiguration("terraWdioHelper").get("wdioTestFolderRelativePath");
  if (!workspaceRoot || !testFolderPath || typeof testFolderPath !== 'string') { return; }
  
  const specBasePath: string = path.join(workspaceRoot.uri.fsPath, testFolderPath, '__snapshots__');

  resources.forEach((resource: SpecResource): void => {
    const referenceSpecPath: string = path.join(specBasePath, 'reference', resource.locale, resource.viewport, spec.label);
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
  const testFolderPath: string | undefined = workspace.getConfiguration("terraWdioHelper").get("wdioTestFolderRelativePath");
  if (!workspaceRoot || !testFolderPath || typeof testFolderPath !== 'string') { return; }

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

import * as fs  from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { Uri, window, workspace } from "vscode";

import { SnapshotResource, SpecResource } from "../models/interfaces";
import ResourceRetriever from '../models/ResourceRetriever';
import WdioSnapshot from "../models/wdioSnapshot";
import WdioSpec from "../models/wdioSpec";

import { pathExists } from "./common";

/**
 * Gets all the snapshots associated with the given spec under all locales and viewports 
 * @param spec - The WDIO spec to get snapshots for
 * @returns An array of WdioSnapshots associated with the spec, empty array if no snapshots exist
 */
export function getAllSnapshots(spec: WdioSpec): Array<WdioSnapshot> {
  const rootPath = workspace.workspaceFolders && workspace.workspaceFolders[0].uri.fsPath;
  const testFolderPath: string | undefined = workspace.getConfiguration("terraWdioHelper").get("wdioTestFolderRelativePath");
  if (!rootPath || typeof testFolderPath !== "string") {
    return [];
  }

  const wdioSnapshots: Array<WdioSnapshot> = [];
  spec.resources.forEach(function (specResource: SpecResource): void {
    const specPath: string = path.join(rootPath, testFolderPath, '__snapshots__', 'reference', specResource.locale, specResource.viewport, spec.label);

    if(pathExists(specPath)) {
      const snapshotFiles: Array<string> = fs.readdirSync(specPath);

      snapshotFiles.forEach(function (snapshotFile: string) {
        const i: number = wdioSnapshots.findIndex(wdioSnapshot => wdioSnapshot.label === snapshotFile);
        const referencePath: string = path.join(rootPath, testFolderPath, '__snapshots__', 'reference', specResource.locale, specResource.viewport, spec.label, snapshotFile);
        const latestPath: string = path.join(rootPath, testFolderPath, '__snapshots__', 'latest', specResource.locale, specResource.viewport, spec.label, snapshotFile);
        const diffPath: string = path.join(rootPath, testFolderPath, '__snapshots__', 'diff', specResource.locale, specResource.viewport, spec.label, snapshotFile);
        const resource: SnapshotResource = {
          viewport: specResource.viewport,
          locale: specResource.locale,
          referenceUri: Uri.file(referencePath),
          latestUri: Uri.file(latestPath),
          diffUri: Uri.file(diffPath)
        };
        const isDiffPresent: boolean = pathExists(diffPath);
        const diffIconPath: string = ResourceRetriever.getSnapshotDiffIconPath();

        if (i >= 0) {
          wdioSnapshots[i].resources.push(resource);
          if (isDiffPresent) {
            wdioSnapshots[i].iconPath = diffIconPath;
          }
        } else {
          const newSnapshot = new WdioSnapshot(snapshotFile, [resource]);
          if (isDiffPresent) {
            newSnapshot.iconPath = diffIconPath;
          } 
          wdioSnapshots.push(newSnapshot);
        }
      });
    }
  });

  return wdioSnapshots;
}

/**
 * Delete all images associated with a snapshot
 * @param snapshot - The snapshot to delete images for
 */
export function deleteSnapshot(snapshot: WdioSnapshot): void {
  const resources: SnapshotResource[] = snapshot.resources;
  resources.forEach((resource: SnapshotResource): void => {
    try {
      if (pathExists(resource.referenceUri.fsPath)) {
        rimraf.sync(resource.referenceUri.fsPath);
      }
      if (pathExists(resource.latestUri.fsPath)) {
        rimraf.sync(resource.latestUri.fsPath);
      }
      if (pathExists(resource.diffUri.fsPath)) {
        rimraf.sync(resource.diffUri.fsPath);
      }
    } catch (err) {
      console.log(err);
      window.showErrorMessage(err);
    }
  });
}

/**
 * Delete all diffs associated with a snapshot
 * @param snapshot - The snapshot to delete diffs for
 */
export function deleteDiffSnapshots(snapshot: WdioSnapshot): void {
  const resources: SnapshotResource[] = snapshot.resources;
  resources.forEach((resource: SnapshotResource): void => {
    try {
      if (pathExists(resource.diffUri.fsPath)) {
        rimraf.sync(resource.diffUri.fsPath);
      }
    } catch (err) {
      console.log(err);
      window.showErrorMessage(err);
    }
  });
}

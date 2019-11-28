import * as fs  from 'fs';
import * as path from 'path';
import { Uri, workspace } from "vscode";

import { SpecResource } from "../models/interfaces";
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
        const referencePath = path.join(rootPath, testFolderPath, '__snapshots__', 'reference', specResource.locale, specResource.viewport, spec.label, snapshotFile);
        const latestPath = path.join(rootPath, testFolderPath, '__snapshots__', 'latest', specResource.locale, specResource.viewport, spec.label, snapshotFile);
        const diffPath = path.join(rootPath, testFolderPath, '__snapshots__', 'diff', specResource.locale, specResource.viewport, spec.label, snapshotFile);
        const resource = {
          viewport: specResource.viewport,
          locale: specResource.locale,
          referenceUri: Uri.file(referencePath),
          latestUri: Uri.file(latestPath),
          diffUri: Uri.file(diffPath)
        };

        if (i >= 0) {
          wdioSnapshots[i].resources.push(resource);
        } else {
          wdioSnapshots.push(new WdioSnapshot(snapshotFile, [resource]));
        }
      });
    }
  });

  return wdioSnapshots;
}

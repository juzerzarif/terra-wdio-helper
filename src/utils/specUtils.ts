import * as fs from "fs";
import * as path from "path";
import { TreeItemCollapsibleState, window, workspace } from "vscode";

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

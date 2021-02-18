import * as path from 'path';

import * as fg from 'fast-glob';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';

import ResourceRetriever from '../common/ResourceRetriever';
import { buildUriMap } from '../common/utils';
import type { WdioResource } from '../types';

import type WdioSpecGroup from './WdioSpecGroup';

class WdioSpec extends TreeItem {
  static getAllWdioSpecs(specGroup: WdioSpecGroup): WdioSpec[] {
    const referencePath = path.join(specGroup.resourceUri.fsPath, 'reference');
    const wdioSpecs: WdioSpec[] = [];

    const snapshots = fg.sync('**/*.png', { cwd: referencePath }).map(path.normalize);
    const specFolders = [...new Set(snapshots.map((snapshot) => path.join(referencePath, path.dirname(snapshot))))]; // need to filter out duplicates

    specFolders.forEach((specFolder) => {
      const formFactorPath = path.dirname(specFolder);
      const specName = path.basename(specFolder);
      const formFactor = path.basename(formFactorPath);
      const locale = path.relative(referencePath, path.dirname(formFactorPath));
      const specId = this.buildId(specGroup.resourceUri, specName);
      const wdioSpecIndex = wdioSpecs.findIndex((wdioSpec) => wdioSpec.id === specId);

      if (wdioSpecIndex < 0) {
        const newSpec = new WdioSpec(specName, specGroup.resourceUri);
        newSpec.addResource(locale, formFactor);
        wdioSpecs.push(newSpec);
      } else {
        wdioSpecs[wdioSpecIndex].addResource(locale, formFactor);
      }
    });

    return wdioSpecs.sort((specA, specB) => specA.label.localeCompare(specB.label, 'en', { numeric: true }));
  }

  private static buildId(baseUri: Uri | string, label: string): string {
    let resolvedFsPath: string;
    if (baseUri instanceof Uri) {
      resolvedFsPath = baseUri.fsPath;
    } else {
      resolvedFsPath = baseUri;
    }
    return Buffer.from(path.join(resolvedFsPath, label)).toString('base64');
  }

  constructor(public readonly label: string, public readonly baseUri: Uri) {
    super(label, TreeItemCollapsibleState.Collapsed);

    this.tooltip = label;
    this.id = WdioSpec.buildId(baseUri, label);
  }

  contextValue = 'terraWdioSpec';
  iconPath = ResourceRetriever.getThemedIcon('folder_icon.svg');
  resources: WdioResource[] = [];

  addResource(locale: string, formFactor: string): void {
    const reference = buildUriMap(path.join(this.baseUri.fsPath, 'reference', locale, formFactor, this.label));
    const latest = buildUriMap(path.join(this.baseUri.fsPath, 'latest', locale, formFactor, this.label));
    const diff = buildUriMap(path.join(this.baseUri.fsPath, 'diff', locale, formFactor, this.label));

    if (diff.exists) {
      this.iconPath = ResourceRetriever.getThemedIcon('folder_diff_icon.svg');
    }
    this.resources.push({
      locale,
      formFactor,
      reference,
      latest,
      diff,
    });
  }
}

export default WdioSpec;

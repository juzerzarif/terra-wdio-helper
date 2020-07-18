import * as path from 'path';

import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';

import ResourceRetriever from '../common/ResourceRetriever';
import { WdioResource } from '../types';
import { buildUriMap, getFiles } from '../common/utils';

import WdioSpec from './WdioSpec';

class WdioSnapshot extends TreeItem {
  static getAllWdioSnapshots(wdioSpec: WdioSpec): WdioSnapshot[] {
    const specResources = wdioSpec.resources;
    const wdioSnapshots: WdioSnapshot[] = [];

    specResources.forEach((specResource) => {
      const specReferencePath = specResource.reference.uri.fsPath;
      const snapshots = getFiles(specReferencePath);

      snapshots.forEach((snapshot) => {
        const snapshotId = this.buildId(wdioSpec.id as string, snapshot);
        const existingSnapshot = wdioSnapshots.find((wdioSnapshot) => wdioSnapshot.id === snapshotId);
        const snapshotToUpdate =
          existingSnapshot ?? new WdioSnapshot(snapshot, wdioSpec.baseUri, wdioSpec.id as string);
        snapshotToUpdate.addResource(specResource);

        if (!existingSnapshot) {
          wdioSnapshots.push(snapshotToUpdate);
        }
      });
    });

    return wdioSnapshots;
  }

  private static buildId(parentId: string, filename: string): string {
    return Buffer.from(`${parentId}-${filename}`).toString('base64');
  }

  constructor(filename: string, readonly baseUri: Uri, parentId: string) {
    super(filename, TreeItemCollapsibleState.None);

    this._filename = filename;
    this.label = filename;
    this.tooltip = filename;

    this.id = WdioSnapshot.buildId(parentId, filename);
    this.command = {
      command: 'terraWdioHelper.openSnapshot',
      title: 'Open snapshot',
      tooltip: 'Open snapshot',
      arguments: [this],
    };
  }

  label = '';
  contextValue = 'terraWdioSnapshot';
  iconPath = ResourceRetriever.getIcon('snapshot_icon.png');
  resources: WdioResource[] = [];
  private _filename: string;

  private addResource(specResource: WdioResource): void {
    const reference = buildUriMap(path.join(specResource.reference.uri.fsPath, this._filename));
    const latest = buildUriMap(path.join(specResource.latest.uri.fsPath, this._filename));
    const diff = buildUriMap(path.join(specResource.diff.uri.fsPath, this._filename));

    if (diff.exists) {
      this.iconPath = ResourceRetriever.getIcon('snapshot_diff_icon.png');
    }
    this.resources.push({
      locale: specResource.locale,
      formFactor: specResource.formFactor,
      reference,
      latest,
      diff,
    });
  }
}

export default WdioSnapshot;

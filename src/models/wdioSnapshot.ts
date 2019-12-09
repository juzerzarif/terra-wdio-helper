import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';

import ResourceRetriever from '../utils/ResourceRetriever';

import { SnapshotResource } from './interfaces';

/**
 * A snapshot captured during a WDIO test
 */
class WdioSnapshot extends TreeItem {
  public command: Command;

  constructor(public readonly label: string, public resources: Array<SnapshotResource>) {
    super(label, TreeItemCollapsibleState.None);

    this.command = {
      command: 'terraWdioHelper.displaySnapshot',
      title: 'Open Snapshot',
      tooltip: `Open WDIO snapshot ${label}`,
      arguments: [
        {
          title: label,
          resources: this.resources,
        },
      ],
    };
  }

  iconPath = ResourceRetriever.getSnapshotIconPath();

  tooltip = this.label;

  contextValue = 'wdioSnapshot';
}

export default WdioSnapshot;

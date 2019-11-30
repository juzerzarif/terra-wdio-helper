import * as path from "path";
import { Command, TreeItem, TreeItemCollapsibleState } from "vscode";

import { SnapshotResource } from "./interfaces";

/**
 * A snapshot captured during a WDIO test
 */
class WdioSnapshot extends TreeItem {
  public command: Command;

  constructor(
    public readonly label: string,
    public resources: Array<SnapshotResource>
  ) {
    super(label, TreeItemCollapsibleState.None);

    this.command = {
      command: 'terraWdioHelper.displaySnapshot',
      title: 'Open Snapshot',
      tooltip: `Open WDIO snapshot ${label}`,
      arguments: [{
        title: label,
        resources: this.resources
      }]
    };
  }

  iconPath = path.join(__filename, "..", "..", "..", "resources", "images", "snapshotIcon.png");

  tooltip = this.label;

  contextValue = "wdioSnapshot";
}

export default WdioSnapshot;

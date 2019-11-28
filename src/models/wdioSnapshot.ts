import * as path from "path";
import { Command, TreeItem, TreeItemCollapsibleState } from "vscode";

import { SnapshotResource } from "./interfaces";

/**
 * A snapshot captured during a WDIO test
 */
class WdioSnapshot extends TreeItem {
  constructor(
    public readonly label: string,
    public resources: Array<SnapshotResource>
  ) {
    super(label, TreeItemCollapsibleState.None);
  }

  iconPath = path.join(__filename, "..", "..", "..", "resources", "images", "snapshotIcon.png");

  tooltip = this.label;

  contextValue = "wdioSnapshot";
}

export default WdioSnapshot;

import * as path from "path";
import { Command, ExtensionContext, TreeItem, TreeItemCollapsibleState } from "vscode";

import ContextStore from "./ContextStore";
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

  iconPath = WdioSnapshot.generateIconPath();

  tooltip = this.label;

  contextValue = "wdioSnapshot";

  private static generateIconPath(): string | undefined {
    const context: ExtensionContext | null = ContextStore.getContext();
    return (context ? path.join(context.extensionPath, "resources", "images", "snapshotIcon.png") : undefined);
  }
}

export default WdioSnapshot;

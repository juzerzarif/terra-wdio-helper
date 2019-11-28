import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

import { SpecResource } from "./interfaces";

/**
 * A WDIO test spec folder
 */
class WdioSpec extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public resources: Array<SpecResource>
  ) {
    super(label, collapsibleState);
  }

  iconPath = ThemeIcon.Folder;

  tooltip = this.label;

  contextValue = "wdioSpec";
}

export default WdioSpec;

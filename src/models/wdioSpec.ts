import { TreeItem, TreeItemCollapsibleState } from "vscode";

import { Themes } from './enums';
import { SpecResource } from "./interfaces";
import ResourceRetriever from './ResourceRetriever';

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

  iconPath = {
    light: ResourceRetriever.getFolderIconPath(Themes.LIGHT),
    dark: ResourceRetriever.getFolderIconPath(Themes.DARK)
  };

  tooltip = this.label;

  contextValue = "wdioSpec";
}

export default WdioSpec;

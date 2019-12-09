import { TreeItem, TreeItemCollapsibleState } from 'vscode';

import ResourceRetriever from '../utils/ResourceRetriever';

import { SpecResource } from './interfaces';
import { Themes } from './enums';

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
    dark: ResourceRetriever.getFolderIconPath(Themes.DARK),
  };

  tooltip = this.label;

  contextValue = 'wdioSpec';
}

export default WdioSpec;

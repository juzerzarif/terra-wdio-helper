import * as path from 'path';

import * as fg from 'fast-glob';
import { Uri, ViewColumn, window } from 'vscode';
import type { WebviewPanel } from 'vscode';

import ResourceRetriever from '../common/ResourceRetriever';
import { buildUriMap } from '../common/utils';
import type WdioSnapshot from '../tree-view/WdioSnapshot';
import type { WdioResource } from '../types';

import { createHtmlForSnapshot } from './htmlUtils';

class WdioWebviewPanel {
  private static openWebviewPanels: WdioWebviewPanel[] = [];

  static createOrShow(snapshot: WdioSnapshot): void {
    const column = window.activeTextEditor?.viewColumn;
    const existingPanel = this.openWebviewPanels.find((panel) => panel.id === snapshot.id);

    if (existingPanel) {
      existingPanel.panel.reveal(column);
      return;
    }
    const newPanel = window.createWebviewPanel(
      'terraWdioSnapshotPanel',
      snapshot.label as string,
      column ?? ViewColumn.Active,
      { enableScripts: true }
    );
    newPanel.iconPath = Uri.file(ResourceRetriever.getIcon('snapshot_icon.png') as string);
    const snapshotPanel = new WdioWebviewPanel(newPanel, snapshot);
    snapshotPanel.updateWebview();
    this.openWebviewPanels.push(snapshotPanel);
  }

  static updateWebviewPanels(): void {
    this.openWebviewPanels.forEach((panel) => {
      const litmusUri = panel.snapshot.resources[0].reference.uri;
      const snapshotFile = path.basename(litmusUri.fsPath);
      const specFolder = path.basename(path.dirname(litmusUri.fsPath));
      const cwd = path.join(panel.snapshot.baseUri.fsPath, 'reference');
      const allSnapshotFiles = fg
        .sync(`**/${fg.escapePath(specFolder)}/${fg.escapePath(snapshotFile)}`, { cwd })
        .map((relativePath) => path.join(cwd, relativePath));

      panel.snapshot.resources = [];
      allSnapshotFiles.forEach((snapshot) => {
        const normalizedPath = path.normalize(snapshot);
        panel.snapshot.resources.push(this.createResourceFromPath(normalizedPath, panel.snapshot.baseUri.fsPath));
      });
      panel.updateWebview();
    });
  }

  private static createResourceFromPath(_path: string, base: string): WdioResource {
    const relativePath = path.relative(path.join(base, 'reference'), _path);
    const localeFormFactorPath = path.dirname(path.dirname(relativePath));
    const formFactor = path.basename(localeFormFactorPath);
    const locale = path.dirname(localeFormFactorPath);

    return {
      locale,
      formFactor,
      reference: buildUriMap(path.join(base, 'reference', relativePath)),
      latest: buildUriMap(path.join(base, 'latest', relativePath)),
      diff: buildUriMap(path.join(base, 'diff', relativePath)),
    };
  }

  private constructor(readonly panel: WebviewPanel, readonly snapshot: WdioSnapshot) {
    this.id = snapshot.id as string;
    panel.onDidDispose(() => {
      WdioWebviewPanel.openWebviewPanels = WdioWebviewPanel.openWebviewPanels.filter((panel) => panel.id !== this.id);
    });
  }

  private readonly id: string;

  private updateWebview(): void {
    this.panel.webview.html = createHtmlForSnapshot(this.snapshot, this.panel.webview);
  }
}

export default WdioWebviewPanel;

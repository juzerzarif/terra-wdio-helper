import * as path from 'path';

import { Disposable, FileSystemWatcher, Uri, ViewColumn, Webview, WebviewPanel, window, workspace } from 'vscode';

import ResourceRetriever from './utils/ResourceRetriever';
import { SnapshotWebviewOptions } from './models/interfaces';
import { createHtmlForSnapshot } from './utils/panelUtils';

class WdioSnapshotPanel {
  // public variables
  public readonly title: string;

  // private variables
  private static _openPanels: WdioSnapshotPanel[] = [];
  private static readonly viewType: string = 'wdioSnapshot';
  private _panel: WebviewPanel;
  private readonly _snapshot: SnapshotWebviewOptions;
  private _disposables: Disposable[] = [];

  /**
   * Create a webview for a given WDIO snapshot or focus a webview if it already exists
   * @param snapshot - WDIO snapshot to create/show a webview panel for
   */
  public static createOrShow(snapshot: SnapshotWebviewOptions): void {
    const column: ViewColumn | undefined = window.activeTextEditor ? window.activeTextEditor.viewColumn : undefined;

    const i: number = WdioSnapshotPanel._openPanels.findIndex(function(panel: WdioSnapshotPanel): boolean {
      return panel.title === snapshot.title;
    });
    if (i >= 0) {
      WdioSnapshotPanel._openPanels[i]._panel.reveal(column);
      return;
    }

    const panel: WebviewPanel = window.createWebviewPanel(
      WdioSnapshotPanel.viewType,
      snapshot.title,
      column || ViewColumn.Active,
      {
        enableScripts: true,
      }
    );
    panel.iconPath = Uri.file(ResourceRetriever.getWebviewPanelIconPath());

    WdioSnapshotPanel._openPanels.push(new WdioSnapshotPanel(panel, snapshot));
  }

  private constructor(panel: WebviewPanel, snapshot: SnapshotWebviewOptions) {
    this.title = panel.title;
    this._panel = panel;
    this._snapshot = snapshot;

    this._update(); // initial render

    this._panel.onDidDispose(this.dispose, this, this._disposables);

    const testFolderPath: string = path.join(
      snapshot.resources[0].referenceUri.fsPath,
      '..',
      '..',
      '..',
      '..',
      '..',
      '**'
    );
    const fileSystemWatcher: FileSystemWatcher = workspace.createFileSystemWatcher(testFolderPath.replace(/\\/g, '/'));
    const updatePanel = (uri: Uri): void => {
      const referenceList = snapshot.resources.map((resource) => resource.referenceUri);
      const latestList = snapshot.resources.map((resource) => resource.latestUri);
      const diffList = snapshot.resources.map((resource) => resource.diffUri);

      if (
        referenceList.some((ref: Uri) => ref.fsPath === uri.fsPath) ||
        latestList.some((ref: Uri) => ref.fsPath === uri.fsPath) ||
        diffList.some((ref: Uri) => ref.fsPath === uri.fsPath)
      ) {
        this._update();
      }
    };
    fileSystemWatcher.onDidChange((e: Uri) => updatePanel(e), null, this._disposables);
    fileSystemWatcher.onDidCreate((e: Uri) => updatePanel(e), null, this._disposables);
    fileSystemWatcher.onDidDelete((e: Uri) => updatePanel(e), null, this._disposables);
  }

  /**
   * Dispose this webview panel and associated disposables
   */
  public dispose(): void {
    const panelIndex = WdioSnapshotPanel._openPanels.findIndex(
      (panel: WdioSnapshotPanel): boolean => panel.title === this.title
    );
    WdioSnapshotPanel._openPanels.splice(panelIndex, 1);
    this._panel.dispose();
    this._disposables.forEach((disposable: Disposable) => disposable.dispose());
  }

  private _update(): void {
    this._injectHtmlIntoWebview(this._panel.webview, this._snapshot);
  }

  private _injectHtmlIntoWebview(webview: Webview, snapshot: SnapshotWebviewOptions): void {
    this._panel.webview.html = createHtmlForSnapshot(snapshot, webview);
  }
}

export default WdioSnapshotPanel;

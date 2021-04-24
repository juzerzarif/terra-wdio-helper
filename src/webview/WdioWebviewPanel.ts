import * as path from 'path';

import * as fglob from 'fast-glob';
import * as fs from 'fs-extra';
import { Uri, ViewColumn, window } from 'vscode';
import { nanoid } from 'nanoid';
import type { Webview, WebviewPanel } from 'vscode';

import ExtensionState from '../common/ExtensionState';
import ResourceRetriever from '../common/ResourceRetriever';
import type WdioSnapshot from '../tree-view/WdioSnapshot';
import type WorkspaceFolderItem from '../tree-view/WorkspaceFolder';
import type { WdioWebview } from '../types';

import html from './webview.template.html';

interface PanelImageData extends WdioWebview.ImageData {
  fsPath: string;
}

class WdioWebviewPanel {
  /**
   * =========== static =============
   */
  private static openPanels: WdioWebviewPanel[] = [];

  /**
   * Create a webview panel for a WDIO snapshot or reveal one that already exists
   *
   * @param snapshot - WDIO snapshot tree item
   */
  public static createOrShow(snapshot: WdioSnapshot): void {
    const existingPanel = this.openPanels.find((panel) => panel.id === snapshot.id);
    if (existingPanel) {
      existingPanel.panel.reveal();
      return;
    }
    const newPanel = new WdioWebviewPanel(snapshot);
    newPanel.postDataToWebview();
    this.openPanels.push(newPanel);
  }

  /**
   * Update the snapshots in all open webviews, and possibly close an open webview if no snapshots for it exist.
   */
  public static updateAllOpenWebviews(workspaceFolderItem?: WorkspaceFolderItem): void {
    const workspacePath = workspaceFolderItem?.resourceUri.fsPath;

    this.openPanels.forEach((webviewPanel) => {
      const { reference: _reference, locale, formFactor } = webviewPanel.webviewSnapshot.resources[0];
      const reference = _reference as PanelImageData;
      if (workspacePath && !reference.fsPath.startsWith(workspacePath)) {
        return;
      }

      const snapshotFilename = path.basename(reference.fsPath);
      const specFolderName = path.basename(path.dirname(reference.fsPath));
      const referenceFolderPath = reference.fsPath.substring(
        0,
        reference.fsPath.indexOf(path.join(path.sep, locale, formFactor, specFolderName, snapshotFilename))
      );
      const snapshotFolderPath = path.dirname(referenceFolderPath);
      const allSnapshotFiles = fglob.sync(`**/${specFolderName}/${snapshotFilename}`, { cwd: referenceFolderPath });

      if (!allSnapshotFiles.length) {
        webviewPanel.panel.dispose();
      } else {
        webviewPanel.webviewSnapshot.resources = this.buildWebviewSnapshotResources(
          allSnapshotFiles,
          snapshotFolderPath,
          webviewPanel.panel.webview
        );
        webviewPanel.postDataToWebview();
      }
    });
  }

  private static buildWebviewSnapshotResources(
    relativeSnapshotPaths: string[],
    snapshotFolderPath: string,
    webview: Webview
  ): WdioWebview.Resource[] {
    return relativeSnapshotPaths.map((relativeSnapshotPath) => {
      const localeFormFactorPath = path.dirname(path.dirname(relativeSnapshotPath));
      const formFactor = path.basename(localeFormFactorPath);
      const locale = path.dirname(localeFormFactorPath);

      return {
        locale,
        formFactor,
        reference: this.buildImageData(path.join(snapshotFolderPath, 'reference', relativeSnapshotPath), webview),
        latest: this.buildImageData(path.join(snapshotFolderPath, 'latest', relativeSnapshotPath), webview),
        diff: this.buildImageData(path.join(snapshotFolderPath, 'diff', relativeSnapshotPath), webview),
      };
    });
  }

  private static buildImageData(imagePath: string, webview: Webview) {
    const imageExists = fs.existsSync(imagePath);
    const imageUri = Uri.file(imagePath);
    return {
      src: `${webview.asWebviewUri(imageUri)}?${nanoid()}`,
      fsPath: imageUri.fsPath,
      exists: imageExists,
    };
  }

  /**
   * =========== instance =============
   */
  public readonly id: string;
  private readonly panel: WebviewPanel;
  private webviewSnapshot: WdioWebview.Snapshot = {} as WdioWebview.Snapshot;
  private pendingPostMessage: WdioWebview.Data | null = null;
  private webviewReady = false;

  private constructor(snapshot: WdioSnapshot) {
    this.id = snapshot.id;

    this.panel = window.createWebviewPanel('terraWdioSnapshotPanel', snapshot.label, ViewColumn.Active, {
      enableScripts: true,
    });
    this.panel.iconPath = ResourceRetriever.getIcon('snapshot_icon.png');
    this.panel.webview.html = this.buildWebviewHTML();
    this.panel.onDidDispose(
      () => {
        WdioWebviewPanel.openPanels = WdioWebviewPanel.openPanels.filter((panel) => panel !== this);
      },
      null,
      ExtensionState.context.subscriptions
    );
    this.panel.onDidChangeViewState(
      ({ webviewPanel }) => {
        /* istanbul ignore else */
        if (!webviewPanel.visible) {
          this.webviewReady = false;
        }
      },
      null,
      ExtensionState.context.subscriptions
    );
    this.panel.webview.onDidReceiveMessage(
      (message: WdioWebview.Message) => {
        this.webviewReady = !!message.ready;
        /* istanbul ignore else */
        if (this.webviewReady && this.pendingPostMessage) {
          this.panel.webview.postMessage(this.pendingPostMessage);
          this.pendingPostMessage = null;
        }
      },
      null,
      ExtensionState.context.subscriptions
    );

    this.webviewSnapshot = {
      name: snapshot.label,
      resources: snapshot.resources.map((resource) => ({
        locale: resource.locale,
        formFactor: resource.formFactor,
        reference: WdioWebviewPanel.buildImageData(resource.reference.uri.fsPath, this.panel.webview),
        latest: WdioWebviewPanel.buildImageData(resource.latest.uri.fsPath, this.panel.webview),
        diff: WdioWebviewPanel.buildImageData(resource.diff.uri.fsPath, this.panel.webview),
      })),
    };
  }

  private buildWebviewHTML() {
    const fontUri = this.panel.webview.asWebviewUri(ResourceRetriever.getFont('balsamiq-sans-v3-latin-700.woff'));
    const stylesheetUri = this.panel.webview.asWebviewUri(ResourceRetriever.getDistFile('bundle.css'));
    const scriptUri = this.panel.webview.asWebviewUri(ResourceRetriever.getDistFile('bundle.js'));
    return html
      .replace(/{{title}}/g, this.panel.title)
      .replace(/{{font_uri}}/g, fontUri.toString())
      .replace(/{{stylesheet_uri}}/g, stylesheetUri.toString())
      .replace(/{{script_uri}}/g, scriptUri.toString());
  }

  private postDataToWebview() {
    const webviewData: WdioWebview.Data = {
      snapshotData: this.webviewSnapshot,
      extensionConfig: ExtensionState.configuration,
    };
    if (this.webviewReady) {
      this.panel.webview.postMessage(webviewData);
    } else {
      this.pendingPostMessage = webviewData;
    }
  }
}

export default WdioWebviewPanel;

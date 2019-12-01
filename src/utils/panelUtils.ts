import * as path from 'path';
import { Uri, Webview, workspace } from "vscode";

import { DiffFragmentOptions, EndFragmentOptions, LatestFragmentOptions, ReferenceFragmentOptions, SnapshotResource, SnapshotWebviewOptions, StartFragmentOptions } from '../models/interfaces';
import WdioSnapshot from '../models/wdioSnapshot';

import { pathExists } from './common';

const _fallbackUri: Uri = Uri.file(path.join(__filename, "..", "..", "..", "resources", "images", "fallback.png"));

const generateNonce = (): string => {
  let nonce: string = '';
  const allowedChars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i: number = 0; i < 32; i++) {
    nonce += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  return nonce;
};

const getStartFragment = (options: StartFragmentOptions): string => {
  const title: string = options.title;
  const indexCssUri: Uri = options.indexCssUri;
  const beerSliderCssUri: Uri = options.beerSliderCssUri;
  const nonce: string = options.nonce;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src 'nonce-${nonce}' vscode-resource:; style-src vscode-resource:;">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" type="text/css" href="${indexCssUri}">
      <link rel="stylesheet" type="text/css" href="${beerSliderCssUri}">
      <title>WDIO Snapshot Collection</title>
    </head>
    <body>
      <div id="root">
        <h1 class="snapshot-title">${title}</h1>
        <div class="snapshot-container">
  `;
};

const getEndFragment = (options: EndFragmentOptions): string => {
  const indexJsUri: Uri = options.indexJsUri;
  const persistenceJsUri: Uri = options.persistenceJsUri;
  const beerSliderJsUri: Uri = options.beerSliderJsUri;
  const nonce: string = options.nonce;

  return `
        </div>
      </div>
      <script nonce="${nonce}" src="${beerSliderJsUri}"></script>
      <script nonce="${nonce}" src="${indexJsUri}"></script>
      <script nonce="${nonce}" src="${persistenceJsUri}"></script>
    </body>
  </html>
  `;
};

const getReferenceFragment = (options: ReferenceFragmentOptions, webview: Webview): string => {
  const referenceUri: Uri = webview.asWebviewUri(options.referenceUri);
  const fallbackUri: Uri = webview.asWebviewUri(_fallbackUri);
  const resourceId: string = options.resourceId;
  const resolvedReference: Uri = pathExists(options.referenceUri.fsPath) ? referenceUri : fallbackUri;

  return `
  <div id="${resourceId}_reference" class="snapshot-box reference-box active">
    <img class="${resourceId}_reference_img" src="${resolvedReference}" />
  </div>
  `;
};

const getLatestFragment = (options: LatestFragmentOptions, webview: Webview): string => {
  const latestUri: Uri = webview.asWebviewUri(options.latestUri);
  const fallbackUri: Uri = webview.asWebviewUri(_fallbackUri);
  const resourceId: string = options.resourceId;
  const resolvedLatest: Uri = pathExists(options.latestUri.fsPath) ? latestUri : fallbackUri;

  return `
  <div id="${resourceId}_latest" class="snapshot-box latest-box">
    <img class="${resourceId}_latest_img" src="${resolvedLatest}" />
  </div>
  `;
};

const getDiffFragment = (options: DiffFragmentOptions, webview: Webview): string => {
  const referenceUri: Uri = webview.asWebviewUri(options.referenceUri);
  const latestUri: Uri = webview.asWebviewUri(options.latestUri);
  const diffUri: Uri = webview.asWebviewUri(options.diffUri);
  const fallbackUri: Uri = webview.asWebviewUri(_fallbackUri);
  const resourceId: string = options.resourceId;

  if (pathExists(options.referenceUri.fsPath) && pathExists(options.latestUri.fsPath) && pathExists(options.diffUri.fsPath)) {
    return `
    <!-- ${resourceId}_diff_section_start -->
    <div id="${resourceId}_diff" class="snapshot-box diff-box">
      <div class="diff-image-container">
        <div id="${resourceId}_diff_default" class="diff-default">
          <img class="${resourceId}_diff_img" src="${diffUri}" />
        </div>
        <div id="${resourceId}_diff_two-up" class="diff-two-up active">
          <img class="${resourceId}_reference_img" src="${referenceUri}" />
          <img class="${resourceId}_latest_img" src="${latestUri}" />
        </div>
        <div id="${resourceId}_diff_slide" class="diff-slide beer-slider">
          <img class="${resourceId}_reference_img" src="${referenceUri}" />
          <div class="slide-latest beer-reveal">
            <img class="${resourceId}_latest_img" src="${latestUri}" />
          </div>
        </div>
        <div id="${resourceId}_diff_onion" class="diff-onion">
          <div class="diff-onion-image">
            <img class="${resourceId}_reference_img" src="${referenceUri}" />
            <img class="${resourceId}_latest_img" src="${latestUri}" />
          </div>
          <div class="onion-slider-container">
            <input type="range" min="0" max="100" value="50" step="1" class="onion-slider-input">
          </div>
        </div>
      </div>
      <div class="diff-button-group">
        <button id="${resourceId}_diff_default_button" class="diff-button">Default</button>
        <button id="${resourceId}_diff_two-up_button" class="diff-button active">2-Up</button>
        <button id="${resourceId}_diff_slide_button" class="diff-button">Slide</button>
        <button id="${resourceId}_diff_onion_button" class="diff-button">Onion</button>
      </div>
    </div>
    <!-- ${resourceId}_diff_section_end -->
    `;
  }
  
  return `
  <!-- ${resourceId}_diff_section_start -->
  <div id="${resourceId}_diff" class="snapshot-box diff-box fallback">
    <img src="${fallbackUri}" />
  </div>
  <!-- ${resourceId}_diff_section_end -->
  `;
}; 

const getResourceContainer = (resource: SnapshotResource, webview: Webview): string => {
  const header: string = `${resource.locale} | ${resource.viewport}`;
  const resourceId: string = `${resource.locale}_${resource.viewport.replace('_', '-')}`;
  const start: string = `
  <div class="resource-container">
    <h2 class="resource-header">${header}</h2>
    <div>
      <div class="tab-container">
        <button id="${resourceId}_reference_tab" class="tab-button active">Reference</button>
        <button id="${resourceId}_latest_tab" class="tab-button">Latest</button>
        <button id="${resourceId}_diff_tab" class="tab-button">Diff</button>
      </div>
  `;
  const end: string = `
    </div>
  </div>
  <hr />
  `;

  return `
  ${start}
  ${getReferenceFragment({referenceUri: resource.referenceUri, resourceId: resourceId}, webview)}
  ${getLatestFragment({latestUri: resource.latestUri, resourceId: resourceId}, webview)}
  ${getDiffFragment({
    referenceUri: resource.referenceUri, 
    latestUri: resource.latestUri, 
    diffUri: resource.diffUri, 
    resourceId: resourceId
  }, webview)}
  ${end}
  `;
};

const createHtmlForSnapshot = (snapshot: SnapshotWebviewOptions, webview: Webview): string => {
  const indexCssPath = webview.asWebviewUri(Uri.file(path.join(__filename, "..", "..", "..", 'resources', 'stylesheets', 'index.css')));
  const beerSliderCssPath = webview.asWebviewUri(Uri.file(path.join(__filename, "..", "..", "..", 'resources', 'stylesheets', 'BeerSlider.css')));
  const indexJsPath = webview.asWebviewUri(Uri.file(path.join(__filename, "..", "..", "..", 'resources', 'js', 'index.js')));
  const beerSliderJsPath = webview.asWebviewUri(Uri.file(path.join(__filename, "..", "..", "..", 'resources', 'js', 'BeerSlider.js')));
  const persistenceJsPath = webview.asWebviewUri(Uri.file(path.join(__filename, "..", "..", "..", 'resources', 'js', 'webviewPersistence.js')));
  const nonce: string = generateNonce();

  const start: string = getStartFragment({title: snapshot.title, indexCssUri: indexCssPath, beerSliderCssUri: beerSliderCssPath, nonce: nonce});
  const end: string = getEndFragment({indexJsUri: indexJsPath, beerSliderJsUri: beerSliderJsPath, persistenceJsUri: persistenceJsPath, nonce: nonce});

  let accumulator = start;
  snapshot.resources.forEach((resource: SnapshotResource): void => {
    accumulator += getResourceContainer(resource, webview);
  });
  accumulator += end;

  return accumulator;
};

export { createHtmlForSnapshot };

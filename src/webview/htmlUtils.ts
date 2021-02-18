import { Uri } from 'vscode';
import type { Webview } from 'vscode';

import ExtensionState from '../common/ExtensionState';
import ResourceRetriever from '../common/ResourceRetriever';
import type WdioSnapshot from '../tree-view/WdioSnapshot';
import type {
  DiffFragmentOptions,
  EndFragmentOptions,
  LatestFragmentOptions,
  ReferenceFragmentOptions,
  StartFragmentOptions,
} from '../types';
import type { WdioResource } from '../types';

const generateRandomString = (): string => {
  let nonce = '';
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    nonce += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  return nonce;
};

const getStartFragment = (options: StartFragmentOptions): string => {
  const title: string = options.title;
  const stylesheetUri: Uri = options.stylesheetUri;
  const nonce: string = options.nonce;
  const defaultTab = ExtensionState.configuration.defaultSnapshotTab;
  const fallbackTab = ExtensionState.configuration.fallbackSnapshotTab;
  const defaultDiff = ExtensionState.configuration.defaultDiffOption;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src 'nonce-${nonce}' vscode-resource:; style-src vscode-resource:;">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" type="text/css" href="${stylesheetUri}">
      <title>WDIO Snapshot Collection</title>
    </head>
    <body data-webview-default-tab="${defaultTab}" data-webview-fallback-tab="${fallbackTab}" data-webview-default-diff="${defaultDiff}">
      <div id="root">
        <h1 class="snapshot-title">${title}</h1>
        <div class="snapshot-container">
  `;
};

const getEndFragment = (options: EndFragmentOptions): string => {
  const scriptUri: Uri = options.scriptUri;
  const nonce: string = options.nonce;

  return `
        </div>
      </div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
  </html>
  `;
};

const getReferenceFragment = (options: ReferenceFragmentOptions, webview: Webview): string => {
  const referenceUri: Uri = webview.asWebviewUri(options.reference.uri);
  const resourceId: string = options.resourceId;

  if (options.reference.exists) {
    return `
    <div id="${resourceId}_reference" class="snapshot-box reference-box">
      <img class="${resourceId}_reference_img" src="${referenceUri}?${generateRandomString()}" />
    </div>
    `;
  }
  return `
  <div id="${resourceId}_reference" class="snapshot-box reference-box fallback">
    <svg viewBox="0 0 24 24" class="fallback-icon">
      <path fill="#000000" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
    </svg>
  </div>
  `;
};

const getLatestFragment = (options: LatestFragmentOptions, webview: Webview): string => {
  const latestUri: Uri = webview.asWebviewUri(options.latest.uri);
  const resourceId: string = options.resourceId;

  if (options.latest.exists) {
    return `
    <div id="${resourceId}_latest" class="snapshot-box latest-box">
      <img class="${resourceId}_latest_img" src="${latestUri}?${generateRandomString()}" />
    </div>
    `;
  }
  return `
  <div id="${resourceId}_latest" class="snapshot-box latest-box fallback">
    <svg viewBox="0 0 24 24" class="fallback-icon">
      <path fill="#000000" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
    </svg>
  </div>
  `;
};

const getDiffFragment = (options: DiffFragmentOptions, webview: Webview): string => {
  const referenceUri: Uri = webview.asWebviewUri(options.reference.uri);
  const latestUri: Uri = webview.asWebviewUri(options.latest.uri);
  const diffUri: Uri = webview.asWebviewUri(options.diff.uri);
  const resourceId: string = options.resourceId;

  if (options.reference.exists && options.latest.exists && options.diff.exists) {
    return `
    <!-- ${resourceId}_diff_section_start -->
    <div id="${resourceId}_diff" class="snapshot-box diff-box">
      <div class="diff-image-container">
        <div id="${resourceId}_diff_default" class="diff-default">
          <img class="${resourceId}_diff_img" src="${diffUri}?${generateRandomString()}" />
        </div>
        <div id="${resourceId}_diff_two-up" class="diff-two-up">
          <img class="${resourceId}_reference_img" src="${referenceUri}?${generateRandomString()}" />
          <img class="${resourceId}_latest_img" src="${latestUri}?${generateRandomString()}" />
        </div>
        <div id="${resourceId}_diff_slide" class="diff-slide beer-slider">
          <img class="${resourceId}_reference_img" src="${referenceUri}?${generateRandomString()}" />
          <div class="slide-latest beer-reveal">
            <img class="${resourceId}_latest_img" src="${latestUri}?${generateRandomString()}" />
          </div>
        </div>
        <div id="${resourceId}_diff_onion" class="diff-onion">
          <div class="diff-onion-image">
            <img class="${resourceId}_reference_img" src="${referenceUri}?${generateRandomString()}" />
            <img class="${resourceId}_latest_img" src="${latestUri}?${generateRandomString()}" />
          </div>
          <div class="onion-slider-container">
            <input type="range" min="0" max="100" value="50" step="1" class="onion-slider-input">
          </div>
        </div>
      </div>
      <div class="diff-button-group">
        <button id="${resourceId}_diff_default_button" class="diff-button">Default</button>
        <button id="${resourceId}_diff_two-up_button" class="diff-button">2-Up</button>
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
    <svg viewBox="0 0 24 24" class="fallback-icon">
      <path fill="#000000" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
    </svg>
  </div>
  <!-- ${resourceId}_diff_section_end -->
  `;
};

const getResourceContainer = (resource: WdioResource, webview: Webview): string => {
  let header = `${resource.locale} | ${resource.formFactor}`;
  if (resource.diff.exists) {
    header = `🔴 ${header}`;
  }
  const resourceId = `${resource.locale}_${resource.formFactor.replace('_', '-')}`;
  const start = `
  <div class="resource-container">
    <h2 class="resource-header">${header}</h2>
    <div>
      <div class="tab-container" data-resourceid="${resourceId}">
        <button id="${resourceId}_reference_tab" class="tab-button" data-exists=${resource.reference.exists}>Reference</button>
        <button id="${resourceId}_latest_tab" class="tab-button" data-exists=${resource.latest.exists}>Latest</button>
        <button id="${resourceId}_diff_tab" class="tab-button" data-exists=${resource.diff.exists}>Diff</button>
      </div>
  `;
  const end = `
    </div>
  </div>
  <hr />
  `;

  return `
  ${start}
  ${getReferenceFragment({ reference: resource.reference, resourceId: resourceId }, webview)}
  ${getLatestFragment({ latest: resource.latest, resourceId: resourceId }, webview)}
  ${getDiffFragment(
    {
      reference: resource.reference,
      latest: resource.latest,
      diff: resource.diff,
      resourceId: resourceId,
    },
    webview
  )}
  ${end}
  `;
};

const createHtmlForSnapshot = (snapshot: WdioSnapshot, webview: Webview): string => {
  const context = ExtensionState.context;
  if (!context) {
    return '';
  }

  const stylesheetPath = webview.asWebviewUri(Uri.file(ResourceRetriever.getDistFile('index.min.css') as string));
  const scriptPath = webview.asWebviewUri(Uri.file(ResourceRetriever.getDistFile('index.min.js') as string));
  const nonce: string = generateRandomString();

  const start: string = getStartFragment({
    title: snapshot.label as string,
    stylesheetUri: stylesheetPath,
    nonce: nonce,
  });
  const end: string = getEndFragment({ scriptUri: scriptPath, nonce: nonce });

  let accumulator = start;
  snapshot.resources.forEach((resource: WdioResource): void => {
    accumulator += getResourceContainer(resource, webview);
  });
  accumulator += end;

  return accumulator;
};

export { createHtmlForSnapshot };

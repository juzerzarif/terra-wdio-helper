import type { JsonObject } from 'type-fest';

import data from './webview-data.json';
import vscodeDarkVariables from './vscode-css-props/vscode-dark';
import vscodeHighContrastVariables from './vscode-css-props/vscode-high-contrast';
import vscodeLightVariables from './vscode-css-props/vscode-light';

/**
 * Add vscode JS api
 */
let apiAcquired = false;
window.acquireVsCodeApi = () => {
  if (apiAcquired) {
    throw new Error('An instance of the VS Code API has already been acquired');
  }
  apiAcquired = true;
  return Object.freeze({
    getState: () => JSON.parse(sessionStorage.getItem('wdiowebviewtest') || 'null'),
    setState: (newState) => {
      const state = JSON.parse(sessionStorage.getItem('wdiowebviewtest') || 'null');
      sessionStorage.setItem('wdiowebviewtest', JSON.stringify({ ...state, ...(newState as JsonObject) }));
    },
    postMessage: (message) => console.log('vscode.postMessage', message),
  });
};

/**
 * Add vscode theme specific styles
 */
const queryParams = new URLSearchParams(location.search);
const { vscodeTheme, cssVariables } = (() => {
  if (queryParams.get('vscode-theme-kind') === 'vscode-dark') {
    return { vscodeTheme: 'vscode-dark', cssVariables: vscodeDarkVariables };
  } else if (queryParams.get('vscode-theme-kind') === 'vscode-high-contrast') {
    return { vscodeTheme: 'vscode-high-contrast', cssVariables: vscodeHighContrastVariables };
  } else {
    return { vscodeTheme: 'vscode-light', cssVariables: vscodeLightVariables };
  }
})();
document.documentElement.setAttribute('style', cssVariables);
document.body.setAttribute('data-vscode-theme-kind', vscodeTheme);
document.body.classList.add(vscodeTheme);

require('../src/webview-ui/main');

setTimeout(() => {
  window.postMessage(data, '*');
  console.log('message posted');
}, 1000);

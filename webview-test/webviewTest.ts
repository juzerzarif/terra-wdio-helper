import type { JsonObject } from 'type-fest';

import data from './webview-data.json';

window.acquireVsCodeApi = () => ({
  getState: () => JSON.parse(sessionStorage.getItem('wdiowebviewtest') || 'null'),
  setState: (newState) => {
    const state = JSON.parse(sessionStorage.getItem('wdiowebviewtest') || 'null');
    sessionStorage.setItem('wdiowebviewtest', JSON.stringify({ ...state, ...(newState as JsonObject) }));
  },
  postMessage: (message) => console.log('vscode.postMessage', message),
});

require('../src/webview-ui/main');

setTimeout(() => {
  window.postMessage(data, '*');
  console.log('message posted');
}, 1000);

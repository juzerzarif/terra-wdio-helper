/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/explicit-module-boundary-types */
import { URI } from 'vscode-uri';
import type * as vscode from 'vscode';

export const window = {
  showErrorMessage: jest.fn(),
  createWebviewPanel: jest.fn((_, title: string) => new WebviewPanel(title)),
};

export const workspace = {
  getConfiguration: jest.fn(),
  getWorkspaceFolder: jest.fn(),
};

export class TreeItem {
  constructor() {}
}

export enum TreeItemCollapsibleState {
  None,
  Collapsed,
  Expanded,
}

export const EventEmitter = jest.fn(function (this: vscode.EventEmitter<unknown>) {
  this.event = jest.fn();
  this.fire = jest.fn();
});

export enum ViewColumn {
  Active,
}

export const WebviewPanel = jest.fn(function (this: vscode.WebviewPanel, title: string) {
  this.title = title;
  this.reveal = jest.fn();
  this.dispose = jest.fn();
  Object.defineProperties(this, {
    onDidChangeViewState: { value: jest.fn() },
    onDidDispose: { value: jest.fn() },
    webview: {
      value: {
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn(),
        asWebviewUri: jest.fn((uri) => uri),
      },
    },
  });
});

export { URI as Uri };

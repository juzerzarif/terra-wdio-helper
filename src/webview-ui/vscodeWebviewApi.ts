import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';
import type { JsonValue } from 'type-fest';
import type { Writable } from 'svelte/store';

import type { WdioWebview } from '../types';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      getState: () => Record<string, JsonValue> | undefined;
      setState: (state: JsonValue) => void;
      postMessage: (message: JsonValue) => void;
    };
  }
}

const vscode = window.acquireVsCodeApi();

const getState = (key: string) => vscode.getState()?.[key];

const setState = (key: string, value: JsonValue) => vscode.setState({ ...vscode.getState(), [key]: value });

export const vsCodeWritable = <T extends JsonValue>(key: string, initialValue: T): Writable<T> => {
  const stateStore = writable((getState(key) as T) || initialValue);
  const unsubscribe = stateStore.subscribe((value) => setState(key, value));
  onDestroy(unsubscribe);
  return stateStore;
};

export const sendWebviewMessage = (message: WdioWebview.Message): void => {
  vscode.postMessage(message as JsonValue);
};

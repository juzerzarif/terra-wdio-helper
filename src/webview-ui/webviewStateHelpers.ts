import { get, writable } from 'svelte/store';
import type { JsonObject } from 'type-fest';
import type { Readable } from 'svelte/store';

import type { WdioWebview } from '../types';

import { vsCodeWritable } from './vscodeWebviewApi';

type Snapshot = WdioWebview.Snapshot & JsonObject;
interface WebviewData {
  snapshotData?: Snapshot;
  extensionConfig?: WdioWebview.ExtensionConfig;
}
interface WebviewDataStores {
  snapshotData: Readable<Snapshot | null>;
  extensionConfig: Readable<WdioWebview.ExtensionConfig | null>;
}

/**
 * Returns a collection of stores with data needed to render the webview ui
 */
export const getWebviewData = (): WebviewDataStores => {
  const snapshotData = vsCodeWritable<Snapshot | null>('snapshot-data', null);
  const extensionConfig = vsCodeWritable<WdioWebview.ExtensionConfig | null>('webview-extension-config', null);

  window.addEventListener('message', ({ data }: { data: WebviewData }) => {
    data.snapshotData && snapshotData.set(data.snapshotData);
    data.extensionConfig && extensionConfig.set(data.extensionConfig);
    if (data.snapshotData || data.extensionConfig) {
      console.log('message received', data);
    }
  });

  return { snapshotData, extensionConfig };
};

/**
 * Returns an action to sync the scroll position of a container with the saved webview state
 */
export const createScrollSync = (): ((container: HTMLElement) => void) => {
  const scrollPosition = vsCodeWritable<{ top: number; left: number }>('scroll-position', { top: 0, left: 0 });
  return (container: HTMLElement) => {
    // Layout isn't yet calculated when the action is called
    requestAnimationFrame(() => container.scrollTo(get(scrollPosition)));
    const scrollListener = (event: Event) => {
      const top = (event.target as HTMLElement).scrollTop;
      const left = (event.target as HTMLElement).scrollLeft;
      scrollPosition.set({ top, left });
    };
    container.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  };
};

type VsCodeThemeKind = 'vscode-light' | 'vscode-dark' | 'vscode-high-contrast';

const VSCODE_THEME_ATTR = 'data-vscode-theme-kind';

const isVsCodeThemeDark = () => {
  const vscodeTheme = document.body.getAttribute(VSCODE_THEME_ATTR) as VsCodeThemeKind;
  return vscodeTheme === 'vscode-dark' || vscodeTheme === 'vscode-high-contrast';
};

/**
 * Returns a store with a boolean indicating whether the current vscode theme is a dark theme
 */
export const isCurrentThemeDark = (): Readable<boolean> => {
  const darkTheme = writable(isVsCodeThemeDark());

  const observer = new MutationObserver(([mutation]) => {
    if (mutation.type === 'attributes' && mutation.attributeName === VSCODE_THEME_ATTR) {
      darkTheme.set(isVsCodeThemeDark());
    }
  });
  observer.observe(document.body, { attributes: true });

  return darkTheme;
};

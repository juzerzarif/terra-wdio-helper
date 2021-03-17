import { get } from 'svelte/store';
import { mocked } from 'ts-jest/utils';
import { waitFor } from '@testing-library/svelte';
import type { Readable } from 'svelte/store';

import { createScrollSync, getWebviewData, isCurrentThemeDark } from '../../../src/webview-ui/webviewStateHelpers';
import { vsCodeWritable } from '../../../src/webview-ui/vscodeWebviewApi';

jest.mock('../../../src/webview-ui/vscodeWebviewApi', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  vsCodeWritable: jest.fn((_: string, init: unknown) => require('svelte/store').writable(init)),
}));

const mockVsCodeWritable = mocked(vsCodeWritable);

describe('Webview state helpers', () => {
  beforeEach(() => {
    mockVsCodeWritable.mockClear();
  });

  describe('getWebviewData', () => {
    it('should update the snapshot data store when a message with snapshot data is received', async () => {
      const { snapshotData } = getWebviewData();
      window.postMessage({ snapshotData: 'some snapshot data' }, '*');
      await waitFor(() => expect(get(snapshotData)).toEqual('some snapshot data'));
    });

    it('should update the extension config store when a message with extension config data is received', async () => {
      const { extensionConfig } = getWebviewData();
      window.postMessage({ extensionConfig: 'some extension config' }, '*');
      await waitFor(() => expect(get(extensionConfig)).toEqual('some extension config'));
    });
  });

  describe('createScrollSync', () => {
    const buildScrollContainer = () => {
      const element = document.createElement('div');
      const scrollListener: { current: unknown } = { current: null };
      element.scrollTo = jest.fn();
      element.addEventListener = (_: string, listener: unknown) => {
        scrollListener.current = listener;
      };
      element.removeEventListener = () => {
        scrollListener.current = null;
      };
      return { element, scrollListener };
    };

    it('should scroll the target container to the restored scroll position when the action is called', async () => {
      const { element } = buildScrollContainer();
      createScrollSync()(element);
      await waitFor(() => expect(element.scrollTo).toHaveBeenCalledTimes(1));
      expect(element.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
    });

    it('should update the scroll position stored in state when the container is scrolled', () => {
      const { element, scrollListener } = buildScrollContainer();
      createScrollSync()(element);
      // eslint-disable-next-line @typescript-eslint/ban-types
      (scrollListener.current as Function)({ target: { scrollTop: 12, scrollLeft: 34 } });
      const scrollStore = mockVsCodeWritable.mock.results[0].value as Readable<{ top: number; left: number }>;
      expect(get(scrollStore)).toEqual({ top: 12, left: 34 });
    });

    it('should remove the scroll listener when the destroy method is called', () => {
      const { element, scrollListener } = buildScrollContainer();
      const { destroy } = createScrollSync()(element);
      expect(scrollListener.current).not.toEqual(null);
      destroy();
      expect(scrollListener.current).toEqual(null);
    });
  });

  describe('isCurrentThemeDark', () => {
    it('should return false when no vscode theme attribute is set', () => {
      const darkMode = isCurrentThemeDark();
      expect(get(darkMode)).toEqual(false);
    });

    it('should return false when the vscode theme attribute is set to a light theme', () => {
      document.body.setAttribute('data-vscode-theme-kind', 'vscode-light');
      const darkMode = isCurrentThemeDark();
      expect(get(darkMode)).toEqual(false);
    });

    it('should return true when the vscode theme attribute is set to a dark theme', () => {
      document.body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
      const darkMode = isCurrentThemeDark();
      expect(get(darkMode)).toEqual(true);
    });

    it('should return true when the vscode theme attribute is set to a high contrast theme', () => {
      document.body.setAttribute('data-vscode-theme-kind', 'vscode-high-contrast');
      const darkMode = isCurrentThemeDark();
      expect(get(darkMode)).toEqual(true);
    });

    it('should update the dark mode store when the vscode theme attribute changes', async () => {
      document.body.removeAttribute('data-vscode-theme-kind');
      const darkMode = isCurrentThemeDark();
      expect(get(darkMode)).toEqual(false);
      document.body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
      await waitFor(() => expect(get(darkMode)).toEqual(true));
    });
  });
});

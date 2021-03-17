import { get } from 'svelte/store';
import { mocked } from 'ts-jest/utils';

import { sendWebviewMessage, vsCodeWritable } from '../../../src/webview-ui/vscodeWebviewApi';

jest.mock('svelte');

const vsCodeApi = window.acquireVsCodeApi();
const mockVsCodeApi = mocked(vsCodeApi);

describe('vscode webview api', () => {
  describe('vsCodeWritable', () => {
    it('should initialize the store with the initial value when there is no saved vscode state', () => {
      const store = vsCodeWritable('test', 'initial value');
      expect(get(store)).toEqual('initial value');
    });

    it('should use the saved vscode state as the initial value when it exists', () => {
      mockVsCodeApi.getState.mockReturnValue({ test: 'saved state' });
      const store = vsCodeWritable('test', 'initial value');
      expect(get(store)).toEqual('saved state');
    });

    it('should set the vscode state when the store is initialized', () => {
      vsCodeWritable('test', 'initial value');
      expect(mockVsCodeApi.setState).toHaveBeenCalledTimes(1);
      expect(mockVsCodeApi.setState).toHaveBeenCalledWith({ test: 'initial value' });
    });

    it('should update the vscode state when the store is updated', () => {
      const store = vsCodeWritable<string>('test', 'initial value');
      store.set('updated value');
      expect(mockVsCodeApi.setState).toHaveBeenCalledTimes(2);
      expect(mockVsCodeApi.setState).toHaveBeenLastCalledWith({ test: 'updated value' });
    });
  });

  describe('sendWebviewMessage', () => {
    it('should post a vscode webview message with the provided message', () => {
      sendWebviewMessage('some message');
      expect(mockVsCodeApi.postMessage).toHaveBeenCalledTimes(1);
      expect(mockVsCodeApi.postMessage).toHaveBeenCalledWith('some message');
    });
  });
});

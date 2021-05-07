import mockfs from 'mock-fs';
import { Uri, window } from 'vscode';
import { mocked } from 'ts-jest/utils';
import type { ExtensionContext } from 'vscode';

import ExtensionState from '../../../src/common/ExtensionState';
import WdioSnapshot from '../../../src/tree-view/WdioSnapshot';
import WdioWebviewPanel from '../../../src/webview/WdioWebviewPanel';
import WorkspaceFolderItem from '../../../src/tree-view/WorkspaceFolder';
import { replaceReferenceWithLatest } from '../../../src/common/utils';
import type { UriMap, WdioWebview } from '../../../src/types';

// eslint-disable-next-line @typescript-eslint/ban-types
jest.mock('lodash/debounce', () => (fn: Function) => fn);
jest.mock('../../../src/common/ResourceRetriever', () => ({
  getIcon: jest.fn((path) => path),
  getThemedIcon: jest.fn((path) => path),
  getDistFile: jest.fn((path) => path),
  getFont: jest.fn((path) => path),
}));
jest.mock('../../../src/common/utils', () => ({
  ...jest.requireActual('../../../src/common/utils'),
  replaceReferenceWithLatest: jest.fn(),
}));

const mockWindow = mocked(window);

describe('WdioWebviewPanel', () => {
  const buildSnapshot = () => {
    const snapshot = new WdioSnapshot('snapshot.png', 'parentId');
    snapshot.addResource({
      locale: 'locale',
      formFactor: 'formFactor',
      reference: { uri: Uri.file('/root/reference/locale/formFactor/spec'), exists: true },
      latest: { uri: Uri.file('/root/latest/locale/formFactor/spec'), exists: true },
      diff: { uri: Uri.file('/root/diff/locale/formFactor/spec'), exists: true },
    });
    return snapshot;
  };

  const buildWebviewSnapshot = (snapshot: WdioSnapshot): WdioWebview.Snapshot => {
    const buildImageData = ({ uri }: UriMap) =>
      expect.objectContaining({ src: expect.stringContaining(uri.fsPath), exists: true });

    return {
      name: snapshot.label,
      resources: snapshot.resources.map((resource) => ({
        locale: resource.locale,
        formFactor: resource.formFactor,
        reference: buildImageData(resource.reference),
        latest: buildImageData(resource.latest),
        diff: buildImageData(resource.diff),
      })),
    };
  };

  beforeEach(() => {
    const context = ({ subscriptions: [] } as unknown) as ExtensionContext;
    jest.spyOn(ExtensionState, 'context', 'get').mockReturnValue(context);
    mockWindow.createWebviewPanel.mockClear();
    mockWindow.showErrorMessage.mockClear();
    mocked(replaceReferenceWithLatest).mockClear();
    WdioWebviewPanel['openPanels'] = [];
    mockfs({
      '/root/reference/locale/formFactor/spec/snapshot.png': 'content',
      '/root/latest/locale/formFactor/spec/snapshot.png': 'content',
      '/root/diff/locale/formFactor/spec/snapshot.png': 'content',
    });
  });

  afterAll(() => mockfs.restore());

  describe('webview panel construction', () => {
    it('should create a new webview panel for a snapshot', () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const webviewPanel = mockWindow.createWebviewPanel.mock.results[0].value;
      expect(webviewPanel.title).toEqual('snapshot.png');
    });

    it('should reveal an existing webview if one already exists for a given snapshot', () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const webviewPanel = mockWindow.createWebviewPanel.mock.results[0].value;
      expect(webviewPanel.reveal).toHaveBeenCalledTimes(1);
    });

    it('should send snapshot data to the webview once the webview is ready', () => {
      const snapshot = buildSnapshot();
      WdioWebviewPanel.createOrShow(snapshot);
      const { onDidReceiveMessage, postMessage } = mockWindow.createWebviewPanel.mock.results[0].value.webview;
      onDidReceiveMessage.mock.calls[0][0]({ intent: 'webviewReady', ready: true });
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ snapshotData: buildWebviewSnapshot(snapshot) })
      );
    });
  });

  describe('webview panel updates', () => {
    it('should remove the webview panel from the list of open panels when the panel is disposed', () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const { onDidDispose } = mockWindow.createWebviewPanel.mock.results[0].value;
      expect(WdioWebviewPanel['openPanels']).toHaveLength(1);
      onDidDispose.mock.calls[0][0]();
      expect(WdioWebviewPanel['openPanels']).toEqual([]);
    });

    it('should send a message to update the webview data when snapshots are updated', () => {
      const snapshot = buildSnapshot();
      WdioWebviewPanel.createOrShow(snapshot);
      const { onDidReceiveMessage, postMessage } = mockWindow.createWebviewPanel.mock.results[0].value.webview;
      onDidReceiveMessage.mock.calls[0][0]({ intent: 'webviewReady', ready: true });
      postMessage.mockClear();
      WdioWebviewPanel.updateAllOpenWebviews();
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ snapshotData: buildWebviewSnapshot(snapshot) })
      );
    });

    it('should not send a message to upate a webview while it is not visible', () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const {
        onDidChangeViewState,
        webview: { onDidReceiveMessage, postMessage },
      } = mockWindow.createWebviewPanel.mock.results[0].value;
      onDidReceiveMessage.mock.calls[0][0]({ intent: 'webviewReady', ready: true });
      onDidChangeViewState.mock.calls[0][0]({ webviewPanel: { visible: false } });
      postMessage.mockClear();
      WdioWebviewPanel.updateAllOpenWebviews();
      expect(postMessage).not.toHaveBeenCalled();
    });

    it('should not send a message to update a webview if the webview does not belong to the workspace', () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const { onDidReceiveMessage, postMessage } = mockWindow.createWebviewPanel.mock.results[0].value.webview;
      onDidReceiveMessage.mock.calls[0][0]({ intent: 'webviewReady', ready: true });
      postMessage.mockClear();
      WdioWebviewPanel.updateAllOpenWebviews(new WorkspaceFolderItem(Uri.file('/some/other/workspace')));
      expect(postMessage).not.toHaveBeenCalled();
    });

    it('should dispose a panel when it has no snapshot resources left', () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const { dispose } = mockWindow.createWebviewPanel.mock.results[0].value;
      mockfs({});
      WdioWebviewPanel.updateAllOpenWebviews();
      expect(dispose).toHaveBeenCalledTimes(1);
    });

    it('should replace a single reference snapshot with the latest when it receives a replace post message', () => {
      const snapshot = buildSnapshot();
      const mockResource = {
        locale: 'locale2',
        formFactor: 'formFactor2',
        reference: { uri: Uri.file('reference-snapshot.png'), exists: false },
        latest: { uri: Uri.file('latest-snapshot.png'), exists: false },
        diff: { uri: Uri.file('diff-snapshot.png'), exists: false },
      };
      snapshot.addResource(mockResource);
      WdioWebviewPanel.createOrShow(snapshot);
      const { onDidReceiveMessage } = mockWindow.createWebviewPanel.mock.results[0].value.webview;
      onDidReceiveMessage.mock.calls[0][0]({
        intent: 'replaceReferenceWithLatest',
        locale: 'locale2',
        formFactor: 'formFactor2',
      });
      expect(replaceReferenceWithLatest).toHaveBeenCalledTimes(1);
      expect(replaceReferenceWithLatest).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: [expect.objectContaining({ locale: 'locale2', formFactor: 'formFactor2' })],
        })
      );
    });

    it("should show an error message when the locale and form factor requested for replacement don't exist", () => {
      WdioWebviewPanel.createOrShow(buildSnapshot());
      const { onDidReceiveMessage } = mockWindow.createWebviewPanel.mock.results[0].value.webview;
      onDidReceiveMessage.mock.calls[0][0]({
        intent: 'replaceReferenceWithLatest',
        locale: 'fakeLocale',
        formFactor: 'fakeFormFactor',
      });
      expect(replaceReferenceWithLatest).not.toHaveBeenCalled();
      expect(mockWindow.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        'snapshot.png snapshot for locale fakeLocale and form factor fakeFormFactor does not exist.'
      );
    });
  });
});

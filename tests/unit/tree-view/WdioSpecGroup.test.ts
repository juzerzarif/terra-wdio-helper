import mockfs from 'mock-fs';
import { Uri, window } from 'vscode';
import { mocked } from 'ts-jest/utils';

import ExtensionState from '../../../src/common/ExtensionState';
import WdioSpecGroup from '../../../src/tree-view/WdioSpecGroup';
import WorkspaceFolderItem from '../../../src/tree-view/WorkspaceFolder';
import type { ExtensionConfiguration } from '../../../src/types';

jest.mock('../../../src/common/ResourceRetriever', () => ({ getThemedIcon: jest.fn((path) => path) }));

const mockWindow = mocked(window);

describe('WdioSpecGroup', () => {
  afterAll(() => mockfs.restore());

  describe('spec group retrieval', () => {
    beforeEach(() => {
      const config = { testFolderPath: { '/path/to/workspace': 'test/folder' } };
      mockfs({
        '/path/to/workspace/test/folder': {
          __snapshots__: {},
          specGroupA: { __snapshots__: {} },
          path: { to: { specGroupB: { __snapshots__: {} } } },
        },
      });
      jest.spyOn(ExtensionState, 'configuration', 'get').mockReturnValue((config as unknown) as ExtensionConfiguration);
      mockWindow.showErrorMessage.mockClear();
    });

    it('should return a list of all spec groups in the given workspace', () => {
      const specGroups = WdioSpecGroup.getAllWdioSpecGroups(new WorkspaceFolderItem(Uri.file('/path/to/workspace')));
      expect(specGroups.map((specGroup) => specGroup.label)).toEqual(['.', 'specGroupB', 'specGroupA']);
    });

    it('should return an empty list if there are no __snapshots__ directories under the test folder', () => {
      mockfs({ '/path/to/workspace/test/folder': { emptyFolder: {} } });
      const specGroups = WdioSpecGroup.getAllWdioSpecGroups(new WorkspaceFolderItem(Uri.file('/path/to/workspace')));
      expect(specGroups).toEqual([]);
    });

    it('should use the default test folder path if a test folder path is not configured for the workspace', () => {
      const config = ({ testFolderPath: {} } as unknown) as ExtensionConfiguration;
      jest.spyOn(ExtensionState, 'configuration', 'get').mockReturnValue(config);
      mockfs({ '/path/to/workspace/tests/wdio': { __snapshots__: {} } });

      const specGroups = WdioSpecGroup.getAllWdioSpecGroups(new WorkspaceFolderItem(Uri.file('/path/to/workspace')));
      expect(specGroups.map((specGroup) => specGroup.label)).toEqual(['.']);
    });

    it('should show an error message when the test folder does not exist in the workspace', () => {
      mockfs({ '/path/to/workspace': {} });
      const specGroups = WdioSpecGroup.getAllWdioSpecGroups(new WorkspaceFolderItem(Uri.file('/path/to/workspace')));
      expect(mockWindow.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        'Test folder path does not exist for workspace folder /path/to/workspace'
      );
      expect(specGroups).toEqual([]);
    });

    it('should show an error message when the test folder path for the workspace is not a directory', () => {
      mockfs({ '/path/to/workspace': { test: { folder: 'content' } } });
      const specGroups = WdioSpecGroup.getAllWdioSpecGroups(new WorkspaceFolderItem(Uri.file('/path/to/workspace')));
      expect(mockWindow.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        'Test folder path is not a directory for workspace folder /path/to/workspace'
      );
      expect(specGroups).toEqual([]);
    });
  });

  describe('spec group construction', () => {
    it('should set the icon as a normal folder if a diff directory does not exist in the spec group', () => {
      mockfs({ '/root': { specGroup: {} } });
      const specGroup = new WdioSpecGroup(Uri.file('/root/specGroup'));
      expect(specGroup.iconPath).toEqual('folder_icon.svg');
    });

    it('should set the icon as a diff folder if a diff directory exists in the spec group', () => {
      mockfs({ '/root': { specGroup: { diff: {} } } });
      const specGroup = new WdioSpecGroup(Uri.file('/root/specGroup'));
      expect(specGroup.iconPath).toEqual('folder_diff_icon.svg');
    });

    it('should use the label provided during construction if one is provided', () => {
      const specGroup = new WdioSpecGroup(Uri.file('some/file'), 'some label');
      expect(specGroup.label).toEqual('some label');
    });

    it('should use the name of the __snapshots__ parent directory if no label is provided during construction', () => {
      const specGroup = new WdioSpecGroup(Uri.file('path/to/specGroup/__snapshots__'));
      expect(specGroup.label).toEqual('specGroup');
    });

    it('should use the basename of the resource directory if the resource directory is not named __snapshots__ and no label is provided during construction', () => {
      const specGroup = new WdioSpecGroup(Uri.file('path/to/specGroup'));
      expect(specGroup.label).toEqual('specGroup');
    });
  });
});

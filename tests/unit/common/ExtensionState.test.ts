import { mocked } from 'ts-jest/utils';
import { when } from 'jest-when';
import { workspace } from 'vscode';
import type { ExtensionContext, WorkspaceConfiguration } from 'vscode';

import ExtensionState from '../../../src/common/ExtensionState';
import type WorkspaceFolderItem from '../../../src/tree-view/WorkspaceFolder';
import type { ExtensionConfiguration } from '../../../src/types';

const mockWorkspace = mocked(workspace, true);

describe('ExtensionState', () => {
  describe('configuration', () => {
    interface _Config extends Partial<Omit<ExtensionConfiguration, 'testFolderPath'>> {
      testFolderPath?: string;
    }
    const buildWorkspaceConfig = (config: _Config): WorkspaceConfiguration => {
      const mapInitList = Object.keys(config).map((key): [string, unknown] => [key, config[key]]);
      return (new Map(mapInitList) as unknown) as WorkspaceConfiguration;
    };

    const mockWorkspaceFolders = (value: unknown) => {
      // workspaceFolders is a readonly property
      Object.defineProperty(mockWorkspace, 'workspaceFolders', { value, configurable: true });
    };

    const mockBaseConfig: Omit<ExtensionConfiguration, 'testFolderPath'> = {
      defaultSnapshotTab: 'diff',
      fallbackSnapshotTab: 'latest',
      defaultDiffOption: 'slide',
    };

    beforeEach(() => {
      mockWorkspaceFolders(undefined);
      mockWorkspace.getConfiguration.mockReset();
    });

    it('should correctly configure the extension state', () => {
      const mockExtensionContext = {} as ExtensionContext;
      mockWorkspaceFolders([{ uri: { fsPath: 'some/workspace/folder' } }]);
      when(mockWorkspace.getConfiguration)
        .calledWith('terraWdioHelper')
        .mockReturnValue(buildWorkspaceConfig(mockBaseConfig));
      when(mockWorkspace.getConfiguration)
        .calledWith('terraWdioHelper', expect.any(Object))
        .mockReturnValue(buildWorkspaceConfig({ testFolderPath: 'some/test/folder' }));

      ExtensionState.configureExtensionState(mockExtensionContext);
      expect(ExtensionState.context).toBe(mockExtensionContext);
      expect(ExtensionState.configuration).toEqual({
        defaultSnapshotTab: 'diff',
        fallbackSnapshotTab: 'latest',
        defaultDiffOption: 'slide',
        testFolderPath: { 'some/workspace/folder': 'some/test/folder' },
      });
    });

    it('should configure the extension state with defaults when no configs are provided', () => {
      const mockExtensionContext = {} as ExtensionContext;
      mockWorkspaceFolders([{ uri: { fsPath: 'some/workspace/folder' } }]);
      mockWorkspace.getConfiguration.mockReturnValue(buildWorkspaceConfig({}));

      ExtensionState.configureExtensionState(mockExtensionContext);
      expect(ExtensionState.context).toBe(mockExtensionContext);
      expect(ExtensionState.configuration).toEqual({
        defaultSnapshotTab: 'reference',
        fallbackSnapshotTab: 'reference',
        defaultDiffOption: 'two-up',
        testFolderPath: { 'some/workspace/folder': 'tests/wdio' },
      });
    });

    it('should configure the extension state correctly when there are no workspace folders', () => {
      mockWorkspace.getConfiguration.mockReturnValue(buildWorkspaceConfig({}));

      ExtensionState.configureExtensionState({} as ExtensionContext);
      expect(ExtensionState.configuration.testFolderPath).toEqual({});
    });
  });

  describe('workspace folder items', () => {
    it('should set the workspace folder items correctly', () => {
      ExtensionState.workspaceFolderItems = [{} as WorkspaceFolderItem];
      expect(ExtensionState.workspaceFolderItems).toEqual([{}]);
    });
  });
});

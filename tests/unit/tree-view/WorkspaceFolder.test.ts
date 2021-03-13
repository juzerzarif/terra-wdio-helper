import { Uri, workspace } from 'vscode';
import { mocked } from 'ts-jest/utils';

import WorkspaceFolderItem from '../../../src/tree-view/WorkspaceFolder';

jest.mock('../../../src/common/ResourceRetriever', () => ({
  getThemedIcon: jest.fn(),
}));

const mockWorkspace = mocked(workspace);

describe('WorkspaceFolderItem', () => {
  it('should create a list of workspace folder items for each workspace folder', () => {
    const workspaceFolders = [{ uri: Uri.file('path/to/workspaceA') }, { uri: Uri.file('path/to/workspaceB') }];
    Object.defineProperty(mockWorkspace, 'workspaceFolders', { value: workspaceFolders, configurable: true });

    const [itemA, itemB] = WorkspaceFolderItem.getAllWorkspaceFolderItems();
    expect(itemA.label).toEqual('workspaceA');
    expect(itemB.label).toEqual('workspaceB');
  });

  it('should return an empty list if there are no workspace folders', () => {
    Object.defineProperty(mockWorkspace, 'workspaceFolders', { value: undefined, configurable: true });

    const items = WorkspaceFolderItem.getAllWorkspaceFolderItems();
    expect(items.length).toEqual(0);
  });
});

import { EventEmitter, Uri } from 'vscode';
import { mocked } from 'ts-jest/utils';
import type { TreeItem } from 'vscode';

import WdioHelperTreeProvider from '../../../src/tree-view/WdioHelperTreeProvider';
import WdioSnapshot from '../../../src/tree-view/WdioSnapshot';
import WdioSpec from '../../../src/tree-view/WdioSpec';
import WdioSpecGroup from '../../../src/tree-view/WdioSpecGroup';
import WorkspaceFolderItem from '../../../src/tree-view/WorkspaceFolder';

jest.mock('../../../src/common/ResourceRetriever', () => ({ getThemedIcon: jest.fn(), getIcon: jest.fn() }));

const MockEventEmitter = mocked(EventEmitter);

describe('WdioHelperTreeProvider', () => {
  describe('refresh', () => {
    beforeEach(() => {
      MockEventEmitter.mockClear();
    });

    it('should fire a tree data change event when the tree is refreshed', () => {
      const treeProvider = new WdioHelperTreeProvider();
      treeProvider.refresh();
      expect(MockEventEmitter.mock.instances[0].fire).toHaveBeenCalledTimes(1);
    });

    it('should fire a tree data change event with an element when a specific tree element is refreshed', () => {
      const treeProvider = new WdioHelperTreeProvider();
      const workspaceFolderItem = new WorkspaceFolderItem(Uri.file('workspace'));
      treeProvider.refresh(workspaceFolderItem);
      expect(MockEventEmitter.mock.instances[0].fire).toHaveBeenCalledTimes(1);
      expect(MockEventEmitter.mock.instances[0].fire).toHaveBeenCalledWith(workspaceFolderItem);
    });
  });

  describe('getTreeItem', () => {
    it('should return the same element that was provided', () => {
      const treeProvider = new WdioHelperTreeProvider();
      const treeItem = new WorkspaceFolderItem(Uri.file('workspace'));
      expect(treeProvider.getTreeItem(treeItem)).toBe(treeItem);
    });
  });

  describe('getChildren', () => {
    const buildTreeItems = <T extends TreeItem>(labels: string[]) => labels.map((label) => ({ label } as T));

    it('should return all workspace folders when no parent is provided', () => {
      const workspaceFolderItems = buildTreeItems<WorkspaceFolderItem>(['workspaceA', 'workspaceB']);
      jest.spyOn(WorkspaceFolderItem, 'getAllWorkspaceFolderItems').mockReturnValue(workspaceFolderItems);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren()).toEqual(workspaceFolderItems);
    });

    it('should return all spec groups when there is only one workspace folder', () => {
      const workspaceFolderItem = new WorkspaceFolderItem(Uri.file('workspace'));
      const specGroups = buildTreeItems<WdioSpecGroup>(['specGroupA', 'specGroupB']);
      jest.spyOn(WorkspaceFolderItem, 'getAllWorkspaceFolderItems').mockReturnValue([workspaceFolderItem]);
      jest.spyOn(WdioSpecGroup, 'getAllWdioSpecGroups').mockReturnValue(specGroups);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren()).toEqual(specGroups);
    });

    it('should return all spec groups when a workspace folder item is provided as the parent', () => {
      const specGroups = buildTreeItems<WdioSpecGroup>(['specGroupA', 'specGroupB']);
      jest.spyOn(WdioSpecGroup, 'getAllWdioSpecGroups').mockReturnValue(specGroups);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren(new WorkspaceFolderItem(Uri.file('workspace')))).toEqual(specGroups);
    });

    it('should return all spec folders when there is only one spec group', () => {
      const specGroup = new WdioSpecGroup(Uri.file('specGroup'), 'specGroup');
      const specFolders = buildTreeItems<WdioSpec>(['specA', 'specB']);
      jest.spyOn(WdioSpecGroup, 'getAllWdioSpecGroups').mockReturnValue([specGroup]);
      jest.spyOn(WdioSpec, 'getAllWdioSpecs').mockReturnValue(specFolders);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren(new WorkspaceFolderItem(Uri.file('workspace')))).toEqual(specFolders);
    });

    it('should return all spec folders when a spec group is provided as a parent', () => {
      const specFolders = buildTreeItems<WdioSpec>(['specA', 'specB']);
      jest.spyOn(WdioSpec, 'getAllWdioSpecs').mockReturnValue(specFolders);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren(new WdioSpecGroup(Uri.file('specGroup'), 'specGroup'))).toEqual(specFolders);
    });

    it('should return all snapshots when a spec is provided as a parent', () => {
      const snapshots = buildTreeItems<WdioSnapshot>(['snapshotA', 'snapshotB']);
      jest.spyOn(WdioSnapshot, 'getAllWdioSnapshots').mockReturnValue(snapshots);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren(new WdioSpec('spec', Uri.file('spec/path')))).toEqual(snapshots);
    });

    it('should sort the tree items by label numerically i.e. "2" < "10"', () => {
      const treeItems = buildTreeItems<WorkspaceFolderItem>(['workspace1', 'workspace10', 'workspace2']);
      jest.spyOn(WorkspaceFolderItem, 'getAllWorkspaceFolderItems').mockReturnValue(treeItems);
      const treeProvider = new WdioHelperTreeProvider();
      expect(treeProvider.getChildren()).toEqual(buildTreeItems(['workspace1', 'workspace2', 'workspace10']));
    });

    it('should sort a tree item labelled as "." as the first in a list', () => {
      [
        ['.', 'workspaceA', 'workspaceB'],
        ['workspaceA', '.', 'workspaceB'],
        ['workspaceA', 'workspaceB', '.'],
      ].forEach((items) => {
        const treeItems = buildTreeItems<WorkspaceFolderItem>(items);
        jest.spyOn(WorkspaceFolderItem, 'getAllWorkspaceFolderItems').mockReturnValue(treeItems);
        const treeProvider = new WdioHelperTreeProvider();
        expect(treeProvider.getChildren()).toEqual(buildTreeItems(['.', 'workspaceA', 'workspaceB']));
      });
    });
  });
});

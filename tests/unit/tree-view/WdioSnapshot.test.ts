import mockfs from 'mock-fs';
import { Uri } from 'vscode';

import WdioSnapshot from '../../../src/tree-view/WdioSnapshot';
import WdioSpec from '../../../src/tree-view/WdioSpec';
import { buildUriMap } from '../../../src/common/utils';
import type { WdioResource } from '../../../src/types';

jest.mock('../../../src/common/ResourceRetriever', () => ({
  getIcon: jest.fn((path) => path),
  getThemedIcon: jest.fn(),
}));

describe('WdioSnapshot', () => {
  afterAll(() => mockfs.restore());

  it('should return all snapshots for a given spec', () => {
    mockfs({
      '/specGroup/reference/en/chrome_tiny/spec': { 'snapshotA.png': 'content', 'snapshotB.png': 'content' },
      '/specGroup/reference/en/chrome_medium/spec': { 'snapshotA.png': 'content', 'snapshotB.png': 'content' },
    });
    const spec = new WdioSpec('spec', Uri.file('/specGroup'));
    spec.addResource('en', 'chrome_tiny');
    spec.addResource('en', 'chrome_medium');
    const snapshots = WdioSnapshot.getAllWdioSnapshots(spec);
    ['snapshotA.png', 'snapshotB.png'].forEach((snapshotName, i) => {
      expect(snapshots[i].label).toEqual(snapshotName);
      expect(snapshots[i].resources.map(({ locale, formFactor }) => ({ locale, formFactor }))).toEqual([
        { locale: 'en', formFactor: 'chrome_tiny' },
        { locale: 'en', formFactor: 'chrome_medium' },
      ]);
    });
  });

  it('should set the icon as a normal snapshot icon if no diff resource is added to the snapshot', () => {
    mockfs({ '/root/reference/spec/snapshot.png': 'content', '/root/latest/spec/snapshot.png': 'content' });
    const snapshot = new WdioSnapshot('snapshot.png', 'parentId');
    snapshot.addResource({
      reference: buildUriMap('/root/reference/spec'),
      latest: buildUriMap('/root/latest/spec'),
      diff: buildUriMap('/root/diff/spec'),
    } as WdioResource);
    expect(snapshot.iconPath).toEqual('snapshot_icon.png');
  });

  it('should set the icon as a diff snapshot icon if a diff resource is added to the snapshot', () => {
    mockfs({
      '/root/reference/spec/snapshot.png': 'content',
      '/root/latest/spec/snapshot.png': 'content',
      '/root/diff/spec/snapshot.png': 'content',
    });
    const snapshot = new WdioSnapshot('snapshot.png', 'parentId');
    snapshot.addResource({
      reference: buildUriMap('/root/reference/spec'),
      latest: buildUriMap('/root/latest/spec'),
      diff: buildUriMap('/root/diff/spec'),
    } as WdioResource);
    expect(snapshot.iconPath).toEqual('snapshot_diff_icon.png');
  });
});

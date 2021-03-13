import mockfs from 'mock-fs';
import { Uri } from 'vscode';
import type FileSystem from 'mock-fs/lib/filesystem';

import WdioSpec from '../../../src/tree-view/WdioSpec';
import WdioSpecGroup from '../../../src/tree-view/WdioSpecGroup';

jest.mock('../../../src/common/ResourceRetriever', () => ({ getThemedIcon: jest.fn((path) => path) }));

describe('WdioSpec', () => {
  const defaultSpecFolders = {
    specFolderA: { 'snapshotA.png': 'content', 'snapshotB.png': 'content' },
    specFolderB: { 'snapshotA.png': 'content', 'snapshotB.png': 'content' },
  };

  const setupFilesystem = (specFolders: FileSystem.DirectoryItem) => {
    const formFactors = { chrome_tiny: specFolders, chrome_medium: specFolders };
    mockfs({
      '/specGroup': {
        reference: { en: formFactors, theme: { en: formFactors } },
        latest: { en: formFactors, theme: { en: formFactors } },
        diff: { en: formFactors, theme: { en: formFactors } },
      },
    });
  };

  beforeEach(() => {
    setupFilesystem(defaultSpecFolders);
  });

  afterAll(() => mockfs.restore());

  it('should return all specs for a given spec group', () => {
    const specs = WdioSpec.getAllWdioSpecs(new WdioSpecGroup(Uri.file('/specGroup')));
    ['specFolderA', 'specFolderB'].forEach((specName, i) => {
      expect(specs[i].label).toEqual(specName);
      expect(specs[i].resources.map(({ locale, formFactor }) => ({ locale, formFactor }))).toEqual([
        { locale: 'en', formFactor: 'chrome_medium' },
        { locale: 'en', formFactor: 'chrome_tiny' },
        { locale: 'theme/en', formFactor: 'chrome_medium' },
        { locale: 'theme/en', formFactor: 'chrome_tiny' },
      ]);
    });
  });

  it('should sort all the specs numerically i.e. "2" < "10"', () => {
    setupFilesystem({
      specFolder10: { 'snapshot.png': 'content' },
      specFolder2: { 'snapshot.png': 'content' },
    });
    const specs = WdioSpec.getAllWdioSpecs(new WdioSpecGroup(Uri.file('/specGroup')));
    expect(specs.map((spec) => spec.label)).toEqual(['specFolder2', 'specFolder10']);
  });

  it('should set the icon as a normal folder if no diff resource was added to the spec', () => {
    mockfs({
      '/specGroup': {
        reference: { en: { chrome_tiny: { specFolder: {} } } },
        latest: { en: { chrome_tiny: { specFolder: {} } } },
      },
    });
    const spec = new WdioSpec('specFolder', Uri.file('/specGroup'));
    spec.addResource('en', 'chrome_tiny');
    expect(spec.iconPath).toEqual('folder_icon.svg');
  });

  it('should set the icon as a diff folder if a diff resource was added to the spec', () => {
    mockfs({
      '/specGroup': {
        reference: { en: { chrome_tiny: { specFolder: {} } } },
        latest: { en: { chrome_tiny: { specFolder: {} } } },
        diff: { en: { chrome_tiny: { specFolder: {} } } },
      },
    });
    const spec = new WdioSpec('specFolder', Uri.file('/specGroup'));
    spec.addResource('en', 'chrome_tiny');
    expect(spec.iconPath).toEqual('folder_diff_icon.svg');
  });
});

import * as fs from 'fs';

import mockfs from 'mock-fs';
import { Uri, workspace } from 'vscode';
import { mocked } from 'ts-jest/utils';
import type { WorkspaceFolder } from 'vscode';

import ExtensionState from '../../../src/common/ExtensionState';
import {
  buildUriMap,
  deleteResource,
  deleteWdioResources,
  getDirectories,
  getFiles,
  isDirectoryEmpty,
  replaceReferenceWithLatest,
} from '../../../src/common/utils';
import type WdioSnapshot from '../../../src/tree-view/WdioSnapshot';
import type { ExtensionConfiguration } from '../../../src/types';

const mockWorkspace = mocked(workspace);

describe('utils', () => {
  beforeEach(() => {
    mockfs({
      '/rootDir': {
        fileA: 'content',
        fileB: 'content',
        directoryA: {},
        directoryB: {},
      },
    });
  });

  afterAll(() => mockfs.restore());

  describe('getDirectories', () => {
    it('should return a list of only the directories in the given directory', () => {
      expect(getDirectories('/rootDir')).toEqual(['directoryA', 'directoryB']);
    });
  });

  describe('getFiles', () => {
    it('should return a list of only the files in the given directory', () => {
      expect(getFiles('/rootDir')).toEqual(['fileA', 'fileB']);
    });
  });

  describe('isDirectoryEmpty', () => {
    it('should return true if the given directory is empty', () => {
      expect(isDirectoryEmpty('/rootDir/directoryA')).toEqual(true);
    });

    it('should return false if the given directory is not empty', () => {
      expect(isDirectoryEmpty('/rootDir')).toEqual(false);
    });
  });

  describe('buildUriMap', () => {
    it('should build the map with the argument as is if the argument is a uri', () => {
      const uri = Uri.file('/rootDir/fileA');
      expect(buildUriMap(uri)).toEqual({ uri, exists: true });
    });

    it('should build the map with a uri generated with the argument if it is a path', () => {
      const uri = Uri.file('/rootDir/fileA');
      uri.fsPath; // an internal _fsPath field is set once the getter's called.
      expect(buildUriMap('/rootDir/fileA')).toEqual({ uri, exists: true });
    });
  });

  describe('file system utils', () => {
    beforeAll(() => {
      const wsFolder = { uri: { fsPath: '/root/workspace' } as Uri } as WorkspaceFolder;
      const config = ({ testFolderPath: { '/root/workspace': 'test/folder' } } as unknown) as ExtensionConfiguration;
      mockWorkspace.getWorkspaceFolder.mockReturnValue(wsFolder);
      jest.spyOn(ExtensionState, 'configuration', 'get').mockReturnValue(config);
    });

    describe('deleteResource', () => {
      it('should delete the resource at the given path', () => {
        mockfs({ 'some-dir': { fileA: 'content', fileB: 'content' } });
        deleteResource('some-dir/fileA');
        expect(fs.existsSync('some-dir/fileA')).toEqual(false);
      });

      it('should recursively delete the parent directory if it is empty after deleting the resource', () => {
        mockfs({ 'directoryA/directoryB/directoryC/file': 'content', 'directoryA/file': 'content' });
        deleteResource('directoryA/directoryB/directoryC/file');
        expect(fs.existsSync('directoryA/directoryB')).toEqual(false);
      });

      it('should stop recursively deleting directories once it reaches the test folder for the workspace', () => {
        mockfs({ '/root/workspace/test/folder/directoryA/directoryB/file': 'content' });
        deleteResource('/root/workspace/test/folder/directoryA/directoryB/file');
        expect(fs.existsSync('/root/workspace/test/folder/directoryA')).toEqual(false);
        expect(fs.existsSync('/root/workspace/test/folder')).toEqual(true);
      });
    });

    /**
     * Sets up a WdioSnapshot (like object) and a corresponding mock file system
     *
     * @returns - A partial snapshot-like object with resources
     */
    const setupSnapshotFiles = () => {
      mockfs({
        '/root': { reference: { file: 'reference' }, latest: { file: 'latest' }, diff: { file: 'diff' }, _: {} },
      });
      return {
        resources: [
          {
            locale: 'locale',
            formFactor: 'formFactor',
            reference: { uri: Uri.file('/root/reference/file'), exists: true },
            latest: { uri: Uri.file('/root/latest/file'), exists: true },
            diff: { uri: Uri.file('/root/diff/file'), exists: true },
          },
        ],
      } as WdioSnapshot;
    };

    describe('deleteWdioResources', () => {
      it('should delete all resources for a wdio item when the diff only flag is false', () => {
        const snapshot = setupSnapshotFiles();
        deleteWdioResources(snapshot);
        expect(fs.existsSync('/root/reference/file')).toEqual(false);
        expect(fs.existsSync('/root/latest/file')).toEqual(false);
        expect(fs.existsSync('/root/diff/file')).toEqual(false);
      });

      it('should only delete the diff resource for a wdio item if the diff only flag is true', () => {
        const snapshot = setupSnapshotFiles();
        deleteWdioResources(snapshot, true);
        expect(fs.existsSync('/root/reference/file')).toEqual(true);
        expect(fs.existsSync('/root/latest/file')).toEqual(true);
        expect(fs.existsSync('/root/diff/file')).toEqual(false);
      });

      it('should not attempt to delete wdio item resources if their existence indicator is false', () => {
        const snapshot = setupSnapshotFiles();
        snapshot.resources[0].reference.exists = false;
        snapshot.resources[0].latest.exists = false;
        snapshot.resources[0].diff.exists = false;
        deleteWdioResources(snapshot);
        expect(fs.existsSync('/root/reference/file')).toEqual(true);
        expect(fs.existsSync('/root/latest/file')).toEqual(true);
        expect(fs.existsSync('/root/diff/file')).toEqual(true);
      });
    });

    describe('replaceReferenceWithLatest', () => {
      it('should replace the reference resource with the latest resource', () => {
        const snapshot = setupSnapshotFiles();
        replaceReferenceWithLatest(snapshot);
        expect(fs.readFileSync('/root/reference/file').toString()).toEqual('latest');
      });

      it('should delete the diff resource after replacing the reference with latest', () => {
        const snapshot = setupSnapshotFiles();
        replaceReferenceWithLatest(snapshot);
        expect(fs.existsSync('/root/diff/file')).toEqual(false);
      });

      it('should not try to copy over the latest resource if there is no reference directory', () => {
        const snapshot = setupSnapshotFiles();
        mockfs({
          '/root': { latest: { file: 'latest' }, diff: { file: 'diff' }, _: {} },
        });
        expect(() => replaceReferenceWithLatest(snapshot)).not.toThrow();
      });

      it('should not attempt to delete the diff resource after replacing reference with latest if the diff existence indicator is false', () => {
        const snapshot = setupSnapshotFiles();
        snapshot.resources[0].diff.exists = false;
        replaceReferenceWithLatest(snapshot);
        expect(fs.existsSync('/root/diff/file')).toEqual(true);
      });
    });
  });
});

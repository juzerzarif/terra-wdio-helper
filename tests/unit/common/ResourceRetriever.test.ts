import { Uri } from 'vscode';
import type { ExtensionContext } from 'vscode';

import ExtensionState from '../../../src/common/ExtensionState';
import ResourceRetriever from '../../../src/common/ResourceRetriever';

describe('ResourceRetriever', () => {
  const mockExtensionContext = (context: unknown) => {
    jest.spyOn(ExtensionState, 'context', 'get').mockReturnValue(context as ExtensionContext);
  };

  describe('themed icon', () => {
    it('should return a themed icon object when the extension context is set', () => {
      mockExtensionContext({ extensionPath: '/mock/extension/path' });
      expect(ResourceRetriever.getThemedIcon('theme-icon.png')).toEqual({
        light: Uri.file('/mock/extension/path/resources/images/light/theme-icon.png'),
        dark: Uri.file('/mock/extension/path/resources/images/dark/theme-icon.png'),
      });
    });

    it('should throw an error when the extension context is not set', () => {
      mockExtensionContext(undefined);
      expect(() => ResourceRetriever.getThemedIcon('theme-icon.png')).toThrow(
        'getThemedIcon was called before extension context was set'
      );
    });
  });

  describe('icon', () => {
    it('should return an icon uri when the extension context is set', () => {
      mockExtensionContext({ extensionPath: '/mock/extension/path' });
      expect(ResourceRetriever.getIcon('icon.png')).toEqual(Uri.file('/mock/extension/path/resources/images/icon.png'));
    });

    it('should throw an error when the extension context is not set', () => {
      mockExtensionContext(undefined);
      expect(() => ResourceRetriever.getIcon('icon.png')).toThrow(
        'getIcon was called before extension context was set'
      );
    });
  });

  describe('dist file', () => {
    it('should return a dist file uri when the extension context is set', () => {
      mockExtensionContext({ extensionPath: '/mock/extension/path' });
      expect(ResourceRetriever.getDistFile('file.txt')).toEqual(
        Uri.file('/mock/extension/path/resources/dist/file.txt')
      );
    });

    it('should throw an error when the extension context is not set', () => {
      mockExtensionContext(undefined);
      expect(() => ResourceRetriever.getDistFile('file.txt')).toThrow(
        'getDistFile was called before extension context was set'
      );
    });
  });

  describe('font file', () => {
    it('should return a font file uri when the extension context is set', () => {
      mockExtensionContext({ extensionPath: '/mock/extension/path' });
      expect(ResourceRetriever.getFont('font.woff')).toEqual(
        Uri.file('/mock/extension/path/resources/fonts/font.woff')
      );
    });

    it('should throw an error when the extension context is not set', () => {
      mockExtensionContext(undefined);
      expect(() => ResourceRetriever.getFont('font.woff')).toThrow(
        'getFont was called before extension context was set'
      );
    });
  });
});

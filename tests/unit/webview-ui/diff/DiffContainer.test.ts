import * as svelte from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';

import DiffContainer from '../../../../src/webview-ui/diff/DiffContainer.svelte';

jest.mock('svelte', () => ({ ...(jest.requireActual('svelte') as typeof svelte), getContext: jest.fn() }));

const mockGetContext = mocked(svelte.getContext);
const vscode = mocked(window.acquireVsCodeApi());

describe('DiffContainer', () => {
  beforeEach(() => {
    mockGetContext.mockReturnValue({ defaultDiffOption: 'default' });
  });

  describe('active diff state', () => {
    it('should render the default diff option as visible by default', () => {
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      expect(screen.getByTestId('default-diff')).not.toBeHidden();
      expect(screen.getByTestId('two-up-diff')).toBeHidden();
      expect(screen.getByTestId('slide-diff')).toBeHidden();
      expect(screen.getByTestId('onion-diff')).toBeHidden();
    });

    it('should render the saved active diff state as visible when one exists', () => {
      vscode.getState.mockReturnValue({ 'some-id-active-diff': 'onion' });
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      expect(screen.getByTestId('default-diff')).toBeHidden();
      expect(screen.getByTestId('two-up-diff')).toBeHidden();
      expect(screen.getByTestId('slide-diff')).toBeHidden();
      expect(screen.getByTestId('onion-diff')).not.toBeHidden();
    });

    it('should update the active diff saved state when the active diff is changed', async () => {
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      await fireEvent.click(screen.getByRole('button', { name: 'two-up' }));
      expect(vscode.setState).toHaveBeenLastCalledWith({ 'some-id-active-diff': 'two-up' });
    });
  });

  describe('active diff rendering', () => {
    it('should render only the default diff container as visible when the active diff is default', () => {
      vscode.getState.mockReturnValue({ 'some-id-active-diff': 'default' });
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      expect(screen.getByTestId('default-diff')).not.toBeHidden();
      expect(screen.getByTestId('two-up-diff')).toBeHidden();
      expect(screen.getByTestId('slide-diff')).toBeHidden();
      expect(screen.getByTestId('onion-diff')).toBeHidden();
    });

    it('should render only the two-up diff container as visible when the active diff is two-up', () => {
      vscode.getState.mockReturnValue({ 'some-id-active-diff': 'two-up' });
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      expect(screen.getByTestId('default-diff')).toBeHidden();
      expect(screen.getByTestId('two-up-diff')).not.toBeHidden();
      expect(screen.getByTestId('slide-diff')).toBeHidden();
      expect(screen.getByTestId('onion-diff')).toBeHidden();
    });

    it('should render only the slide diff container as visible when the active diff is slide', () => {
      vscode.getState.mockReturnValue({ 'some-id-active-diff': 'slide' });
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      expect(screen.getByTestId('default-diff')).toBeHidden();
      expect(screen.getByTestId('two-up-diff')).toBeHidden();
      expect(screen.getByTestId('slide-diff')).not.toBeHidden();
      expect(screen.getByTestId('onion-diff')).toBeHidden();
    });

    it('should render only the onion diff container as visible when the active diff is onion', () => {
      vscode.getState.mockReturnValue({ 'some-id-active-diff': 'onion' });
      render(DiffContainer, { id: 'some-id', reference: 'reference-src', latest: 'latest-src', diff: 'diff-src' });
      expect(screen.getByTestId('default-diff')).toBeHidden();
      expect(screen.getByTestId('two-up-diff')).toBeHidden();
      expect(screen.getByTestId('slide-diff')).toBeHidden();
      expect(screen.getByTestId('onion-diff')).not.toBeHidden();
    });
  });
});

import { fireEvent, render, screen } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';

import Onion from '../../../../src/webview-ui/diff/Onion.svelte';

const vscode = mocked(window.acquireVsCodeApi());

describe('Onion', () => {
  it("should set the opacity of the latest snapshot based on the input slider's initial value", () => {
    render(Onion, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    expect(screen.getByRole('img', { name: 'Latest snapshot' })).toHaveStyle({ opacity: 0.5 });
  });

  it('should set the initial opacity of the latest snapshot to a saved state value if one exists', () => {
    vscode.getState.mockReturnValue({ 'some-id-onion-range': 30 });
    render(Onion, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    expect(screen.getByRole('img', { name: 'Latest snapshot' })).toHaveStyle({ opacity: 0.3 });
  });

  it('should update the opacity of the latest snapshot when the slider value is changed', async () => {
    render(Onion, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    await fireEvent.input(screen.getByRole('slider'), { target: { value: 30 } });
    expect(screen.getByRole('img', { name: 'Latest snapshot' })).toHaveStyle({ opacity: 0.3 });
  });

  it('should update the saved vscode state when the slider value is changed', async () => {
    render(Onion, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    await fireEvent.input(screen.getByRole('slider'), { target: { value: 30 } });
    expect(vscode.setState).toHaveBeenCalledTimes(2);
    expect(vscode.setState).toHaveBeenLastCalledWith({ 'some-id-onion-range': 30 });
  });
});

import { fireEvent, render, screen } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';

import Slide from '../../../../src/webview-ui/diff/Slide.svelte';

const vscode = mocked(window.acquireVsCodeApi());

describe('Slide', () => {
  it("should clip the latest snapshot's width based on the comparison slider's initial value", () => {
    render(Slide, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    expect(screen.getByRole('img', { name: 'Latest snapshot' })).toHaveStyle({ clipPath: 'inset(0 50% 0 0)' });
  });

  it("should set the latest snapshot's initial clipped width to a saved state if one exists", () => {
    vscode.getState.mockReturnValue({ 'some-id-slider-range': 30 });
    render(Slide, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    expect(screen.getByRole('img', { name: 'Latest snapshot' })).toHaveStyle({ clipPath: 'inset(0 70% 0 0)' });
  });

  it("should save the saved vscode state when the comparison slider's value changes", async () => {
    render(Slide, { id: 'some-id', reference: 'reference-src', latest: 'latest-src' });
    await fireEvent.input(screen.getByRole('slider', { name: 'Snapshot comparison slider' }), {
      target: { value: 30 },
    });
    expect(vscode.setState).toHaveBeenCalledTimes(2);
    expect(vscode.setState).toHaveBeenLastCalledWith({ 'some-id-slider-range': 30 });
  });
});

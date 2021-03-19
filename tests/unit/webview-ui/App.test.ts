import { mocked } from 'ts-jest/utils';
import { render, screen, waitFor, within } from '@testing-library/svelte';

import App from '../../../src/webview-ui/App.svelte';

const vscode = mocked(window.acquireVsCodeApi());

describe('App', () => {
  const extensionConfig = {
    defaultSnapshotTab: 'diff',
    fallbackSnapshotTab: 'reference',
    defaultDiffOption: 'default',
  };

  const buildResource = (locale: string, formFactor: string) => ({
    locale,
    formFactor,
    reference: { src: 'reference-src', exists: true },
    latest: { src: 'latest-src', exists: true },
    diff: { src: 'diff-src', exists: true },
  });

  beforeEach(() => {
    HTMLElement.prototype.scrollTo = jest.fn();
    document.body.removeAttribute('data-vscode-theme-kind');
  });

  it('should render a snapshot container for each resource', async () => {
    render(App);
    window.postMessage(
      {
        snapshotData: {
          name: 'Test Snapshot',
          resources: [buildResource('en', 'chrome_tiny'), buildResource('en', 'chrome_medium')],
        },
        extensionConfig,
      },
      '*'
    );
    expect(await screen.findByRole('heading', { level: 2, name: 'en | chrome_tiny' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'en | chrome_medium' })).toBeInTheDocument();
  });

  it('should render a diff badge next to the heading when a diff exists', async () => {
    render(App);
    window.postMessage(
      {
        snapshotData: { name: 'Test Snapshot', resources: [buildResource('en', 'chrome_tiny')] },
        extensionConfig,
      },
      '*'
    );
    const heading = await screen.findByRole('heading', { name: 'Test Snapshot' });
    expect(within(heading.parentElement as HTMLElement).getByTestId('diff-badge')).toBeInTheDocument();
  });

  it('should send a webview ready message when the app is mounted', () => {
    render(App);
    expect(vscode.postMessage).toHaveBeenCalledTimes(1);
    expect(vscode.postMessage).toHaveBeenCalledWith({ ready: true });
  });

  it('should set the scroll position to the saved vscode state when it exists', async () => {
    vscode.getState.mockReturnValue({ 'scroll-position': { top: 25, left: 0 } });
    render(App);
    window.postMessage(
      {
        snapshotData: { name: 'Test Snapshot', resources: [buildResource('en', 'chrome_tiny')] },
        extensionConfig,
      },
      '*'
    );
    const content = await screen.findByTestId('content');
    await waitFor(() => expect(content.scrollTo).toHaveBeenLastCalledWith({ top: 25, left: 0 }));
  });

  it('should add the dark class to the root html element when the vscode theme is dark', async () => {
    document.body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
    render(App);
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
  });

  it('should add the dark class to the root html element when the vscode theme changes to dark', async () => {
    render(App);
    expect(document.documentElement).not.toHaveClass('dark');
    document.body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
  });

  it('should remove the dark class from the root html element when the vscode theme changes to light', async () => {
    document.body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
    render(App);
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    document.body.setAttribute('data-vscode-theme-kind', 'vscode-light');
    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'));
  });
});

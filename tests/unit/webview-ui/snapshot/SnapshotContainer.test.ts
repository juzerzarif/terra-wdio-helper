import * as svelte from 'svelte';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { mocked } from 'ts-jest/utils';

import SnapshotContainer from '../../../../src/webview-ui/snapshot/SnapshotContainer.svelte';

jest.mock('svelte', () => ({ ...(jest.requireActual('svelte') as typeof svelte), getContext: jest.fn() }));

const mockGetContext = mocked(svelte.getContext);
const vscode = mocked(window.acquireVsCodeApi());

describe('SnapshotContainer', () => {
  const extensionConfig = {
    defaultSnapshotTab: 'diff',
    fallbackSnapshotTab: 'reference',
    defaultDiffOption: 'default',
  };

  const buildResource = (options?: { reference?: boolean; latest?: boolean; diff?: boolean }) => ({
    locale: 'en',
    formFactor: 'chrome_tiny',
    reference: { src: 'reference-src', exists: options?.reference ?? true },
    latest: { src: 'latest-src', exists: options?.latest ?? true },
    diff: { src: 'diff-src', exists: options?.diff ?? true },
  });

  beforeEach(() => {
    mockGetContext.mockReturnValue(extensionConfig);
    vscode.postMessage.mockClear();
    vscode.setState.mockClear();
  });

  it('should render a tab for each resource', () => {
    const resource = buildResource();
    render(SnapshotContainer, { resource });
    const containerId = `${resource.locale}-${resource.formFactor}`;
    [
      within(screen.getByTestId(`${containerId}-reference`)).getByRole('img', { name: 'Reference snapshot' }),
      within(screen.getByTestId(`${containerId}-latest`)).getByRole('img', { name: 'Latest snapshot' }),
      within(screen.getByTestId(`${containerId}-diff`)).getByRole('img', { name: 'Default diff' }),
    ].forEach((resourceSnapshot) => {
      expect(resourceSnapshot).toBeInTheDocument();
    });
  });

  it('should render no resource screens for resources that do not exist', () => {
    const resource = buildResource({ reference: false, latest: false, diff: false });
    render(SnapshotContainer, { resource });
    const containerId = `${resource.locale}-${resource.formFactor}`;
    [
      within(screen.getByTestId(`${containerId}-reference`)).getByText('Resource Does Not Exist'),
      within(screen.getByTestId(`${containerId}-latest`)).getByText('Resource Does Not Exist'),
      within(screen.getByTestId(`${containerId}-diff`)).getByText('Resource Does Not Exist'),
    ].forEach((resourceSnapshot) => {
      expect(resourceSnapshot).toBeInTheDocument();
    });
  });

  it('should render a diff badge next to the resource heading if a diff exists', () => {
    render(SnapshotContainer, { resource: buildResource({ diff: true }) });
    expect(screen.getByTestId('diff-badge')).toBeInTheDocument();
  });

  it('should render the default snapshot tab as initially active', () => {
    const resource = buildResource();
    mockGetContext.mockReturnValue({ ...extensionConfig, defaultSnapshotTab: 'latest' });
    render(SnapshotContainer, { resource });
    const containerId = `${resource.locale}-${resource.formFactor}`;
    expect(screen.getByRole('tab', { name: 'latest', selected: true })).toBeInTheDocument();
    expect(screen.getByTestId(`${containerId}-latest`)).not.toBeHidden();
    expect(screen.getByTestId(`${containerId}-reference`)).toBeHidden();
    expect(screen.getByTestId(`${containerId}-diff`)).toBeHidden();
  });

  it("should render the fallback snapshot tab as initially active when the default tab's resource does not exist", () => {
    const resource = buildResource({ reference: false, latest: true });
    mockGetContext.mockReturnValue({
      ...extensionConfig,
      defaultSnapshotTab: 'reference',
      fallbackSnapshotTab: 'latest',
    });
    render(SnapshotContainer, { resource });
    const containerId = `${resource.locale}-${resource.formFactor}`;
    expect(screen.getByRole('tab', { name: 'latest', selected: true })).toBeInTheDocument();
    expect(screen.getByTestId(`${containerId}-latest`)).not.toBeHidden();
    expect(screen.getByTestId(`${containerId}-reference`)).toBeHidden();
    expect(screen.getByTestId(`${containerId}-diff`)).toBeHidden();
  });

  it('should render the active tab saved in vscode state as initially active when it exists', () => {
    const resource = buildResource();
    const containerId = `${resource.locale}-${resource.formFactor}`;
    vscode.getState.mockReturnValue({ [`${containerId}-active-tab`]: 'diff' });
    render(SnapshotContainer, { resource });
    expect(screen.getByRole('tab', { name: 'diff', selected: true })).toBeInTheDocument();
    expect(screen.getByTestId(`${containerId}-diff`)).not.toBeHidden();
    expect(screen.getByTestId(`${containerId}-reference`)).toBeHidden();
    expect(screen.getByTestId(`${containerId}-latest`)).toBeHidden();
  });

  it('should update the active tab saved in vscode state when the active tab changes', async () => {
    const resource = buildResource();
    const containerId = `${resource.locale}-${resource.formFactor}`;
    mockGetContext.mockReturnValue({ ...extensionConfig, defaultSnapshotTab: 'reference' });
    render(SnapshotContainer, { resource });
    await fireEvent.click(screen.getByRole('tab', { name: 'latest' }));
    expect(vscode.setState).toHaveBeenLastCalledWith({ [`${containerId}-active-tab`]: 'latest' });
  });

  it('should send a message to replace the reference snapshot with latest when the replace button is clicked', () => {
    const resource = buildResource({ diff: true });
    render(SnapshotContainer, { resource });
    fireEvent.click(screen.getByRole('button', { name: 'Replace reference with latest' }));
    expect(vscode.postMessage).toHaveBeenCalledTimes(1);
    expect(vscode.postMessage).toHaveBeenCalledWith({
      intent: 'replaceReferenceWithLatest',
      locale: resource.locale,
      formFactor: resource.formFactor,
    });
  });

  it('should render the replace button as disabled when there is no diff snapshot present', () => {
    render(SnapshotContainer, { resource: buildResource({ diff: false }) });
    expect(screen.getByRole('button', { name: 'Replace reference with latest' })).toBeDisabled();
  });
});

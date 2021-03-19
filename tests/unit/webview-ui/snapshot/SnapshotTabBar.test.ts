import { fireEvent, render, screen } from '@testing-library/svelte';

import SnapshotTabBar from '../../../../src/webview-ui/snapshot/SnapshotTabBar.svelte';

describe('SnapshotTabBar', () => {
  const tabIds = { reference: 'referenceId', latest: 'latestId', diff: 'diffId' };

  it('should render a tab for reference, latest, and diff each', () => {
    render(SnapshotTabBar, { tabIds });
    expect(screen.getByRole('tab', { name: 'reference' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'latest' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'diff' })).toBeInTheDocument();
  });

  it('should display the active tab as selected', () => {
    render(SnapshotTabBar, { tabIds, activeTab: 'latest' });
    expect(screen.getByRole('tab', { name: 'latest', selected: true })).toBeInTheDocument();
    expect(screen.getByTestId('selected-highlight')).toHaveStyle({ left: '7rem' });
  });

  it('should update the selected tab to a tab when it is clicked', async () => {
    render(SnapshotTabBar, { tabIds });
    await fireEvent.click(screen.getByRole('tab', { name: 'diff' }));
    expect(screen.getByRole('tab', { name: 'diff', selected: true })).toBeInTheDocument();
    expect(screen.getByTestId('selected-highlight')).toHaveStyle({ left: '14rem' });
  });
});

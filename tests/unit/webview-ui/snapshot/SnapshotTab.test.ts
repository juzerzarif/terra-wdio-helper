import { render, screen } from '@testing-library/svelte';

import SnapshotTabTest from './SnapshotTab.test.svelte';

describe('SnapshotTab', () => {
  it('should render the content as visible when it is active', () => {
    render(SnapshotTabTest, { id: 'some-id', active: true, content: 'Test content' });
    expect(screen.getByText('Test content')).not.toBeHidden();
  });

  it('should render the content as hidden when it is not active', () => {
    render(SnapshotTabTest, { id: 'some-id', active: false, content: 'Test content' });
    expect(screen.getByText('Test content')).toBeHidden();
  });

  it('should render a no resource screen when the exists flag is false', () => {
    render(SnapshotTabTest, { id: 'some-id', exists: false, content: 'Test content' });
    expect(screen.getByText('Resource Does Not Exist')).toBeInTheDocument();
  });
});

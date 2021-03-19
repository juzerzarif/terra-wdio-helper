import { render, screen } from '@testing-library/svelte';

import Default from '../../../../src/webview-ui/diff/Default.svelte';

describe('Default', () => {
  it('should render an image with the provided diff prop as src', () => {
    render(Default, { diff: 'some-source' });
    expect(screen.getByRole('img', { name: 'Default diff' })).toHaveAttribute('src', 'some-source');
  });
});

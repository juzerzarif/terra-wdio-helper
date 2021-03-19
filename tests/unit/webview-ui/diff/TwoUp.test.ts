import { render, screen } from '@testing-library/svelte';

import TwoUp from '../../../../src/webview-ui/diff/TwoUp.svelte';

describe('TwoUp', () => {
  it('should render a reference image with the reference src and a latest image with the latest src', () => {
    render(TwoUp, { reference: 'reference-src', latest: 'latest-src' });
    expect(screen.getByRole('img', { name: 'Reference snapshot' })).toHaveAttribute('src', 'reference-src');
    expect(screen.getByRole('img', { name: 'Latest snapshot' })).toHaveAttribute('src', 'latest-src');
  });
});

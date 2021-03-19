import { render, screen } from '@testing-library/svelte';

import Image from '../../../../src/webview-ui/common/Image.svelte';

describe('Image', () => {
  it('should render an img with the provided src and alt text', () => {
    render(Image, { src: 'some-source', alt: 'test alt text' });
    expect(screen.getByRole('img', { name: 'test alt text' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'test alt text' })).toHaveAttribute('src', 'some-source');
  });
});

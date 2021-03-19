import { render, screen } from '@testing-library/svelte';

import NoResource from '../../../../src/webview-ui/common/NoResource.svelte';

describe('NoResource', () => {
  it('should render a no resource screen with the correct text', () => {
    render(NoResource);
    expect(screen.getByText('Resource Does Not Exist')).toBeInTheDocument();
  });
});

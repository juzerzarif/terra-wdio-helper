import { prettyDOM } from '@testing-library/svelte';
import '@testing-library/jest-dom';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeHidden: () => R;
    }
  }
}

expect.extend({
  toBeHidden(element: HTMLElement) {
    const closestHiddenAncestor = element.closest('.hidden');
    const matcherHint = this.utils.matcherHint('toBeHidden', undefined, undefined, { isNot: this.isNot });
    return {
      pass: !!closestHiddenAncestor,
      message: () =>
        closestHiddenAncestor
          ? `${matcherHint}\n\nExpected: not to have an ancestor with class hidden\nReceived:\n${this.utils.printReceived(
              prettyDOM(closestHiddenAncestor, undefined, { maxDepth: 2 })
            )}`
          : `${matcherHint}\n\nExpected: to have an ancestor with class hidden\nReceived: no hidden ancestors\n${this.utils.printReceived(
              prettyDOM(document.body)
            )}`,
    };
  },
});

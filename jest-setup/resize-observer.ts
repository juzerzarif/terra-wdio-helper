import ResizeObserverPolyfill from 'resize-observer-polyfill';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
  let ResizeObserver: typeof ResizeObserverPolyfill;
}

globalThis.ResizeObserver = ResizeObserverPolyfill;

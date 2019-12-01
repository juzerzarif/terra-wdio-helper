import { Uri } from "vscode";

/**
 * A resource object related to a test spec
 */
export interface SpecResource {
  locale: string;
  viewport: string;
}

/**
 * A resource object related to a snapshot
 */
export interface SnapshotResource {
  locale: string;
  viewport: string;
  referenceUri: Uri;
  latestUri: Uri;
  diffUri: Uri;
}

/**
 * Param shape for a snapshot passed to a webview factory
 */
export interface SnapshotWebviewOptions {
  resources: SnapshotResource[];
  title: string;
}

/**
 * Param options for HTML content's starting fragment
 */
export interface StartFragmentOptions {
  title: string;
  indexCssUri: Uri;
  beerSliderCssUri: Uri;
  nonce: string;
}

/**
 * Param options for HTML content's ending fragment
 */
export interface EndFragmentOptions {
  indexJsUri: Uri;
  beerSliderJsUri: Uri;
  persistenceJsUri: Uri;
  nonce: string;
}

/**
 * Param options for a reference snaphsot HTML fragment
 */
export interface ReferenceFragmentOptions {
  referenceUri: Uri;
  resourceId: string;
}

/**
 * Param options for a latest snapshot HTML fragment
 */
export interface LatestFragmentOptions {
  latestUri: Uri;
  resourceId: string;
}

/**
 * Param options for snapshot diff HTML fragment
 */
export interface DiffFragmentOptions {
  referenceUri: Uri;
  latestUri: Uri;
  diffUri: Uri;
  resourceId: string;
}

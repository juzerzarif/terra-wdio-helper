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

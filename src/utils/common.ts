import * as fs from "fs";

/**
 * Checks if a given path exists in the file system or not
 * @param path path - An fs path
 * @returns true if path exists, false otherwise
 */
function pathExists(path: string): boolean {
  try {
    fs.accessSync(path);
  } catch {
    return false;
  }
  return true;
}

export { pathExists };

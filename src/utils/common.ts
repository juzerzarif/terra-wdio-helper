import * as fs from 'fs';

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

/**
 * Check if the directory at the given path is empty
 * @param path - An fs path
 * @returns true if directory is empty, false otherwise
 * @throws If path is inaccessible on disk or path is not a directory
 */
function isDirEmpty(path: string): boolean {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} does not exist on disk`);
  }
  if (!fs.lstatSync(path).isDirectory()) {
    throw new Error(`${path} is not a path to a directory`);
  }
  const files: string[] = fs.readdirSync(path);
  return !files.length;
}

function isDirectory(path: string): boolean {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} is not a path to a directory`);
  }
  return fs.lstatSync(path).isDirectory();
}

export { pathExists, isDirEmpty, isDirectory };

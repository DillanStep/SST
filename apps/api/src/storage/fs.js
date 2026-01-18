import { createStorage } from "./storageFactory.js";

// A tiny wrapper that mimics a subset of `fs/promises` but can be backed by
// local filesystem or remote FTP.
const storage = createStorage();

export async function readFile(filePath, encoding) {
  return storage.readFile(filePath, encoding);
}

export async function writeFile(filePath, data, encoding) {
  return storage.writeFile(filePath, data, encoding);
}

export async function readdir(dirPath) {
  return storage.readdir(dirPath);
}

export async function stat(filePath) {
  return storage.stat(filePath);
}

export async function mkdir(dirPath, options) {
  return storage.mkdir(dirPath, options);
}

export async function unlink(filePath) {
  return storage.unlink(filePath);
}

export function getStorageBackend() {
  return storage.backend;
}

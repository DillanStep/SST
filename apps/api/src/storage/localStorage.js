import * as fsp from "fs/promises";

export function createLocalStorage() {
  return {
    backend: "local",

    async readFile(filePath, encoding) {
      // fsp.readFile returns Buffer if encoding undefined
      return fsp.readFile(filePath, encoding);
    },

    async writeFile(filePath, data, encoding) {
      return fsp.writeFile(filePath, data, encoding);
    },

    async readdir(dirPath) {
      return fsp.readdir(dirPath);
    },

    async stat(filePath) {
      return fsp.stat(filePath);
    },

    async mkdir(dirPath, options) {
      return fsp.mkdir(dirPath, options);
    },
    async unlink(filePath) {
      return fsp.unlink(filePath);
    },
  };
}

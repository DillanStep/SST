import { createLocalStorage } from "./localStorage.js";
import { createFtpStorage } from "./ftpStorage.js";
import { createSftpStorage } from "./sftpStorage.js";
import { loadProviderConfig, selectProvider } from "../providerConfig.js";

export function createStorage() {
  const providerConfig = loadProviderConfig();
  const provider = selectProvider(providerConfig);

  const backend = (
    process.env.STORAGE_BACKEND ||
    provider?.backend ||
    "local"
  ).toLowerCase();

  if (backend === "ftp" || backend === "ftps") {
    const ftpConfig = provider?.ftp;
    return createFtpStorage({ backend, config: ftpConfig });
  }

  if (backend === "sftp") {
    const sftpConfig = provider?.sftp;
    return createSftpStorage({ backend, config: sftpConfig });
  }

  return createLocalStorage();
}

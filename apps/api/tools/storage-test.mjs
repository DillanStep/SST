import "../src/appConfig.js";

import { paths } from "../src/config.js";
import { readFile, stat, getStorageBackend } from "../src/storage/fs.js";

async function checkStat(label, targetPath) {
  try {
    const s = await stat(targetPath);
    return { label, path: targetPath, ok: true, stat: s, error: null };
  } catch (e) {
    return { label, path: targetPath, ok: false, stat: null, error: String(e?.message || e) };
  }
}

async function checkOnlinePlayers() {
  const base = await checkStat("onlinePlayers", paths.onlinePlayers);
  if (!base.ok) return base;

  try {
    const raw = await readFile(paths.onlinePlayers, "utf8");
    const parsed = JSON.parse(raw);
    const onlineCount = typeof parsed?.onlineCount === "number" ? parsed.onlineCount : null;
    const playersLen = Array.isArray(parsed?.players) ? parsed.players.length : null;
    return { ...base, parsed: { onlineCount, playersLen } };
  } catch (e) {
    return { ...base, ok: false, error: `Read/parse failed: ${String(e?.message || e)}` };
  }
}

async function main() {
  const backend = getStorageBackend();

  const results = {
    storage: {
      backend,
      sftp: backend === "sftp" ? {
        host: process.env.SFTP_HOST || null,
        port: process.env.SFTP_PORT ? Number(process.env.SFTP_PORT) : null,
        root: process.env.SFTP_ROOT || null,
        user: process.env.SFTP_USER || null,
      } : null,
      ftp: backend === "ftp" || backend === "ftps" ? {
        host: process.env.FTP_HOST || null,
        port: process.env.FTP_PORT ? Number(process.env.FTP_PORT) : null,
        root: process.env.FTP_ROOT || null,
        user: process.env.FTP_USER || null,
        secure: typeof process.env.FTP_SECURE === "string" ? process.env.FTP_SECURE : null,
      } : null,
    },
    paths,
    checks: {
      apiDir: await checkStat("apiDir", paths.api),
      onlinePlayers: await checkOnlinePlayers(),
    }
  };

  const ok = results.checks.apiDir.ok && results.checks.onlinePlayers.ok;
  console.log(JSON.stringify(results, null, 2));
  process.exit(ok ? 0 : 2);
}

main().catch((e) => {
  console.error("storage-test failed:", e);
  process.exit(1);
});

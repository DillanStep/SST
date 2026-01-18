// Utilities for building storage paths.
// IMPORTANT: These paths may target remote (SFTP/FTP) file systems that expect POSIX-style separators.

function normalizePart(part) {
  if (part === undefined || part === null) return "";
  return String(part).trim().replace(/\\/g, "/");
}

function trimSlashes(value) {
  return value.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Join path parts using POSIX separators.
 *
 * Works for:
 * - Remote Linux paths (/home/container/...)
 * - Windows paths (C:\\... becomes C:/...)
 * - Relative paths
 */
export function joinStoragePath(...parts) {
  const normalized = parts
    .map(normalizePart)
    .filter((p) => p.length > 0);

  if (normalized.length === 0) return "";

  // Preserve leading slash from the first part (Linux absolute paths)
  const first = normalized[0];
  const hasLeadingSlash = first.startsWith("/");

  const cleaned = normalized.map((p, idx) => {
    if (idx === 0) return trimSlashes(p);
    return trimSlashes(p);
  });

  let joined = cleaned.join("/").replace(/\/+/g, "/");

  if (hasLeadingSlash) {
    joined = "/" + joined;
  }

  // Special case: root
  if (joined === "") return hasLeadingSlash ? "/" : "";

  return joined;
}

export function normalizeStoragePath(pathValue) {
  const p = normalizePart(pathValue);
  if (!p) return "";
  // Remove trailing slash except for root '/'
  const trimmed = p.replace(/\/+$/, "");
  return trimmed === "" && p.startsWith("/") ? "/" : trimmed;
}

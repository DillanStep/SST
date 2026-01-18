import path from "path";

export function toPosixPath(inputPath) {
  if (typeof inputPath !== "string") return inputPath;

  // Refuse obvious Windows drive paths in remote mode.
  if (/^[a-zA-Z]:\\/.test(inputPath) || /^[a-zA-Z]:\//.test(inputPath)) {
    throw new Error(
      `Windows drive path '${inputPath}' cannot be used with remote storage. Use server-relative paths like './profiles/SST' or '/profiles/SST'.`
    );
  }

  return inputPath.replace(/\\/g, "/");
}

export function joinPosix(...parts) {
  const normalized = parts
    .filter(Boolean)
    .map((p) => toPosixPath(p))
    .map((p) => (p === "/" ? "/" : p));

  // path.posix.join will drop preceding './' which is fine.
  return path.posix.join(...normalized);
}

export function resolveRemotePath(remoteRoot, targetPath) {
  const root = toPosixPath(remoteRoot || "/");
  const p = toPosixPath(targetPath);

  // If absolute (starts with /), keep it.
  if (p.startsWith("/")) return p;

  // Convert './foo/bar' to 'foo/bar'
  const trimmed = p.startsWith("./") ? p.slice(2) : p;
  return joinPosix(root, trimmed);
}

export const DEFAULT_LIMITS = Object.freeze({
  directoryEntries: 500,
  searchFiles: 12000,
  searchDepth: 24,
  searchResults: 14,
  cacheRoots: 8,
  cacheTtlMs: 15000,
});

export const IGNORED_DIRECTORY_NAMES = Object.freeze([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".turbo",
  ".cache",
  "library",
  "temp",
]);

const IGNORED_DIRECTORY_SET = new Set(
  IGNORED_DIRECTORY_NAMES.map((name) => name.toLowerCase()),
);
const MAX_RELATIVE_PATH_LENGTH = 4096;
const MAX_SEGMENT_LENGTH = 255;

export class WorkspaceFileError extends Error {
  constructor(code, message, path = "", options) {
    super(message, options);
    this.name = "WorkspaceFileError";
    this.code = code;
    this.path = path;
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted !== true) return;
  const error = new Error("The operation was cancelled");
  error.name = "AbortError";
  throw error;
}

function isSafeSegment(segment) {
  return (
    segment.length > 0 &&
    segment.length <= MAX_SEGMENT_LENGTH &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\") &&
    !segment.includes("\0")
  );
}

export function parseRelativePath(value) {
  if (typeof value !== "string") {
    throw new WorkspaceFileError("invalid-path", "Relative path must be a string");
  }
  if (value.length > MAX_RELATIVE_PATH_LENGTH) {
    throw new WorkspaceFileError("invalid-path", "Relative path is too long", value);
  }
  if (value === "") return [];
  const segments = value.split("/");
  if (segments.some((segment) => !isSafeSegment(segment))) {
    throw new WorkspaceFileError(
      "invalid-path",
      "Relative path contains an invalid segment",
      value,
    );
  }
  return segments;
}

function compareNames(left, right) {
  const lowerLeft = left.toLowerCase();
  const lowerRight = right.toLowerCase();
  if (lowerLeft < lowerRight) return -1;
  if (lowerLeft > lowerRight) return 1;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function relativeChild(parent, name) {
  return parent === "" ? name : `${parent}/${name}`;
}

export async function openWorkspaceRoot(fs, cwd, signal) {
  if (typeof cwd !== "string" || cwd.length === 0) {
    throw new WorkspaceFileError("workspace-unavailable", "Session has no workspace");
  }
  throwIfAborted(signal);
  const root = await fs.resolve(cwd, { signal });
  const info = await fs.stat(root, signal);
  if (info?.type !== "directory") {
    throw new WorkspaceFileError(
      "workspace-unavailable",
      "Session workspace is not an accessible directory",
    );
  }
  return root;
}

export async function resolveWorkspaceDirectory(
  fs,
  root,
  relativePath,
  signal,
) {
  const segments = parseRelativePath(relativePath);
  const ancestorKeys = new Set([root.targetKey]);
  let current = root;
  for (const segment of segments) {
    throwIfAborted(signal);
    const entries = await fs.listDir(current, signal);
    const next = entries.find((entry) => entry.name === segment);
    if (
      next?.type !== "directory" ||
      !fs.contains(root, next.target) ||
      ancestorKeys.has(next.target.targetKey)
    ) {
      throw new WorkspaceFileError(
        "invalid-path",
        "Directory does not exist inside the workspace",
        relativePath,
      );
    }
    ancestorKeys.add(next.target.targetKey);
    current = next.target;
  }
  return { directory: current, segments, ancestorKeys };
}

export async function browseWorkspace(
  fs,
  cwd,
  relativePath,
  signal,
  options = {},
) {
  const limit = options.limit ?? DEFAULT_LIMITS.directoryEntries;
  const root = await openWorkspaceRoot(fs, cwd, signal);
  const { directory, segments, ancestorKeys } = await resolveWorkspaceDirectory(
    fs,
    root,
    relativePath,
    signal,
  );
  const listed = await fs.listDir(directory, signal);
  const safe = [];
  let eligible = 0;
  for (const entry of listed) {
    throwIfAborted(signal);
    if (
      (entry.type !== "file" && entry.type !== "directory") ||
      !isSafeSegment(entry.name) ||
      !fs.contains(root, entry.target) ||
      (entry.type === "directory" &&
        (IGNORED_DIRECTORY_SET.has(entry.name.toLowerCase()) ||
          ancestorKeys.has(entry.target.targetKey)))
    ) {
      continue;
    }
    eligible += 1;
    if (safe.length < limit) {
      safe.push({ name: entry.name, type: entry.type });
    }
  }
  safe.sort((left, right) => {
    if (left.type !== right.type) return left.type === "directory" ? -1 : 1;
    return compareNames(left.name, right.name);
  });
  return {
    path: segments.join("/"),
    entries: safe,
    truncated: eligible > limit,
  };
}

export async function buildWorkspaceIndex(fs, root, signal, options = {}) {
  const maxFiles = options.maxFiles ?? DEFAULT_LIMITS.searchFiles;
  const maxDepth = options.maxDepth ?? DEFAULT_LIMITS.searchDepth;
  const files = [];
  const pending = [{ target: root, prefix: "", depth: 0 }];
  const visited = new Set([root.targetKey]);
  let truncated = false;

  while (pending.length > 0) {
    throwIfAborted(signal);
    const current = pending.pop();
    let entries;
    try {
      entries = await fs.listDir(current.target, signal);
    } catch (error) {
      if (current.prefix === "") throw error;
      continue;
    }

    const directories = [];
    for (const entry of entries) {
      throwIfAborted(signal);
      if (!isSafeSegment(entry.name) || !fs.contains(root, entry.target)) continue;
      const path = relativeChild(current.prefix, entry.name);
      if (entry.type === "file") {
        if (files.length >= maxFiles) {
          truncated = true;
          break;
        }
        files.push(path);
        continue;
      }
      if (entry.type !== "directory") continue;
      if (IGNORED_DIRECTORY_SET.has(entry.name.toLowerCase())) continue;
      if (current.depth >= maxDepth) {
        truncated = true;
        continue;
      }
      if (visited.has(entry.target.targetKey)) continue;
      visited.add(entry.target.targetKey);
      directories.push({
        target: entry.target,
        prefix: path,
        depth: current.depth + 1,
      });
    }

    if (truncated && files.length >= maxFiles) break;
    for (let index = directories.length - 1; index >= 0; index -= 1) {
      pending.push(directories[index]);
    }
  }

  files.sort(compareNames);
  return { files, truncated };
}

function rankPath(path, query) {
  if (query === "") return 10;
  const normalized = path.toLowerCase();
  const slash = normalized.lastIndexOf("/");
  const basename = slash < 0 ? normalized : normalized.slice(slash + 1);
  if (normalized === query) return 0;
  if (basename === query) return 1;
  if (basename.startsWith(query)) return 2;
  if (normalized.startsWith(query)) return 3;
  if (basename.includes(query)) return 4;
  if (normalized.includes(query)) return 5;
  return undefined;
}

export function searchIndex(index, query, limit = DEFAULT_LIMITS.searchResults) {
  if (typeof query !== "string" || query.length > 512) {
    throw new WorkspaceFileError("invalid-query", "Search query is invalid");
  }
  const normalizedQuery = query.trim().toLowerCase();
  return index.files
    .map((path) => ({ path, score: rankPath(path, normalizedQuery) }))
    .filter((candidate) => candidate.score !== undefined)
    .sort((left, right) => {
      if (left.score !== right.score) return left.score - right.score;
      if (left.path.length !== right.path.length) {
        return left.path.length - right.path.length;
      }
      return compareNames(left.path, right.path);
    })
    .slice(0, limit)
    .map(({ path }) => ({
      path,
      name: path.slice(path.lastIndexOf("/") + 1),
    }));
}

export class WorkspaceCatalog {
  constructor(fs, options = {}) {
    this.fs = fs;
    this.maxRoots = options.maxRoots ?? DEFAULT_LIMITS.cacheRoots;
    this.ttlMs = options.ttlMs ?? DEFAULT_LIMITS.cacheTtlMs;
    this.maxFiles = options.maxFiles ?? DEFAULT_LIMITS.searchFiles;
    this.maxDepth = options.maxDepth ?? DEFAULT_LIMITS.searchDepth;
    this.resultLimit = options.resultLimit ?? DEFAULT_LIMITS.searchResults;
    this.now = options.now ?? (() => Date.now());
    this.cache = new Map();
  }

  async search(cwd, query, signal, options = {}) {
    const root = await openWorkspaceRoot(this.fs, cwd, signal);
    const key = root.targetKey;
    const now = this.now();
    let cached = this.cache.get(key);
    if (
      options.refresh === true ||
      (cached !== undefined && now - cached.createdAt >= this.ttlMs)
    ) {
      this.cache.delete(key);
      cached = undefined;
    }

    if (cached === undefined) {
      const promise = buildWorkspaceIndex(this.fs, root, signal, {
        maxFiles: this.maxFiles,
        maxDepth: this.maxDepth,
      });
      cached = { createdAt: now, promise };
      this.cache.set(key, cached);
      promise.catch(() => {
        if (this.cache.get(key) === cached) this.cache.delete(key);
      });
      while (this.cache.size > this.maxRoots) {
        this.cache.delete(this.cache.keys().next().value);
      }
    } else {
      this.cache.delete(key);
      this.cache.set(key, cached);
    }

    const index = await cached.promise;
    throwIfAborted(signal);
    return {
      files: searchIndex(index, query, this.resultLimit),
      indexed: index.files.length,
      truncated: index.truncated,
    };
  }
}

import assert from "node:assert/strict";
import test from "node:test";

import {
  WorkspaceCatalog,
  WorkspaceFileError,
  browseWorkspace,
  buildWorkspaceIndex,
  parseRelativePath,
  searchIndex,
} from "../lib/core.js";
import { createRpcHandler } from "../lib/index.js";

function createFixture() {
  const targets = new Map();
  const nodes = new Map();
  const target = (key) => {
    if (!targets.has(key)) {
      targets.set(key, { targetKey: key, displayPath: key });
    }
    return targets.get(key);
  };
  const addDirectory = (key, children = []) => {
    nodes.set(key, { type: "directory", children });
    target(key);
  };
  const addFile = (key) => {
    nodes.set(key, { type: "file", children: [] });
    target(key);
  };
  const entry = (name, type, key) => ({ name, type, target: target(key) });

  addDirectory("/workspace", [
    entry("src", "directory", "/workspace/src"),
    entry("node_modules", "directory", "/workspace/node_modules"),
    entry("README.md", "file", "/workspace/README.md"),
    entry("zeta.txt", "file", "/workspace/zeta.txt"),
    entry("escape", "directory", "/outside"),
  ]);
  addDirectory("/workspace/src", [
    entry("nested", "directory", "/workspace/src/nested"),
    entry("main.js", "file", "/workspace/src/main.js"),
    entry("alpha.js", "file", "/workspace/src/alpha.js"),
  ]);
  addDirectory("/workspace/src/nested", [
    entry("deep file.txt", "file", "/workspace/src/nested/deep file.txt"),
    entry("loop", "directory", "/workspace"),
  ]);
  addDirectory("/workspace/node_modules", [
    entry("ignored.js", "file", "/workspace/node_modules/ignored.js"),
  ]);
  addFile("/workspace/README.md");
  addFile("/workspace/zeta.txt");
  addFile("/workspace/src/main.js");
  addFile("/workspace/src/alpha.js");
  addFile("/workspace/src/nested/deep file.txt");
  addFile("/workspace/node_modules/ignored.js");
  addDirectory("/outside", [entry("secret.txt", "file", "/outside/secret.txt")]);
  addFile("/outside/secret.txt");

  const calls = { resolve: [], listDir: [] };
  const fs = {
    async resolve(path) {
      calls.resolve.push(path);
      const resolved = targets.get(path);
      if (resolved === undefined) throw new Error(`missing target ${path}`);
      return resolved;
    },
    async stat(candidate) {
      const node = nodes.get(candidate.targetKey);
      return node === undefined ? undefined : { type: node.type, version: "v1" };
    },
    async listDir(candidate) {
      calls.listDir.push(candidate.targetKey);
      const node = nodes.get(candidate.targetKey);
      if (node?.type !== "directory") throw new Error("not a directory");
      return node.children;
    },
    contains(parent, child) {
      return (
        child.targetKey === parent.targetKey ||
        child.targetKey.startsWith(`${parent.targetKey}/`)
      );
    },
  };
  return { fs, calls };
}

test("parseRelativePath accepts normalized workspace paths", () => {
  assert.deepEqual(parseRelativePath(""), []);
  assert.deepEqual(parseRelativePath("src/nested"), ["src", "nested"]);
});

test("parseRelativePath rejects traversal and separator smuggling", () => {
  for (const value of [".", "..", "src/../secret", "src\\secret", "/src", "src//x"]) {
    assert.throws(
      () => parseRelativePath(value),
      (error) => error instanceof WorkspaceFileError && error.code === "invalid-path",
      value,
    );
  }
});

test("browseWorkspace sorts entries and excludes canonical escapes", async () => {
  const { fs } = createFixture();
  const result = await browseWorkspace(fs, "/workspace", "", undefined, {
    limit: 3,
  });
  assert.deepEqual(result, {
    path: "",
    entries: [
      { name: "src", type: "directory" },
      { name: "README.md", type: "file" },
      { name: "zeta.txt", type: "file" },
    ],
    truncated: false,
  });
});

test("browseWorkspace resolves each segment and rejects escaped directories", async () => {
  const { fs } = createFixture();
  const nested = await browseWorkspace(fs, "/workspace", "src/nested");
  assert.equal(nested.entries[0].name, "deep file.txt");
  await assert.rejects(
    browseWorkspace(fs, "/workspace", "escape"),
    (error) => error instanceof WorkspaceFileError && error.code === "invalid-path",
  );
});

test("workspace index skips ignored directories, escapes, and cycles", async () => {
  const { fs } = createFixture();
  const root = await fs.resolve("/workspace");
  const index = await buildWorkspaceIndex(fs, root);
  assert.deepEqual(index.files, [
    "README.md",
    "src/alpha.js",
    "src/main.js",
    "src/nested/deep file.txt",
    "zeta.txt",
  ]);
  assert.equal(index.truncated, false);
  assert.deepEqual(searchIndex(index, "main"), [
    { path: "src/main.js", name: "main.js" },
  ]);
});

test("WorkspaceCatalog reuses a fresh root index", async () => {
  const { fs, calls } = createFixture();
  const catalog = new WorkspaceCatalog(fs, { now: () => 100, ttlMs: 1000 });
  await catalog.search("/workspace", "alpha");
  const rootListings = calls.listDir.filter((path) => path === "/workspace").length;
  await catalog.search("/workspace", "deep");
  assert.equal(
    calls.listDir.filter((path) => path === "/workspace").length,
    rootListings,
  );
});

test("RPC binds the root to the live session cwd", async () => {
  const { fs, calls } = createFixture();
  const ctx = {
    fs,
    sessions: {
      get(id) {
        return id === "session-1" ? { header: { cwd: "/workspace" } } : undefined;
      },
    },
    logger: { warn() {} },
  };
  const handler = createRpcHandler(ctx);
  const result = await handler(
    "browse",
    {
      sessionId: "session-1",
      relativePath: "src",
      root: "/outside",
    },
    new AbortController().signal,
  );
  assert.equal(result.ok, true);
  assert.equal(calls.resolve.at(-1), "/workspace");

  const missing = await handler(
    "browse",
    { sessionId: "missing", relativePath: "" },
    new AbortController().signal,
  );
  assert.equal(missing.ok, false);
  assert.equal(missing.error.code, "session-not-found");
});

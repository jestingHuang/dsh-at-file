import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const clientUrl = new URL("../lib/client.js", import.meta.url);
const packageUrl = new URL("../package.json", import.meta.url);

test("client bundle registers a loadable Cordis plugin", async () => {
  const source = await readFile(clientUrl, "utf8");
  let registration;
  vm.runInNewContext(source, {
    window: {
      __ModuleLoader__: {
        load(value) {
          registration = value;
        },
      },
    },
  });
  assert.equal(registration.id, "dsh-at-file");
  const plugin = registration.factory((name) => {
    assert.equal(name, "react");
    return {};
  });
  assert.equal(typeof plugin.apply, "function");
  assert.deepEqual(
    [...plugin.inject],
    ["connection", "inputTriggers", "slots"],
  );
});

test("package declares its formal web client face", async () => {
  const manifest = JSON.parse(await readFile(packageUrl, "utf8"));
  assert.equal(manifest.dsh.bundle, undefined);
  assert.equal(manifest.dsh.client.platform, "web");
  assert.ok(
    manifest.dsh.client.inject.includes(
      "@deepseek-ai/dsh-client-ui-conversation",
    ),
  );
});

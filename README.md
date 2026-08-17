# dsh-at-file

A formal dual-face Cordis plugin for DeepSeek Harness Web.

- Adds an `@` composer button that opens a workspace-scoped file manager.
- Supports cross-directory multi-selection and inserts space-separated mentions.
- Adds workspace file candidates to the existing manual `@query` menu.
- Resolves the workspace from the live Host session and checks canonical containment for every traversed target.

## DSH compatibility

| DSH version | Support status |
| --- | --- |
| `0.1.0-rc.6` | Supported and verified |
| Other versions | Not verified |

The plugin currently targets the Client Slot, Connection RPC, filesystem, Session, and system-prompt contracts shipped by DSH `0.1.0-rc.6`. DSH pre-release upgrades may change these contracts. After upgrading DSH, rerun the test suite and profile composition check before using the plugin:

```powershell
npm --prefix "$HOME/.dsh/plugins/dsh-at-file" test
dsh --profile web --dump-config | Select-String -Pattern "at-file|dsh-at-file"
```

Then refresh the Web page and verify the `@` button, cross-directory multi-selection, insertion, and manual `@query` search.

## Install

```powershell
corepack pnpm --dir "$HOME/.dsh/profiles/web" add "file:$HOME/.dsh/plugins/dsh-at-file"
```

Activate the installed package with a user-owned Web profile row in `$HOME/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: at-file
      name: dsh-at-file
```

The running Web profile watches this patch. Refresh the existing Web page after the row mounts; future `dsh web` starts load it automatically.

## Verify

```powershell
node --test --experimental-test-isolation=none "$HOME/.dsh/plugins/dsh-at-file/test"
```

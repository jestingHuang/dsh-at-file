# dsh-at-file

A formal dual-face Cordis plugin for DeepSeek Harness Web.

- Adds an `@` composer button that opens a workspace-scoped file manager.
- Supports cross-directory multi-selection and inserts space-separated mentions.
- Adds workspace file candidates to the existing manual `@query` menu.
- Resolves the workspace from the live Host session and checks canonical containment for every traversed target.

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

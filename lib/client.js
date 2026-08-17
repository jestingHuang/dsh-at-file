window.__ModuleLoader__.load({
  id: "dsh-at-file",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");
    const RPC_CHANNEL = "/at-file";
    const STYLE_ID = "dsh-at-file/styles";
    const SOURCE_NAME = "文件";

    const CSS = `
.daf-trigger{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:transparent;border:0;border-radius:50%;display:inline-grid;place-items:center;padding:0;font:600 15px/1 var(--dsw-font-family,Inter,sans-serif);letter-spacing:0;flex:none}
.daf-trigger:hover:not(:disabled),.daf-trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}
.daf-trigger:focus-visible{outline:2px solid var(--dsw-alias-label-tertiary);outline-offset:1px}
.daf-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.daf-backdrop{position:fixed;inset:0;z-index:1200;background:color-mix(in srgb,#000 42%,transparent);display:grid;place-items:center;padding:16px;box-sizing:border-box}
.daf-dialog{width:min(720px,calc(100vw - 32px));height:min(590px,calc(100dvh - 48px));min-height:360px;background:var(--dsw-specific-menu,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;font-family:var(--dsw-font-family,Inter,sans-serif);letter-spacing:0}
.daf-header{height:48px;min-height:48px;border-bottom:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;gap:12px;padding:0 12px 0 16px;box-sizing:border-box}
.daf-title{font-size:14px;line-height:20px;font-weight:600;min-width:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.daf-iconButton{width:28px;height:28px;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-grid;place-items:center;padding:0;font:18px/1 var(--dsw-font-family,Inter,sans-serif)}
.daf-iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.daf-iconButton:focus-visible,.daf-crumb:focus-visible,.daf-rowButton:focus-visible,.daf-secondary:focus-visible,.daf-primary:focus-visible,.daf-filter:focus-visible{outline:2px solid var(--dsw-alias-label-tertiary);outline-offset:1px}
.daf-toolbar{border-bottom:1px solid var(--dsw-alias-border-l2);padding:10px 12px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box}
.daf-pathRow{display:flex;align-items:center;gap:8px;min-width:0}
.daf-crumbs{display:flex;align-items:center;gap:2px;min-width:0;flex:1;overflow-x:auto;scrollbar-width:thin}
.daf-crumb{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:3px 6px;font:500 13px/20px var(--dsw-font-family,Inter,sans-serif);white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis}
.daf-crumb:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.daf-crumb[aria-current=page]{color:var(--dsw-alias-label-primary);cursor:default}
.daf-separator{color:var(--dsw-alias-label-caption);font-size:12px;line-height:20px;flex:none}
.daf-filter{width:100%;height:34px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:0 10px;font:13px/20px var(--dsw-font-family,Inter,sans-serif);letter-spacing:0}
.daf-filter::placeholder{color:var(--dsw-alias-label-caption)}
.daf-body{flex:1;min-height:0;overflow:auto;padding:6px 8px;box-sizing:border-box;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2)}
.daf-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1px}
.daf-row{height:36px;min-height:36px;border-radius:6px;display:flex;align-items:center;gap:10px;padding:0 10px;box-sizing:border-box;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;min-width:0}
.daf-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.daf-row[data-selected=true]{background:var(--dsw-alias-state-business-tertiary)}
.daf-rowButton{width:100%;height:100%;border:0;background:transparent;color:inherit;display:flex;align-items:center;gap:10px;padding:0;text-align:left;cursor:pointer;font:inherit;min-width:0}
.daf-check{width:16px;height:16px;margin:0;flex:none;accent-color:var(--dsw-alias-state-business-primary)}
.daf-kind{width:16px;height:16px;display:inline-grid;place-items:center;flex:none;color:var(--dsw-alias-label-tertiary);font-size:13px}
.daf-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.daf-state{height:100%;min-height:160px;display:grid;place-items:center;padding:24px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;text-align:center;box-sizing:border-box}
.daf-state[data-error=true]{color:var(--dsw-alias-state-error-primary)}
.daf-limit{padding:6px 10px;color:var(--dsw-alias-state-warn-primary);font-size:12px;line-height:18px}
.daf-footer{min-height:54px;border-top:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;gap:8px;padding:8px 12px;box-sizing:border-box}
.daf-selection{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}
.daf-selectionCount{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}
.daf-selectionPaths{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.daf-secondary,.daf-primary{height:34px;border-radius:6px;padding:0 14px;font:500 13px/20px var(--dsw-font-family,Inter,sans-serif);letter-spacing:0;cursor:pointer;white-space:nowrap}
.daf-secondary{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary)}
.daf-secondary:hover{background:var(--dsw-alias-interactive-bg-hover)}
.daf-primary{border:1px solid transparent;background:var(--dsw-alias-state-business-primary);color:#fff}
.daf-primary:hover:not(:disabled){filter:brightness(.96)}
.daf-primary:disabled{opacity:.45;cursor:default}
@media (max-width:560px){.daf-backdrop{padding:8px}.daf-dialog{width:calc(100vw - 16px);height:calc(100dvh - 16px);min-height:0}.daf-header{padding-left:12px}.daf-toolbar{padding:8px}.daf-footer{padding:8px}.daf-selectionPaths{display:none}.daf-secondary,.daf-primary{padding:0 11px}.daf-crumb{max-width:120px}}
`;

    function formatMention(path) {
      if (!/[\s"\\]/.test(path)) return `@${path}`;
      const escaped = path.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
      return `@"${escaped}"`;
    }

    function createDialogStore() {
      const open = new Set();
      const listeners = new Map();
      const notify = (sessionId) => {
        for (const listener of [...(listeners.get(sessionId) ?? [])]) listener();
      };
      return {
        get(sessionId) {
          return open.has(sessionId);
        },
        set(sessionId, value) {
          const before = open.has(sessionId);
          if (value) open.add(sessionId);
          else open.delete(sessionId);
          if (before !== value) notify(sessionId);
        },
        toggle(sessionId) {
          this.set(sessionId, !open.has(sessionId));
        },
        subscribe(sessionId, listener) {
          const group = listeners.get(sessionId) ?? new Set();
          group.add(listener);
          listeners.set(sessionId, group);
          return () => {
            group.delete(listener);
            if (group.size === 0) listeners.delete(sessionId);
          };
        },
      };
    }

    function useDialogOpen(store, sessionId) {
      return React.useSyncExternalStore(
        (listener) => store.subscribe(sessionId, listener),
        () => store.get(sessionId),
        () => false,
      );
    }

    async function callHost(ctx, endpoint, payload, signal) {
      const result = await ctx.connection.rpc.call(
        RPC_CHANNEL,
        endpoint,
        payload,
        signal,
      );
      if (!result.ok) {
        const error = new Error(result.error.message);
        error.code = result.error.code;
        throw error;
      }
      return result.value;
    }

    function createTrigger(store) {
      return function AtFileTrigger(props) {
        const isOpen = useDialogOpen(store, props.sessionId);
        const disabled = props.input?.phase !== "plain";
        return React.createElement(
          "button",
          {
            type: "button",
            className: "daf-trigger",
            title: "选择工作区文件",
            "aria-label": "选择工作区文件",
            "aria-expanded": isOpen,
            disabled,
            onClick: () => store.toggle(props.sessionId),
          },
          "@",
        );
      };
    }

    function createManager(ctx, store) {
      return function AtFileManager(props) {
        const isOpen = useDialogOpen(store, props.sessionId);
        const draft = props.useInput((state) => state.draft);
        const phase = props.useInput((state) => state.phase);
        const [path, setPath] = React.useState("");
        const [entries, setEntries] = React.useState([]);
        const [filter, setFilter] = React.useState("");
        const [selected, setSelected] = React.useState(() => new Set());
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState("");
        const [truncated, setTruncated] = React.useState(false);
        const [refresh, setRefresh] = React.useState(0);
        const dialogRef = React.useRef(null);
        const filterRef = React.useRef(null);

        React.useEffect(() => {
          if (!isOpen) return undefined;
          setPath("");
          setFilter("");
          setSelected(new Set());
          setError("");
          return undefined;
        }, [isOpen, props.sessionId]);

        React.useEffect(() => {
          if (!isOpen) return undefined;
          const controller = new AbortController();
          setLoading(true);
          setError("");
          callHost(
            ctx,
            "browse",
            { sessionId: props.sessionId, relativePath: path },
            controller.signal,
          ).then(
            (value) => {
              if (controller.signal.aborted) return;
              setEntries(value.entries);
              setTruncated(value.truncated === true);
              setLoading(false);
            },
            (reason) => {
              if (controller.signal.aborted) return;
              setEntries([]);
              setTruncated(false);
              setError(reason instanceof Error ? reason.message : String(reason));
              setLoading(false);
            },
          );
          return () => controller.abort();
        }, [isOpen, path, refresh, props.sessionId]);

        React.useEffect(() => {
          if (!isOpen) return undefined;
          const previous = document.activeElement;
          filterRef.current?.focus();
          const onKeyDown = (event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              store.set(props.sessionId, false);
              return;
            }
            if (event.key !== "Tab") return;
            const focusable = dialogRef.current?.querySelectorAll(
              'button:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex="-1"])',
            );
            if (focusable === undefined || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          };
          document.addEventListener("keydown", onKeyDown);
          return () => {
            document.removeEventListener("keydown", onKeyDown);
            if (previous instanceof HTMLElement) previous.focus();
          };
        }, [isOpen, props.sessionId]);

        if (!isOpen) return null;

        const normalizedFilter = filter.trim().toLowerCase();
        const visibleEntries = entries.filter(
          (entry) =>
            normalizedFilter === "" ||
            entry.name.toLowerCase().includes(normalizedFilter),
        );
        const segments = path === "" ? [] : path.split("/");
        const crumbs = [{ label: "工作区", path: "" }];
        let built = "";
        for (const segment of segments) {
          built = built === "" ? segment : `${built}/${segment}`;
          crumbs.push({ label: segment, path: built });
        }
        const selectedPaths = [...selected];

        const toggleFile = (filePath) => {
          setSelected((current) => {
            const next = new Set(current);
            if (next.has(filePath)) next.delete(filePath);
            else next.add(filePath);
            return next;
          });
        };
        const enterDirectory = (name) => {
          setPath(path === "" ? name : `${path}/${name}`);
          setFilter("");
        };
        const close = () => store.set(props.sessionId, false);
        const addSelected = () => {
          if (selectedPaths.length === 0 || phase !== "plain") return;
          const mentions = selectedPaths.map(formatMention).join(" ");
          const spacer = draft.length === 0 || /\s$/.test(draft) ? "" : " ";
          props.inputActions.setDraft(`${draft}${spacer}${mentions} `);
          close();
        };

        const rows = visibleEntries.map((entry) => {
          const filePath = path === "" ? entry.name : `${path}/${entry.name}`;
          if (entry.type === "directory") {
            return React.createElement(
              "li",
              { className: "daf-row", key: `d:${entry.name}` },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "daf-rowButton",
                  onClick: () => enterDirectory(entry.name),
                  title: entry.name,
                },
                React.createElement("span", { className: "daf-kind", "aria-hidden": true }, "▸"),
                React.createElement("span", { className: "daf-name" }, entry.name),
              ),
            );
          }
          const checked = selected.has(filePath);
          return React.createElement(
            "li",
            {
              className: "daf-row",
              key: `f:${entry.name}`,
              "data-selected": checked,
            },
            React.createElement(
              "label",
              { className: "daf-rowButton", title: filePath },
              React.createElement("input", {
                type: "checkbox",
                className: "daf-check",
                checked,
                onChange: () => toggleFile(filePath),
              }),
              React.createElement("span", { className: "daf-name" }, entry.name),
            ),
          );
        });

        let body;
        if (loading) {
          body = React.createElement("div", { className: "daf-state" }, "正在读取目录…");
        } else if (error !== "") {
          body = React.createElement("div", { className: "daf-state", "data-error": true }, error);
        } else if (rows.length === 0) {
          body = React.createElement(
            "div",
            { className: "daf-state" },
            normalizedFilter === "" ? "此目录没有可选择的文件" : "没有匹配项",
          );
        } else {
          body = React.createElement(
            React.Fragment,
            null,
            React.createElement("ul", { className: "daf-list" }, rows),
            truncated
              ? React.createElement(
                  "div",
                  { className: "daf-limit" },
                  "此目录项目过多，仅显示前 500 项",
                )
              : null,
          );
        }

        return React.createElement(
          "div",
          {
            className: "daf-backdrop",
            onMouseDown: (event) => {
              if (event.target === event.currentTarget) close();
            },
          },
          React.createElement(
            "section",
            {
              className: "daf-dialog",
              role: "dialog",
              "aria-modal": true,
              "aria-label": "选择工作区文件",
              ref: dialogRef,
            },
            React.createElement(
              "header",
              { className: "daf-header" },
              React.createElement("div", { className: "daf-title" }, "选择工作区文件"),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "daf-iconButton",
                  title: "关闭",
                  "aria-label": "关闭",
                  onClick: close,
                },
                "×",
              ),
            ),
            React.createElement(
              "div",
              { className: "daf-toolbar" },
              React.createElement(
                "div",
                { className: "daf-pathRow" },
                React.createElement(
                  "nav",
                  { className: "daf-crumbs", "aria-label": "当前目录" },
                  crumbs.flatMap((crumb, index) => {
                    const current = index === crumbs.length - 1;
                    const nodes = [];
                    if (index > 0) {
                      nodes.push(
                        React.createElement(
                          "span",
                          { className: "daf-separator", key: `s:${crumb.path}` },
                          "/",
                        ),
                      );
                    }
                    nodes.push(
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          className: "daf-crumb",
                          key: `c:${crumb.path}`,
                          title: crumb.label,
                          "aria-current": current ? "page" : undefined,
                          disabled: current,
                          onClick: () => {
                            setPath(crumb.path);
                            setFilter("");
                          },
                        },
                        crumb.label,
                      ),
                    );
                    return nodes;
                  }),
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    className: "daf-iconButton",
                    title: "刷新",
                    "aria-label": "刷新",
                    onClick: () => setRefresh((value) => value + 1),
                  },
                  "↻",
                ),
              ),
              React.createElement("input", {
                ref: filterRef,
                className: "daf-filter",
                type: "search",
                value: filter,
                placeholder: "筛选当前目录",
                "aria-label": "筛选当前目录",
                onChange: (event) => setFilter(event.target.value),
              }),
            ),
            React.createElement("div", { className: "daf-body" }, body),
            React.createElement(
              "footer",
              { className: "daf-footer" },
              React.createElement(
                "div",
                { className: "daf-selection" },
                React.createElement(
                  "div",
                  { className: "daf-selectionCount" },
                  `已选择 ${selectedPaths.length} 个文件`,
                ),
                React.createElement(
                  "div",
                  {
                    className: "daf-selectionPaths",
                    title: selectedPaths.join("\n"),
                  },
                  selectedPaths.length === 0 ? "尚未选择" : selectedPaths.join("，"),
                ),
              ),
              React.createElement(
                "button",
                { type: "button", className: "daf-secondary", onClick: close },
                "取消",
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "daf-primary",
                  disabled: selectedPaths.length === 0 || phase !== "plain",
                  onClick: addSelected,
                },
                `添加 (${selectedPaths.length})`,
              ),
            ),
          ),
        );
      };
    }

    const inject = ["connection", "inputTriggers", "slots"];

    function apply(ctx) {
      const store = createDialogStore();
      const Trigger = createTrigger(store);
      const Manager = createManager(ctx, store);

      ctx.effect(() => {
        if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) !== null) {
          return () => {};
        }
        const style = document.createElement("style");
        style.dataset.plugin = "dsh-at-file";
        style.dataset.pluginCss = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, "dsh-at-file: styles");

      const source = {
        trigger: "@",
        name: SOURCE_NAME,
        order: 20,
        async candidates(session, { query, signal }) {
          const value = await callHost(
            ctx,
            "search",
            { sessionId: session.sessionId, query },
            signal,
          );
          return value.files.map((file) => ({ name: file.path }));
        },
        onPick({ candidate }) {
          return { text: `${formatMention(candidate.name)} ` };
        },
      };
      ctx.effect(
        () => ctx.inputTriggers.registerSource(source),
        "dsh-at-file: @ source",
      );

      ctx.slots.inject("conversation.input.left", () =>
        ctx.slots.register(
          {
            name: "conversation.input.left",
            id: "dsh-at-file:trigger",
            order: 40,
          },
          Trigger,
        ),
      );
      ctx.slots.inject("conversation.input.overlay", () =>
        ctx.slots.register(
          {
            name: "conversation.input.overlay",
            id: "dsh-at-file:manager",
            order: 40,
          },
          Manager,
        ),
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});

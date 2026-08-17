import {
  WorkspaceCatalog,
  WorkspaceFileError,
  browseWorkspace,
} from "./core.js";

export const inject = ["connection", "fs", "sessions", "systemPrompt"];
export const RPC_CHANNEL = "/at-file";

function failure(code, message, details) {
  return { ok: false, error: { code, message, details } };
}

function badRequest(message) {
  return failure("bad-request", message, { issues: [] });
}

function requestObject(payload) {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new WorkspaceFileError("bad-request", "Request payload must be an object");
  }
  return payload;
}

function requestSession(ctx, payload) {
  if (typeof payload.sessionId !== "string" || payload.sessionId.length === 0) {
    throw new WorkspaceFileError("bad-request", "sessionId is required");
  }
  const session = ctx.sessions.get(payload.sessionId);
  if (session === undefined) {
    return {
      error: failure("session-not-found", "Session is not live", {
        sessionId: payload.sessionId,
      }),
    };
  }
  if (typeof session.header.cwd !== "string" || session.header.cwd.length === 0) {
    return {
      error: failure("directory-unreadable", "Session has no workspace", {
        path: ".",
      }),
    };
  }
  return { session, cwd: session.header.cwd };
}

function mapFailure(error, requestedPath = "") {
  if (error?.name === "AbortError") {
    return failure("cancelled", "File request was cancelled", {});
  }
  if (error instanceof WorkspaceFileError) {
    if (error.code === "invalid-path") {
      return failure("workspace-invalid-path", error.message, {
        path: error.path || requestedPath,
      });
    }
    if (error.code === "workspace-unavailable") {
      return failure("directory-unreadable", error.message, { path: "." });
    }
    if (error.code === "bad-request" || error.code === "invalid-query") {
      return badRequest(error.message);
    }
  }
  return failure("internal", "Unable to read workspace files", {});
}

export function createRpcHandler(ctx, catalog = new WorkspaceCatalog(ctx.fs)) {
  return async (endpoint, payloadValue, signal) => {
    let requestedPath = "";
    try {
      const payload = requestObject(payloadValue);
      const resolved = requestSession(ctx, payload);
      if (resolved.error !== undefined) return resolved.error;

      if (endpoint === "browse") {
        requestedPath = payload.relativePath ?? "";
        if (typeof requestedPath !== "string") {
          return badRequest("relativePath must be a string");
        }
        const value = await browseWorkspace(
          ctx.fs,
          resolved.cwd,
          requestedPath,
          signal,
        );
        return { ok: true, value };
      }

      if (endpoint === "search") {
        const query = payload.query ?? "";
        if (typeof query !== "string") return badRequest("query must be a string");
        if (payload.refresh !== undefined && typeof payload.refresh !== "boolean") {
          return badRequest("refresh must be a boolean");
        }
        const value = await catalog.search(resolved.cwd, query, signal, {
          refresh: payload.refresh === true,
        });
        return { ok: true, value };
      }

      return badRequest(`Unknown at-file endpoint: ${endpoint}`);
    } catch (error) {
      ctx.logger?.warn?.("dsh-at-file request failed", error);
      return mapFailure(error, requestedPath);
    }
  };
}

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: "dsh-at-file:mentions",
    order: 105,
    text: [
      "Messages may contain workspace file references written as @relative/path or @\"relative/path with spaces\".",
      "When an @ token resolves to a regular file under the current session working directory, inspect or read that file before answering questions about it or editing it.",
      "Do not treat an @ token as a file when it does not resolve inside the current workspace; other @ reference sources may use the same prefix.",
    ].join(" "),
  });

  ctx.connection.rpc.handle(
    RPC_CHANNEL,
    createRpcHandler(ctx),
    { authority: "loopback" },
  );
}

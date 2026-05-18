const http = require("node:http");

const PORT = Number(process.env.PORT || 8787);
const TARGET_ORIGIN = process.env.TARGET_ORIGIN || "https://tea.qingnian8.com";
const TARGET_PREFIX = process.env.TARGET_PREFIX || "/api/bizhi";
const PROXY_PREFIX = process.env.PROXY_PREFIX || "/api/bizhi";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const UPSTREAM_ACCESS_KEY = process.env.UPSTREAM_ACCESS_KEY || "1328433750wuli@";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "origin",
  "referer",
]);

function resolveAllowedOrigin(requestOrigin) {
  if (!requestOrigin) {
    return "*";
  }

  if (ALLOWED_ORIGIN === "*" || ALLOWED_ORIGIN === requestOrigin) {
    return requestOrigin;
  }

  return ALLOWED_ORIGIN;
}

function applyCorsHeaders(req, res) {
  const allowedOrigin = resolveAllowedOrigin(req.headers.origin);
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin, Access-Control-Request-Headers");
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function buildUpstreamHeaders(req) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else {
      headers.set(key, value);
    }
  }

  if (UPSTREAM_ACCESS_KEY && !headers.has("access-key")) {
    headers.set("access-key", UPSTREAM_ACCESS_KEY);
  }

  return headers;
}

function copyResponseHeaders(upstream, res) {
  for (const [key, value] of upstream.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lowerKey) || lowerKey.startsWith("access-control-")) {
      continue;
    }
    res.setHeader(key, value);
  }
}

const server = http.createServer(async (req, res) => {
  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (!requestUrl.pathname.startsWith(PROXY_PREFIX)) {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ errCode: 404, errMsg: "Proxy route not found" }));
    return;
  }

  const upstreamPath = requestUrl.pathname.slice(PROXY_PREFIX.length);
  const upstreamUrl = new URL(TARGET_PREFIX + upstreamPath + requestUrl.search, TARGET_ORIGIN);

  try {
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readRequestBody(req);
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: buildUpstreamHeaders(req),
      body,
      redirect: "follow",
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    copyResponseHeaders(upstream, res);
    applyCorsHeaders(req, res);
    res.writeHead(upstream.status);
    res.end(buffer);
  } catch (error) {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        errCode: 502,
        errMsg: "Proxy request failed",
        detail: error instanceof Error ? error.message : String(error),
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Wallpaper proxy listening on http://localhost:${PORT}`);
});

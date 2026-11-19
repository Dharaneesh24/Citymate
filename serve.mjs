import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const directory = fileURLToPath(new URL("./dist/", import.meta.url));
const indexPath = resolve(directory, "index.html");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function findFile(path) {
  try {
    const info = await stat(path);
    return info.isFile() ? info : null;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

function textResponse(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function canServeApp(request, pathname) {
  const accepts = request.headers.accept || "*/*";
  return (
    !extname(pathname) &&
    !/^\/(api|assets)(\/|$)/.test(pathname) &&
    (accepts.includes("text/html") || accepts.includes("*/*"))
  );
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("PORT must be an integer between 1 and 65535.");
  process.exit(1);
}

if (!(await findFile(indexPath))) {
  console.error("CityMate's build is missing. Run npm ci and npm run build first.");
  process.exit(1);
}

const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Cache-Control", "no-cache");

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    textResponse(response, 405, "Method not allowed.");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    textResponse(response, 400, "Invalid URL.");
    return;
  }

  if (pathname.includes("\\") || pathname.includes("\0")) {
    textResponse(response, 400, "Invalid path.");
    return;
  }

  let filePath = pathname === "/" ? indexPath : resolve(directory, "." + pathname);
  const relativePath = relative(directory, filePath);
  if (relativePath === ".." || relativePath.startsWith(".." + sep) || isAbsolute(relativePath)) {
    textResponse(response, 404, "File not found.");
    return;
  }

  try {
    let file = await findFile(filePath);
    if (!file && canServeApp(request, pathname)) {
      filePath = indexPath;
      file = await findFile(filePath);
    }
    if (!file) {
      textResponse(response, 404, "File not found.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Content-Length": file.size,
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const stream = createReadStream(filePath);
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  } catch {
    textResponse(response, 500, "Unable to read the requested file.");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is busy. Set PORT to an available port and try again.`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`CityMate Grenoble is running at http://${host}:${port}`);
});

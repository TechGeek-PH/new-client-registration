const RAW_BASE = "https://raw.githubusercontent.com/TechGeek-PH/new-client-registration/main/";

function contentType(pathname) {
  const path = pathname.toLowerCase();
  if (path.endsWith(".html")) return "text/html; charset=UTF-8";
  if (path.endsWith(".css")) return "text/css; charset=UTF-8";
  if (path.endsWith(".js")) return "text/javascript; charset=UTF-8";
  if (path.endsWith(".json")) return "application/json; charset=UTF-8";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".txt")) return "text/plain; charset=UTF-8";
  return "application/octet-stream";
}

function resolveRepoPath(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname || "/");
  } catch {
    return null;
  }

  if (pathname === "/" || pathname === "") return "index.html";

  const repoPath = pathname.replace(/^\/+/, "");
  if (!repoPath || repoPath.includes("..") || repoPath.includes("\\") || repoPath.startsWith(".")) {
    return null;
  }

  const allowed =
    repoPath === "index.html" ||
    repoPath === "location.html" ||
    repoPath === "application_form.html" ||
    repoPath === "service-report.html" ||
    repoPath.startsWith("assets/");

  return allowed ? repoPath : null;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const repoPath = resolveRepoPath(url);

    if (!repoPath) {
      return new Response("Not found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=UTF-8",
          "cache-control": "no-store"
        }
      });
    }

    const upstreamUrl = RAW_BASE + repoPath.split("/").map(encodeURIComponent).join("/");
    const upstream = await fetch(upstreamUrl, {
      cf: {
        cacheEverything: true,
        cacheTtl: repoPath.endsWith(".html") ? 60 : 300
      }
    });

    if (!upstream.ok) {
      return new Response(
        upstream.status === 404 ? "Page not found" : "TechGeekPH application is temporarily unavailable.",
        {
          status: upstream.status === 404 ? 404 : 502,
          headers: {
            "content-type": "text/plain; charset=UTF-8",
            "cache-control": "no-store"
          }
        }
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": contentType(repoPath),
        "cache-control": repoPath.endsWith(".html") ? "public, max-age=60" : "public, max-age=300",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  }
};

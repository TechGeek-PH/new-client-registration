export default {
  async fetch(request, env, ctx) {
    const upstream = await fetch(
      "https://raw.githubusercontent.com/TechGeek-PH/new-client-registration/main/index.html",
      {
        cf: {
          cacheEverything: true,
          cacheTtl: 300
        }
      }
    );

    if (!upstream.ok) {
      return new Response("TechGeekPH application is temporarily unavailable.", {
        status: 502,
        headers: {
          "content-type": "text/plain; charset=UTF-8",
          "cache-control": "no-store"
        }
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  }
};

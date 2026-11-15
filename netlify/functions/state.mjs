import { getStore } from "@netlify/blobs";

// Shared tournament state. Anyone can read it; only someone with the
// organiser PIN (set as the ADMIN_PIN environment variable) can change it.

const json = { "content-type": "application/json", "cache-control": "no-store" };

function readPin() {
  let v = "";
  try { v = globalThis.Netlify?.env?.get("ADMIN_PIN") || ""; } catch {}
  if (!v) v = process.env.ADMIN_PIN || "";
  return String(v).trim();
}

// Strong consistency makes live results show up straight away. If this site
// can't use it, fall back to the default store (updates may lag a little).
async function withStore(fn) {
  try {
    return await fn(getStore({ name: "pickleball", consistency: "strong" }));
  } catch (e) {
    return await fn(getStore("pickleball"));
  }
}

export default async (req) => {
  try {
    const url = new URL(req.url);
    const pin = (req.headers.get("x-admin-pin") || "").trim();
    const adminPin = readPin();
    const isAdmin = adminPin !== "" && pin === adminPin;

    if (url.pathname === "/api/login") {
      if (req.method === "GET") {
        // Diagnostic: says whether a PIN is configured and storage works, never the PIN itself
        let storage = "ok";
        try { await withStore((s) => s.get("state")); } catch (e) { storage = "error: " + (e && e.message ? e.message : String(e)); }
        return new Response(JSON.stringify({ pinConfigured: adminPin !== "", pinLength: adminPin.length, storage }), { headers: json });
      }
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
      if (!adminPin) return new Response("pin-not-set", { status: 503 });
      return new Response(isAdmin ? "ok" : "forbidden", { status: isAdmin ? 200 : 403 });
    }

    if (req.method === "GET") {
      const data = await withStore((s) => s.get("state"));
      return new Response(data || "null", { headers: json });
    }

    if (req.method === "PUT") {
      if (!isAdmin) return new Response("forbidden", { status: 403 });
      const body = await req.text();
      if (body.length > 500000) return new Response("too large", { status: 413 });
      try { JSON.parse(body); } catch { return new Response("bad json", { status: 400 }); }
      await withStore((s) => s.set("state", body));
      return new Response("ok", { headers: json });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    return new Response("server-error: " + (e && e.message ? e.message : String(e)), { status: 500 });
  }
};

export const config = { path: ["/api/state", "/api/login"] };

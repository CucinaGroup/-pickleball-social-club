import { getStore } from "@netlify/blobs";

// Shared tournament state. Anyone can read it; only someone with the
// organiser PIN (set as the ADMIN_PIN environment variable) can change it.
export default async (req) => {
  const url = new URL(req.url);
  const pin = req.headers.get("x-admin-pin") || "";
  const adminPin = Netlify.env.get("ADMIN_PIN") || "";
  const isAdmin = adminPin !== "" && pin === adminPin;
  const store = getStore({ name: "pickleball", consistency: "strong" });
  const json = { "content-type": "application/json", "cache-control": "no-store" };

  if (url.pathname === "/api/login") {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    return new Response(isAdmin ? "ok" : "forbidden", { status: isAdmin ? 200 : 403 });
  }

  if (req.method === "GET") {
    const data = await store.get("state");
    return new Response(data || "null", { headers: json });
  }

  if (req.method === "PUT") {
    if (!isAdmin) return new Response("forbidden", { status: 403 });
    const body = await req.text();
    if (body.length > 500000) return new Response("too large", { status: 413 });
    try { JSON.parse(body); } catch { return new Response("bad json", { status: 400 }); }
    await store.set("state", body);
    return new Response("ok", { headers: json });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: ["/api/state", "/api/login"] };

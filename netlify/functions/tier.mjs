export default async (req) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const endpoint = process.env.CONTENT_ENDPOINT;
    const targetUrl = `${endpoint}?email=${encodeURIComponent(email)}&t=${Date.now()}`;

    const res = await fetch(targetUrl, { cache: "no-store" });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to verify tier" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/tier"
};
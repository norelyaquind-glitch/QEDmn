export default async (req) => {
  try {
    const endpoint = process.env.SHEETS_ENDPOINT;

    const res = await fetch(endpoint);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch stats" }),
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
  path: "/api/stats"
};
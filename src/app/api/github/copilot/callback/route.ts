const COMPLETE_PATH = "/api/github/copilot/complete";
const FORWARDED_PARAMS = ["code", "state", "error"];

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const forwarded = new URLSearchParams();
  for (const name of FORWARDED_PARAMS) {
    const value = params.get(name);
    if (value) forwarded.set(name, value);
  }

  const target = process.env.COPILOT_COMPLETE_URL || COMPLETE_PATH;
  const query = forwarded.toString();
  return new Response(null, {
    status: 303,
    headers: {
      Location: query ? `${target}?${query}` : target,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

/**
 * Build a usable invite URL for the current frontend.
 *
 * Backend often returns a placeholder:
 *   https://your-frontend.com/activate?token=...
 * App consumes at:
 *   {origin}/invite/{token}
 */

export function extractInviteToken(
  inviteUrl?: string | null,
  token?: string | null
): string | null {
  if (token && String(token).trim()) return String(token).trim();
  if (!inviteUrl) return null;

  try {
    const u = new URL(inviteUrl, "http://localhost");
    const fromQuery =
      u.searchParams.get("token") ||
      u.searchParams.get("invite_token") ||
      u.searchParams.get("t");
    if (fromQuery) return fromQuery;

    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "invite" || p === "activate");
    if (idx >= 0 && parts[idx + 1]) {
      return decodeURIComponent(parts[idx + 1]);
    }
    if (parts.length) return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    // ignore
  }
  return null;
}

/**
 * Full app URL: http://localhost:3000/invite/{token}
 */
export function resolveInviteUrl(params: {
  invite_url?: string | null;
  token?: string | null;
  origin?: string;
}): string {
  const token = extractInviteToken(params.invite_url, params.token);
  const origin =
    params.origin ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (token && origin) {
    const safe = encodeURI(token).replace(/#/g, "%23").replace(/\?/g, "%3F");
    return `${origin.replace(/\/$/, "")}/invite/${safe}`;
  }

  if (params.invite_url) return params.invite_url;
  return "";
}

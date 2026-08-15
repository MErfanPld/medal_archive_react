/**
 * Build a usable invite/activation URL for the current frontend.
 *
 * Backend often returns a placeholder like:
 *   https://your-frontend.com/activate?token=...
 * while this app consumes invites at:
 *   /invite/{token}
 */

export function extractInviteToken(
  inviteUrl?: string | null,
  token?: string | null
): string | null {
  if (token && token.trim()) return token.trim();
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
    return `${origin.replace(/\/$/, "")}/invite/${encodeURIComponent(token)}`;
  }

  if (params.invite_url) return params.invite_url;
  return "";
}

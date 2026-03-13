import { randomBytes } from "node:crypto";
import { json, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { checkHttpRateLimit } from "$lib/server/http-rate-limiter";
import type { RequestEvent } from "./$types";

export const GET = async ({ cookies, getClientAddress }: RequestEvent) => {
  if (!checkHttpRateLimit(getClientAddress(), 10, "oauth"))
    return json({ error: m.profile_page_action_too_many_requests() }, { status: 429 });

  const state = randomBytes(16).toString("hex");

  cookies.set("oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
    secure: !dev,
    sameSite: "lax",
  });

  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", env.DISCORD_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI ?? "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify email");
  url.searchParams.set("state", state);

  redirect(302, url.toString());
};

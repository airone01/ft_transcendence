import { redirect } from "@sveltejs/kit";
import { randomBytes } from "crypto";
import { env } from "$env/dynamic/private";

export const GET = async ({ cookies }) => {
  const state = randomBytes(16).toString("hex"); // for sec

  cookies.set("oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    secure: import.meta.env.PROD,
    sameSite: "lax",
  });

  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify email");
  url.searchParams.set("state", state);

  redirect(302, url.toString());
};

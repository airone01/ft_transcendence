import { error, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { db } from "@transc/db";
import { users, oauthAccounts } from "@transc/db/schema";
import { eq, and } from "@transc/db/drizzle-orm";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import { dev } from "$app/environment";

// helper interface for discord response typing
interface DiscordUser {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  avatar: string;
}

export const GET = async ({ event, url, cookies, locals }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies.get("oauth_state");

  // validate state
  if (!code || !state || !storedState || state !== storedState) {
    throw error(400, "Invalid state or code");
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        // this is important, discord is strict
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: env.DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) throw error(400, "Failed to get access token");
    const tokens = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) throw error(400, "Failed to fetch user data");
    const discordUser: DiscordUser = await userResponse.json();

    // we got internal discord user info
    // rest of func is DB logic

    // check if this discord ID is already linked
    const existingAccount = await db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.providerId, "discord"),
          eq(oauthAccounts.providerUserId, discordUser.id),
        ),
      )
      .limit(1);

    let userId: number;

    // depending on whether the account exists already, or it doesn't at all, or it doesn't but there is a user with the same email, we do different things
    if (existingAccount.length > 0) {
      // account exists: login
      userId = existingAccount[0].userId;
    } else {
      // account doesn't exists:
      // first check if user already has an account that is not linked to discord by searching for email in DB
      const existingEmailUser = await db
        .select()
        .from(users)
        .where(eq(users.email, discordUser.email))
        .limit(1);

      if (existingEmailUser.length > 0) {
        // user does exist (via password acc): link discord
        userId = existingEmailUser[0].id;
      } else {
        // brand new user: create fresh acc
        const newUser = await db
          .insert(users)
          .values({
            email: discordUser.email,
            username: discordUser.username,
            // no password because oauth
          })
          .returning({ id: users.id });

        userId = newUser[0].id;
      }

      // link
      await db.insert(oauthAccounts).values({
        providerId: "discord",
        providerUserId: discordUser.id,
        userId: userId,
      });
    }

    // then session and cookie
    const { token, expiresAt } = await auth.createSession(userId);
    cookies.set("session_token", token, {
      httpOnly: true,
      path: "/",
      secure: !dev,
      sameSite: "lax", // must be lax for OAuth redirects to work properly
      expires: expiresAt,
    });
  } catch (e) {
    console.error("OAuth Error:", e);
    return error(500, "Authentication failed");
  }

  throw redirect(302, "/");
};

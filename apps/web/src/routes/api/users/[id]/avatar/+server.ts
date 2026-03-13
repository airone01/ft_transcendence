import { error, redirect } from "@sveltejs/kit";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { m } from "$lib/paraglide/messages";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const userId = parseInt(params.id, 10);
  if (Number.isNaN(userId)) throw error(400, m.invalid_user_id());

  const [user] = await db
    .select({ avatar: users.avatar })
    .from(users)
    .where(eq(users.id, userId));

  if (!user || !user.avatar) throw error(404, m.avatar_not_found());

  // Discord OAuth users store a CDN URL instead of base64 — redirect to it
  if (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")) {
    throw redirect(302, user.avatar);
  }

  // DiceBear default avatars are SVG data URIs
  const svgMatch = user.avatar.match(/^data:image\/svg\+xml;base64,(.+)$/);
  if (svgMatch) {
    const imageBuffer = Buffer.from(svgMatch[1], "base64");
    setHeaders({
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
      "Content-Length": imageBuffer.length.toString(),
    });
    return new Response(imageBuffer);
  }

  // Native uploads are stored as WebP base64 data URIs
  const webpMatch = user.avatar.match(/^data:image\/\w+;base64,(.+)$/);
  if (!webpMatch) throw error(422, m.unsupported_avatar());

  const imageBuffer = Buffer.from(webpMatch[1], "base64");

  setHeaders({
    "Content-Type": "image/webp",
    "Cache-Control": "public, max-age=86400", // 24 hrs
    "Content-Length": imageBuffer.length.toString(),
  });

  return new Response(imageBuffer);
};

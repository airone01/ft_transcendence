import { loreleiNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

/**
 * @eturns base64-encoded SVG data URI ready to be stored in DB
 */
export function generateDefaultAvatar(seed: string): string {
  const avatar = createAvatar(loreleiNeutral, {
    seed,
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
    radius: 10,
  });

  return `data:image/svg+xml;base64,${Buffer.from(avatar.toString()).toString("base64")}`;
}

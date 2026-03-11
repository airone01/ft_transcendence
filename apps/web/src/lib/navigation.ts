import {
  HandshakeIcon,
  MessagesSquareIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon,
} from "@lucide/svelte";
import type { Component } from "svelte";
import * as m from "$lib/paraglide/messages";

export type SidebarItem = {
  label: string;
  icon: Component;
  onClick?: () => void;
  href: string;
  exact?: boolean;
};

export type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

export type ShellItem = Omit<SidebarItem, "href"> & { navUrl?: string };

export type ShellGroup = {
  heading: string;
  items: ShellItem[];
};

export const sidebarGroups: SidebarGroup[] = [
  {
    label: m.navigation_label_content(),
    items: [
      {
        label: m.navigation_item_profile(),
        href: "/profile/me",
        icon: UserIcon,
        exact: true,
      },
      {
        label: m.navigation_item_chat(),
        href: "/chat",
        icon: MessagesSquareIcon,
      },
      {
        label: m.navigation_item_social(),
        href: "/profile/me/social",
        icon: HandshakeIcon,
      },
    ],
  },
  {
    label: m.navigation_label_chess(),
    items: [
      {
        label: m.navigation_item_leaderboard(),
        href: "/",
        icon: TrophyIcon,
      },
      {
        label: m.navigation_item_play(),
        href: "/play",
        icon: ZapIcon,
      },
    ],
  },
];

export function naturalCap(s: string) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase();
}

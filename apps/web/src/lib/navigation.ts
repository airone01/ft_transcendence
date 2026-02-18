import {
  HandshakeIcon,
  HouseIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon,
} from "@lucide/svelte";
import type { Component } from "svelte";
import { m } from "./paraglide/messages";

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
    label: m.nav_head_mycontent(),
    items: [
      {
        label: m.nav_item_home(),
        href: "/",
        icon: HouseIcon,
      },
      {
        label: m.nav_item_profile(),
        href: "/profile/me",
        icon: UserIcon,
        exact: true,
      },
      {
        label: m.nav_item_social(),
        href: "/profile/me/social",
        icon: HandshakeIcon,
      },
    ],
  },
  {
    label: m.nav_head_chess(),
    items: [
      {
        label: m.nav_item_playnow(),
        href: "/play",
        icon: ZapIcon,
      },
      {
        label: m.nav_item_ranking(),
        href: "/ranking",
        icon: TrophyIcon,
      },
    ],
  },
];

export function naturalCap(s: string) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase();
}

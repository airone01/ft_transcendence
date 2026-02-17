import {
  HandshakeIcon,
  HouseIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon,
} from "@lucide/svelte";
import type { Component } from "svelte";

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
    label: "My Content",
    items: [
      {
        label: "Home",
        href: "/",
        icon: HouseIcon,
      },
      {
        label: "Profile",
        href: "/profile/me",
        icon: UserIcon,
        exact: true,
      },
      {
        label: "Friends",
        href: "/profile/me/friends",
        icon: HandshakeIcon,
      },
    ],
  },
  {
    label: "Chess",
    items: [
      {
        label: "Play Now",
        href: "/play",
        icon: ZapIcon,
      },
      {
        label: "Ranking",
        href: "/ranking",
        icon: TrophyIcon,
      },
    ],
  },
];

export function naturalCap(s: string) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase();
}

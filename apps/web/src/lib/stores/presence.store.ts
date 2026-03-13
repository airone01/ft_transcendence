import { type Writable, writable } from "svelte/store";
import { socketManager } from "$lib/stores/socket.svelte";

// map tracking userId to status
export const onlineUsersStore: Writable<Map<string, string>> = writable(
  new Map(),
);

export function setupPresenceListeners() {
  socketManager.on("presence:list", ((
    onlineList: { userId: string; status: "online" | "offline" | "ingame" }[],
  ) => {
    onlineUsersStore.update((map) => {
      const newMap = new Map(map);
      onlineList.forEach((u) => {
        newMap.set(u.userId, u.status);
      });
      return newMap;
    });
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("presence:online", ((data: { userId: string }) => {
    onlineUsersStore.update((map) => {
      map.set(data.userId, "online");
      return new Map(map); // trigger reactivity
    });
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("presence:offline", ((data: { userId: string }) => {
    onlineUsersStore.update((map) => {
      map.delete(data.userId);
      return new Map(map);
    });
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("presence:status", ((data: {
    userId: string;
    status: string;
  }) => {
    onlineUsersStore.update((map) => {
      map.set(data.userId, data.status === "away" ? "online" : data.status);
      return new Map(map);
    });
  }) as unknown as (...args: unknown[]) => void);
}

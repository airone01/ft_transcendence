// À appeler une seule fois au démarrage de l'app (dans +layout.svelte)

import { setupChatListeners } from "$lib/stores/chat.store";
import { setupGameListeners } from "$lib/stores/game.store";
import { setupMatchmakingListeners } from "$lib/stores/matchmaking.store";
import { setupPresenceListeners } from "$lib/stores/presence.store";

let initialized = false;

export function initializeSocketListeners() {
  if (initialized) return;

  setupGameListeners();
  setupMatchmakingListeners();
  setupChatListeners();
  setupPresenceListeners();

  initialized = true;
  console.log("Socket listeners initialized");
}

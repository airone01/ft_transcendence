// À appeler une seule fois au démarrage de l'app (dans +layout.svelte)

import { setupChatListeners } from "../../stores/chat.store";
import { setupGameListeners } from "../../stores/game.store";
import { setupMatchmakingListeners } from "../../stores/matchmaking.store";

let initialized = false;

export function initializeSocketListeners() {
  if (initialized) return;

  setupGameListeners();
  setupMatchmakingListeners();
  setupChatListeners();

  initialized = true;
  console.log("Socket listeners initialized");
}

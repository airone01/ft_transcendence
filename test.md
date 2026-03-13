# 📡 Documentation Socket.IO - Guide Front-End
## ft_transcendence - Équipe Front-End

---

## 📚 Table des matières

1. [Installation & Setup](#installation--setup)
2. [Architecture des fichiers](#architecture-des-fichiers)
3. [Connexion Socket.IO](#connexion-socketio)
4. [Game Store - Partie d'échecs](#game-store---partie-déchecs)
5. [Matchmaking Store - File d'attente](#matchmaking-store---file-dattente)
6. [Chat Store - Messagerie](#chat-store---messagerie)
7. [Exemples complets](#exemples-complets)
8. [Événements serveur](#événements-serveur)
9. [Gestion des erreurs](#gestion-des-erreurs)
10. [Testing & Debug](#testing--debug)

---

## 📥 Installation & Setup

### 1. Initialiser les listeners Socket.IO

**Dans votre `src/routes/+layout.svelte` :**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeSocketListeners } from '$lib/socket-init';

  onMount(() => {
    // ⚠️ IMPORTANT : À appeler UNE SEULE FOIS au démarrage de l'app
    initializeSocketListeners();
  });
</script>

<slot />
```

### 2. Vérifier la connexion

La connexion Socket.IO se fait automatiquement si le cookie `session_token` est présent.

---

## 📁 Architecture des fichiers

Voici où se trouvent les fichiers Socket.IO dans le projet :

```
apps/web/src/lib/
├── socket.svelte.ts                    ← Connexion Socket.IO de base
├── socket-init.ts                      ← Initialisation des listeners
└── stores/
    ├── game.store.ts                   ← Gestion des parties d'échecs
    ├── matchmaking.store.ts            ← File d'attente matchmaking
    └── chat.store.ts                   ← Chat global & in-game

apps/web/src/lib/server/socket/
├── index.ts                            ← Point d'entrée serveur
├── handlers/                           ← Handlers des événements
│   ├── game.ts
│   ├── chat.ts
│   ├── matchmaking.ts
│   └── presence.ts
├── rooms/
│   └── GameRoom.ts                     ← Logique métier des parties
└── middleware/
    ├── auth.ts                         ← Auth JWT
    └── rateLimit.ts                    ← Rate limiting
```

---

## 🔌 Connexion Socket.IO

### Imports disponibles

```typescript
import { 
  socketManager,       // Instance Socket.IO
  socketConnected,     // Store : true si connecté
  socketReconnecting,  // Store : true si reconnexion en cours
  socketError          // Store : message d'erreur ou null
} from '$lib/server/stores/socket.svelte';
```

### Vérifier l'état de la connexion

```svelte
<script lang="ts">
  import { socketConnected, socketReconnecting, socketError } 
    from '$lib/server/stores/socket.svelte';
</script>

<!-- Dans le template -->
{#if $socketConnected}
  <div class="status-connected">✅ Connecté</div>
{:else if $socketReconnecting}
  <div class="status-reconnecting">🔄 Reconnexion...</div>
{:else}
  <div class="status-disconnected">❌ Déconnecté</div>
{/if}

{#if $socketError}
  <div class="error-banner">⚠️ {$socketError}</div>
{/if}
```

### Utilisation manuelle (rare)

```typescript
import { socketManager } from '$lib/server/stores/socket.svelte';

// Émettre un événement personnalisé
socketManager.emit('custom:event', { data: 'value' });

// Écouter un événement personnalisé
socketManager.on('custom:response', (data) => {
  console.log('Received:', data);
});

// Arrêter d'écouter
socketManager.off('custom:response');
```

---

## ♟️ Game Store - Partie d'échecs

### Imports disponibles

```typescript
import { 
  // ─── Stores réactifs ───────────────────────────────────
  gameState,           // État complet de la partie
  isMyTurn,            // Derived store : true si c'est votre tour
  
  // ─── Actions ───────────────────────────────────────────
  joinGame,            // Rejoindre une partie
  makeMove,            // Jouer un coup
  offerDraw,           // Proposer une nulle
  acceptDraw,          // Accepter une nulle
  resign,              // Abandonner
  leaveGame,           // Quitter la partie (sans abandonner)
  
  // ─── Setup (géré automatiquement) ─────────────────────
  setupGameListeners,  // ⚠️ Appelé automatiquement par socket-init.ts
  
  // ─── Types ─────────────────────────────────────────────
  type GameState,
  type GameMove
} from '$lib/stores/game.store';
```

### Type GameState

```typescript
interface GameState {
  gameId: string | null;
  fen: string;                  // Position FEN actuelle
  turn: 'w' | 'b';              // 'w' = blanc, 'b' = noir
  myColor: 'white' | 'black' | null;
  isCheckmate: boolean;
  isDraw: boolean;
  check: boolean;
  gameOver: boolean;
  winner: string | null;
  reason: string | null;        // 'checkmate', 'resignation', 'agreement', etc.
}
```

### Actions disponibles

#### `joinGame(gameId: string)` - Rejoindre une partie

```typescript
import { joinGame } from '$lib/stores/game.store';

// Au chargement de la page de jeu
joinGame('game-123');
```

**Ce que ça fait :**
- Émet `game:join` au serveur
- Le serveur répond avec `game:state` contenant la position actuelle
- Le store `gameState` se met à jour automatiquement

---

#### `makeMove(from: string, to: string, promotion?: string)` - Jouer un coup

```typescript
import { makeMove, isMyTurn, gameState } from '$lib/stores/game.store';

function handleSquareClick(from: string, to: string) {
  // ⚠️ Vérifier que c'est votre tour AVANT d'appeler makeMove
  if (!$isMyTurn) {
    alert('Ce n\'est pas votre tour !');
    return;
  }
  
  // Jouer le coup
  makeMove(from, to);
  
  // Avec promotion (pion arrive en 8ème rangée)
  makeMove('e7', 'e8', 'q');  // Promotion en dame
}
```

**Paramètres :**
- `from` : Case de départ en notation algébrique (`"e2"`, `"g1"`, etc.)
- `to` : Case d'arrivée en notation algébrique (`"e4"`, `"f3"`, etc.)
- `promotion` (optionnel) : `'q'` | `'r'` | `'b'` | `'n'` pour Dame/Tour/Fou/Cavalier

**Ce que ça fait :**
- Émet `game:move` au serveur
- Si le coup est valide, le serveur broadcast `game:move` à tous les joueurs
- Le store `gameState` se met à jour avec la nouvelle position

**Erreurs possibles :**
- Vous recevrez `game:error` si :
  - Ce n'est pas votre tour
  - Le coup est illégal (règles des échecs)
  - La partie est déjà terminée

---

#### `offerDraw()` - Proposer une nulle

```typescript
import { offerDraw, gameState } from '$lib/stores/game.store';

function handleOfferDraw() {
  if ($gameState.gameOver) return;
  offerDraw();
}
```

**Ce que ça fait :**
- Émet `game:offer_draw` au serveur
- L'adversaire reçoit `game:draw_offered` et peut accepter avec `acceptDraw()`

---

#### `acceptDraw()` - Accepter une nulle

```typescript
import { acceptDraw } from '$lib/stores/game.store';

// Quand l'adversaire propose une nulle
socketManager.on('game:draw_offered', (data) => {
  const accept = confirm(`${data.from} propose une nulle. Accepter ?`);
  if (accept) {
    acceptDraw();
  }
});
```

**Ce que ça fait :**
- Émet `game:accept_draw` au serveur
- Le serveur broadcast `game:over` avec `winner: null` et `reason: 'agreement'`
- La partie se termine

---

#### `resign()` - Abandonner la partie

```typescript
import { resign } from '$lib/stores/game.store';

function handleResign() {
  if (confirm('Êtes-vous sûr de vouloir abandonner ?')) {
    resign();
  }
}
```

**Ce que ça fait :**
- Émet `game:resign` au serveur
- Le serveur broadcast `game:over` avec votre adversaire comme gagnant
- La partie se termine

---

#### `leaveGame()` - Quitter la partie (sans abandonner)

```typescript
import { leaveGame } from '$lib/stores/game.store';
import { onDestroy } from 'svelte';

// À appeler quand vous quittez la page
onDestroy(() => {
  leaveGame();
});
```

**Ce que ça fait :**
- Émet `game:leave` au serveur
- Déconnecte votre socket de la room
- ⚠️ **N'abandonne PAS la partie**, juste se déconnecte
- Reset le store `gameState` côté client

---

### Stores réactifs

#### `$gameState` - État complet de la partie

```svelte
<script lang="ts">
  import { gameState } from '$lib/stores/game.store';
</script>

<div class="game-info">
  <p>Game ID: {$gameState.gameId}</p>
  <p>Position FEN: {$gameState.fen}</p>
  <p>Tour: {$gameState.turn === 'w' ? 'Blanc' : 'Noir'}</p>
  <p>Ma couleur: {$gameState.myColor}</p>
  
  {#if $gameState.check}
    <p class="check">⚠️ ÉCHEC !</p>
  {/if}
  
  {#if $gameState.gameOver}
    <div class="game-over">
      <h2>Partie terminée</h2>
      <p>Gagnant: {$gameState.winner || 'Nulle'}</p>
      <p>Raison: {$gameState.reason}</p>
    </div>
  {/if}
</div>
```

---

#### `$isMyTurn` - Dérivé de gameState

```svelte
<script lang="ts">
  import { isMyTurn } from '$lib/stores/game.store';
</script>

{#if $isMyTurn}
  <div class="turn-indicator">🟢 C'est votre tour !</div>
{:else}
  <div class="turn-indicator">⏳ Tour de l'adversaire...</div>
{/if}

<button on:click={handleMove} disabled={!$isMyTurn}>
  Jouer
</button>
```

---

### Exemple complet - Page de jeu

```svelte
<!-- src/routes/game/[id]/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { 
    gameState, 
    isMyTurn, 
    joinGame, 
    makeMove, 
    resign, 
    offerDraw,
    leaveGame 
  } from '$lib/stores/game.store';
  import { socketConnected } from '$lib/server/stores/socket.svelte';

  const gameId = $page.params.id;

  onMount(() => {
    joinGame(gameId);
  });

  onDestroy(() => {
    leaveGame();
  });

  function handleMove(from: string, to: string) {
    if (!$isMyTurn) {
      alert('Ce n\'est pas votre tour !');
      return;
    }
    makeMove(from, to);
  }

  function handleResign() {
    if (confirm('Abandonner la partie ?')) {
      resign();
    }
  }
</script>

<div class="game-page">
  <!-- Status bar -->
  <div class="status">
    {#if !$socketConnected}
      <span class="disconnected">❌ Déconnecté</span>
    {:else if $gameState.gameOver}
      <span>🏁 Partie terminée</span>
    {:else if $isMyTurn}
      <span class="your-turn">🟢 Votre tour</span>
    {:else}
      <span>⏳ Tour adverse</span>
    {/if}
  </div>

  <!-- Board -->
  <div class="board">
    <p>Position: {$gameState.fen}</p>
    
    <!-- Votre composant plateau d'échecs ici -->
    <!-- Exemple simplifié : -->
    <button on:click={() => handleMove('e2', 'e4')} disabled={!$isMyTurn}>
      e2-e4
    </button>
  </div>

  <!-- Controls -->
  <div class="controls">
    <button on:click={offerDraw} disabled={$gameState.gameOver}>
      Proposer nulle
    </button>
    <button on:click={handleResign} disabled={$gameState.gameOver}>
      Abandonner
    </button>
  </div>

  <!-- Game over -->
  {#if $gameState.gameOver}
    <div class="game-over">
      <h2>Partie terminée</h2>
      <p>Gagnant: {$gameState.winner || 'Nulle'}</p>
      <p>Raison: {$gameState.reason}</p>
    </div>
  {/if}
</div>
```

---

## 🎲 Matchmaking Store - File d'attente

### Imports disponibles

```typescript
import { 
  // ─── Store réactif ─────────────────────────────────────
  matchmakingState,          // État de la file d'attente
  
  // ─── Actions ───────────────────────────────────────────
  joinQueue,                 // Rejoindre une file
  leaveQueue,                // Quitter la file
  
  // ─── Setup (géré automatiquement) ─────────────────────
  setupMatchmakingListeners, // ⚠️ Appelé automatiquement
  
  // ─── Types ─────────────────────────────────────────────
  type MatchmakingState
} from '$lib/stores/matchmaking.store';
```

### Type MatchmakingState

```typescript
interface MatchmakingState {
  inQueue: boolean;          // true si en file d'attente
  mode: string | null;       // 'blitz', 'rapid', 'casual' ou null
  position: number | null;   // Position dans la file (1, 2, 3...)
}
```

### Actions disponibles

#### `joinQueue(mode)` - Rejoindre une file

```typescript
import { joinQueue } from '$lib/stores/matchmaking.store';

// Modes disponibles : 'blitz' | 'rapid' | 'casual'
joinQueue('blitz');   // 5 minutes + 2 sec/coup
joinQueue('rapid');   // 15 minutes + 10 sec/coup
joinQueue('casual');  // 10 minutes + 5 sec/coup
```

**Ce que ça fait :**
- Émet `matchmaking:join` au serveur
- Vous entrez dans la file d'attente
- Le serveur répond avec `matchmaking:waiting` contenant votre position
- Quand un adversaire est trouvé, vous recevez `matchmaking:matched` avec le `gameId`
- **Redirection automatique** vers `/game/{gameId}` (géré dans le store)

---

#### `leaveQueue(mode)` - Quitter la file

```typescript
import { leaveQueue, matchmakingState } from '$lib/stores/matchmaking.store';

function handleCancelQueue() {
  if ($matchmakingState.mode) {
    leaveQueue($matchmakingState.mode);
  }
}
```

**Ce que ça fait :**
- Émet `matchmaking:leave` au serveur
- Vous sortez de la file d'attente
- Le store `matchmakingState` se reset

---

### Exemple complet - Page matchmaking

```svelte
<!-- src/routes/play/+page.svelte -->
<script lang="ts">
  import { matchmakingState, joinQueue, leaveQueue } 
    from '$lib/stores/matchmaking.store';

  function handleJoinBlitz() {
    joinQueue('blitz');
  }

  function handleJoinRapid() {
    joinQueue('rapid');
  }

  function handleJoinCasual() {
    joinQueue('casual');
  }

  function handleCancelQueue() {
    if ($matchmakingState.mode) {
      leaveQueue($matchmakingState.mode);
    }
  }
</script>

<div class="matchmaking-page">
  <h1>Jouer une partie</h1>

  {#if $matchmakingState.inQueue}
    <!-- En file d'attente -->
    <div class="queue-status">
      <div class="spinner">🔄</div>
      <p>Recherche d'un adversaire en mode {$matchmakingState.mode}...</p>
      
      {#if $matchmakingState.position}
        <p>Position dans la file : {$matchmakingState.position}</p>
      {/if}
      
      <button on:click={handleCancelQueue} class="cancel-btn">
        Annuler
      </button>
    </div>
  {:else}
    <!-- Sélection du mode -->
    <div class="mode-selection">
      <button on:click={handleJoinBlitz} class="mode-btn blitz">
        <h3>⚡ Blitz</h3>
        <p>5 minutes + 2 sec/coup</p>
      </button>

      <button on:click={handleJoinRapid} class="mode-btn rapid">
        <h3>🏃 Rapide</h3>
        <p>15 minutes + 10 sec/coup</p>
      </button>

      <button on:click={handleJoinCasual} class="mode-btn casual">
        <h3>🎯 Casual</h3>
        <p>10 minutes + 5 sec/coup</p>
      </button>
    </div>
  {/if}
</div>

<style>
  .queue-status {
    text-align: center;
    padding: 2rem;
  }
  .spinner {
    font-size: 3rem;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .mode-selection {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  .mode-btn {
    padding: 2rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .mode-btn:hover {
    border-color: #0066ff;
    transform: translateY(-2px);
  }
</style>
```

---

## 💬 Chat Store - Messagerie

### Imports disponibles

```typescript
import { 
  // ─── Stores réactifs ───────────────────────────────────
  globalMessages,          // Messages du chat global
  gameMessages,            // Messages du chat in-game
  
  // ─── Actions ───────────────────────────────────────────
  sendGlobalMessage,       // Envoyer message global
  sendGameMessage,         // Envoyer message in-game
  clearGlobalMessages,     // Vider chat global
  clearGameMessages,       // Vider chat in-game
  
  // ─── Setup (géré automatiquement) ─────────────────────
  setupChatListeners,      // ⚠️ Appelé automatiquement
  
  // ─── Types ─────────────────────────────────────────────
  type ChatMessage
} from '$lib/stores/chat.store';
```

### Type ChatMessage

```typescript
interface ChatMessage {
  userId: string;
  username: string;
  content: string;
  timestamp: string;  // ISO 8601 format
}
```

### Actions disponibles

#### `sendGlobalMessage(content)` - Chat global

```typescript
import { sendGlobalMessage } from '$lib/stores/chat.store';

let messageInput = '';

function handleSend() {
  if (!messageInput.trim()) return;
  sendGlobalMessage(messageInput);
  messageInput = '';
}
```

**Ce que ça fait :**
- Émet `chat:global` au serveur
- Le serveur broadcast le message à **tous** les utilisateurs connectés
- Le message apparaît dans le store `$globalMessages` pour tout le monde

---

#### `sendGameMessage(gameId, content)` - Chat in-game

```typescript
import { sendGameMessage } from '$lib/stores/chat.store';
import { gameState } from '$lib/stores/game.store';

let messageInput = '';

function handleSend() {
  if (!messageInput.trim() || !$gameState.gameId) return;
  sendGameMessage($gameState.gameId, messageInput);
  messageInput = '';
}
```

**Ce que ça fait :**
- Émet `chat:game` au serveur
- Le serveur broadcast le message uniquement aux joueurs/spectateurs de cette partie
- Le message apparaît dans le store `$gameMessages`

---

### Exemple complet - Chat global

```svelte
<!-- src/routes/chat/+page.svelte -->
<script lang="ts">
  import { globalMessages, sendGlobalMessage } 
    from '$lib/stores/chat.store';

  let messageInput = '';

  function handleSend() {
    if (!messageInput.trim()) return;
    sendGlobalMessage(messageInput);
    messageInput = '';
  }
</script>

<div class="chat-container">
  <h2>Chat Global</h2>

  <!-- Messages -->
  <div class="messages">
    {#each $globalMessages as msg}
      <div class="message">
        <strong>{msg.username}:</strong>
        {msg.content}
        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
      </div>
    {/each}
  </div>

  <!-- Input -->
  <form on:submit|preventDefault={handleSend}>
    <input
      type="text"
      bind:value={messageInput}
      placeholder="Tapez un message..."
      maxlength="500"
    />
    <button type="submit">Envoyer</button>
  </form>
</div>

<style>
  .chat-container {
    max-width: 600px;
    margin: 0 auto;
  }
  .messages {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .message {
    margin-bottom: 0.5rem;
  }
  form {
    display: flex;
    gap: 0.5rem;
  }
  input {
    flex: 1;
    padding: 0.5rem;
  }
</style>
```

---

### Exemple complet - Chat in-game

```svelte
<!-- Dans src/routes/game/[id]/+page.svelte -->
<script lang="ts">
  import { gameMessages, sendGameMessage } from '$lib/stores/chat.store';
  import { gameState } from '$lib/stores/game.store';

  let messageInput = '';

  function handleSend() {
    if (!messageInput.trim() || !$gameState.gameId) return;
    sendGameMessage($gameState.gameId, messageInput);
    messageInput = '';
  }
</script>

<div class="game-chat">
  <h3>Chat de la partie</h3>

  <div class="messages">
    {#each $gameMessages as msg}
      <div class="message">
        <strong>{msg.username}:</strong> {msg.content}
        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
      </div>
    {/each}
  </div>

  <form on:submit|preventDefault={handleSend}>
    <input
      type="text"
      bind:value={messageInput}
      placeholder="Message..."
    />
    <button type="submit">→</button>
  </form>
</div>
```

---

## 📨 Événements serveur (reçus automatiquement)

Les événements ci-dessous sont **reçus automatiquement** et mettent à jour les stores. Vous n'avez **pas besoin** de les écouter manuellement.

### Game Events

| Événement | Données | Description |
|-----------|---------|-------------|
| `game:state` | `{ gameId, fen, turn, isCheckmate, isDraw }` | État initial après `joinGame()` |
| `game:move` | `{ from, to, fen, check, checkmate, stalemate }` | Un coup a été joué |
| `game:over` | `{ winner, reason }` | Partie terminée |
| `game:draw_offered` | `{ from: userId }` | Adversaire propose une nulle |
| `player:joined` | `{ userId, username }` | Un joueur a rejoint |
| `game:error` | `{ message }` | Erreur (coup illégal, etc.) |

### Matchmaking Events

| Événement | Données | Description |
|-----------|---------|-------------|
| `matchmaking:waiting` | `{ mode, position }` | En file d'attente |
| `matchmaking:matched` | `{ gameId, color }` | Match trouvé ! |
| `matchmaking:left` | `{ mode }` | Vous avez quitté la file |
| `matchmaking:error` | `{ message }` | Erreur matchmaking |

### Chat Events

| Événement | Données | Description |
|-----------|---------|-------------|
| `chat:global` | `{ userId, username, content, timestamp }` | Message global reçu |
| `chat:game` | `{ userId, username, content, timestamp }` | Message in-game reçu |
| `chat:error` | `{ message }` | Erreur chat |

---

## ⚠️ Gestion des erreurs

### Erreurs communes

```typescript
import { socketManager } from '$lib/server/stores/socket.svelte';

// Écouter les erreurs générales
socketManager.on('error', (data) => {
  console.error('Erreur serveur:', data.message);
  alert('Erreur: ' + data.message);
});

// Écouter le rate limiting
socketManager.on('rate_limit', () => {
  alert('Trop de requêtes, ralentissez !');
});
```

### Messages d'erreur possibles

| Code erreur | Message | Solution |
|-------------|---------|----------|
| `AUTH_REQUIRED` | Authentication required | Cookie `session_token` manquant |
| `INVALID_TOKEN` | Invalid token | Token JWT invalide, se reconnecter |
| `GAME_NOT_FOUND` | Game not found | L'ID de partie n'existe pas |
| `NOT_AUTHORIZED` | Not authorized | Vous n'êtes pas joueur de cette partie |
| `NOT_YOUR_TURN` | Not your turn | Attendez votre tour |
| `ILLEGAL_MOVE` | Illegal move | Coup invalide selon les règles |
| `ALREADY_IN_QUEUE` | Already in queue | Quittez d'abord la file actuelle |
| `EMPTY_MESSAGE` | Empty message | Le message est vide |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | Max 10 événements/seconde |

---

## 🧪 Testing & Debug

### Vérifier la connexion

```svelte
<script lang="ts">
  import { socketConnected, socketError } 
    from '$lib/server/stores/socket.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Socket connected:', $socketConnected);
    console.log('Socket error:', $socketError);
  });
</script>

<div>
  Status: {$socketConnected ? 'Connected ✅' : 'Disconnected ❌'}
</div>
```

### Logs dans la console

Ouvrez la console de votre navigateur (`F12`) :

```
✅ Socket connected
✅ Socket listeners initialized
```

### Test manuel avec curl

```bash
# Tester que le serveur répond
curl http://localhost:3000

# Devrait retourner votre page HTML
```

---

## 📝 Récapitulatif des imports

### Connexion

```typescript
import { 
  socketManager, 
  socketConnected, 
  socketReconnecting, 
  socketError 
} from '$lib/server/stores/socket.svelte';
```

### Game (Partie d'échecs)

```typescript
import { 
  gameState, 
  isMyTurn,
  joinGame, 
  makeMove, 
  offerDraw, 
  acceptDraw, 
  resign, 
  leaveGame 
} from '$lib/stores/game.store';
```

### Matchmaking

```typescript
import { 
  matchmakingState, 
  joinQueue, 
  leaveQueue 
} from '$lib/stores/matchmaking.store';
```

### Chat

```typescript
import { 
  globalMessages, 
  gameMessages,
  sendGlobalMessage, 
  sendGameMessage,
  clearGlobalMessages,
  clearGameMessages
} from '$lib/stores/chat.store';
```

---

## 🎯 Checklist d'intégration

- [ ] ✅ Ajouter `initializeSocketListeners()` dans `+layout.svelte`
- [ ] ✅ Vérifier que le cookie `session_token` est bien présent
- [ ] ✅ Tester la connexion avec `$socketConnected`
- [ ] ✅ Créer une page de jeu avec `joinGame()` et `makeMove()`
- [ ] ✅ Créer une page matchmaking avec `joinQueue()`
- [ ] ✅ Ajouter un chat avec `sendGlobalMessage()`
- [ ] ✅ Gérer les erreurs avec `$socketError`
- [ ] ✅ Tester la reconnexion automatique
- [ ] ✅ Nettoyer les listeners avec `onDestroy(() => leaveGame())`

---

## 📞 Support

**Questions ?** Contactez l'équipe Socket :
- **Lead** : @tortue
- **Channel** : `#socket-team`
- **Docs serveur** : `apps/web/src/lib/server/socket/`

---

**Bonne intégration ! 🚀**
<script lang="ts">
import { RotateCcwIcon, ClockIcon } from "@lucide/svelte";
import { Separator } from "@transc/ui/separator";
import Board from "./board.svelte";
</script>

<main class="h-full flex items-center justify-center gap-6 p-6">
  <!-- Left Panel: Partie en cours -->
  <div class="w-72 shrink-0 h-[800px] flex flex-col border rounded-lg p-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Partie en cours</h2>
      <button class="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
        <RotateCcwIcon class="w-4 h-4" />
      </button>
    </div>

    <Separator class="my-4" />

    <!-- Tour actuel -->
    <div class="space-y-1">
      <span class="text-sm text-muted-foreground">Tour actuel</span>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-white border border-zinc-300"></div>
        <span class="font-medium text-sm">Blancs</span>
      </div>
    </div>

    <Separator class="my-4" />

    <!-- Captured pieces -->
    <div class="space-y-3">
      <!-- Noirs -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
          <span class="text-sm font-medium">Noirs</span>
        </div>
        <div class="bg-primary/15 text-primary text-xs font-medium px-3 py-1.5 rounded-md">
          Aucune prise
        </div>
      </div>

      <!-- Blancs -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-white border border-zinc-300"></div>
          <span class="text-sm font-medium">Blancs</span>
        </div>
        <div class="bg-primary/15 text-primary text-xs font-medium px-3 py-1.5 rounded-md">
          Aucune prise
        </div>
      </div>
    </div>

    <Separator class="my-4" />

    <!-- Instructions -->
    <div class="text-xs text-muted-foreground space-y-1 mt-auto">
      <p>&bull; Cliquez sur une pi&egrave;ce pour voir ses mouvements</p>
      <p>&bull; S&eacute;lectionnez une case pour d&eacute;placer</p>
    </div>
  </div>

  <!-- Center: Board -->
  <div class="flex-1 max-w-[800px] min-w-[400px]">
    <Board />
  </div>

  <!-- Right Panel: Historique -->
  <div class="w-72 shrink-0 h-[800px] flex flex-col border rounded-lg p-5">
    <!-- Header -->
    <h2 class="text-lg font-semibold">Historique</h2>

    <!-- Move history -->
    <div class="flex-1 mt-4 rounded-lg bg-muted/50 flex items-center justify-center min-h-0">
      <span class="text-sm text-muted-foreground">Aucun coup pour le moment</span>
    </div>

    <!-- Timers -->
    <div class="grid grid-cols-2 gap-2 mt-4">
      <div class="flex items-center gap-2 bg-zinc-800 dark:bg-zinc-900 text-white rounded-lg px-3 py-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-white"></div>
          <span class="text-xs font-medium">Blancs</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <ClockIcon class="w-3.5 h-3.5 opacity-70" />
          <span class="text-sm font-mono font-semibold">10:00</span>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-zinc-800 dark:bg-zinc-900 text-white rounded-lg px-3 py-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-zinc-400"></div>
          <span class="text-xs font-medium">Noirs</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <ClockIcon class="w-3.5 h-3.5 opacity-70" />
          <span class="text-sm font-mono font-semibold">10:00</span>
        </div>
      </div>
    </div>
  </div>
</main>

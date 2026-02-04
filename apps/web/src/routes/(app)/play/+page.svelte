<script lang="ts">
import { Button } from "@transc/ui/components/ui/button/index.ts";
import { Root as CardRoot, Header as CardHeader, Title as CardTitle, Description as CardDescription, Content as CardContent } from "@transc/ui/components/ui/card/index.ts";
import IconPawn from "virtual:icons/tabler/chess-filled";
import IconBishop from "virtual:icons/tabler/chess-bishop-filled";
import IconKing from "virtual:icons/tabler/chess-king-filled";
import IconQueen from "virtual:icons/tabler/chess-queen-filled";
import IconKnight from "virtual:icons/tabler/chess-knight-filled";
import IconRook from "virtual:icons/tabler/chess-rook-filled";
</script>

<main class="h-full flex flex-col justify-center items-center">
  <div class="w-full flex justify-center items-center gap-2">
    <CardRoot class="w-full max-w-3xs h-96">
      <CardHeader>
        <CardTitle>Currently playing</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>Hello, world</CardContent>
    </CardRoot>
  
    <section id="board" class="container max-w-lg">
      <div class="grid grid-cols-8 grid-rows-8 aspect-square w-full border">
        {#each {length: 8}, row}
          {#each {length: 8}, col}
            <div class={(row%2 ^ col%2) ? 'bg-primary' : 'bg-secondary'}></div>
          {/each}
        {/each}
      </div>
    </section>
  
    <CardRoot class="w-full max-w-3xs h-96">
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>Hello, world</CardContent>
    </CardRoot>
  </div>
</main>

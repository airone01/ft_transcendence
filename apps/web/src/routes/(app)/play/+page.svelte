<script lang="ts">
import { Button } from "@transc/ui/components/ui/button/index.ts";
import {
  Content as CardContent,
  Description as CardDescription,
  Header as CardHeader,
  Root as CardRoot,
  Title as CardTitle,
} from "@transc/ui/components/ui/card/index.ts";

import Board from "./board.svelte";
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
  
    <Board />
  
    <CardRoot class="w-full max-w-3xs h-96">
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>Hello, world</CardContent>
    </CardRoot>
  </div>
</main>

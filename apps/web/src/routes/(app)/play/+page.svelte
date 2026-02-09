<script lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";

import Board from "./board.svelte";
</script>

<main class="h-full flex flex-col justify-center items-center">
  <div class="w-full flex justify-center items-center gap-2">
    <Card class="w-full max-w-3xs h-96">
      <CardHeader>
        <CardTitle>Currently playing</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>Hello, world</CardContent>
    </Card>
  
    <Board />
  
    <Card class="w-full max-w-3xs h-96">
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>Hello, world</CardContent>
    </Card>
  </div>
</main>

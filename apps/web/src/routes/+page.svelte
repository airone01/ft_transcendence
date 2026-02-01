<script lang="ts">
import { Button } from "@transc/ui/components/ui/button/index.ts";
</script>

<div class="min-h-full flex flex-col">
  <div class="h-8 border-b"></div>
  <div class="flex flex-col items-center justify-center pt-4">
    <div class="container border aspect-square">
      <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Title</h1>
      <Button>btn-default</Button>
      <Button variant="secondary">btn-secondary</Button>
      <Button variant="outline">btn-outline</Button>
      <Button variant="destructive">btn-destructive</Button>
    </div>
  </div>
</div>

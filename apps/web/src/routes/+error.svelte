<script lang="ts">
import { BanIcon } from "@lucide/svelte";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@transc/ui/empty";
import { page } from "$app/state";
</script>

<main class="flex justify-center items-center h-full">
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <BanIcon />
      </EmptyMedia>
      <EmptyTitle
        class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      >
        {page.status}
      </EmptyTitle>
      <EmptyDescription
        class="scroll-m-20 text-2xl font-semibold tracking-tight"
      >
        {page.error?.message}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</main>

<script lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import { m } from "$lib/paraglide/messages";

const { children } = $props();
</script>

<main>
  <Card>
    <CardHeader>
      <CardTitle>{m.settings_page_title()}</CardTitle>
      <CardDescription>{m.settings_page_description()}</CardDescription>
    </CardHeader>
    <CardContent>{@render children()}</CardContent>
  </Card>
</main>

<script lang="ts">
import * as Tooltip from "@transc/ui/tooltip";
import { cn, type WithElementRef } from "@transc/ui/utils";
import type { HTMLAttributes } from "svelte/elements";
import {
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
} from "./constants.js";
import { setSidebar } from "./context.svelte.js";

let {
  ref = $bindable(null),
  open = $bindable(true),
  onOpenChange = () => {},
  class: className,
  style,
  children,
  ...restProps
}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = $props();

const sidebar = setSidebar({
  open: () => open,
  setOpen: async (value: boolean) => {
    open = value;
    onOpenChange(value);

    // sidebar state
    // document.cookie will be deprecated
    await cookieStore.set(SIDEBAR_COOKIE_NAME, String(open));
    await cookieStore.set("path", "/");
    await cookieStore.set("max-age", String(SIDEBAR_COOKIE_MAX_AGE));
    // document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  },
});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<Tooltip.Provider delayDuration={0}>
  <div
    data-slot="sidebar-wrapper"
    style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
    class={cn(
			"group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
			className
		)}
    bind:this={ref}
    {...restProps}
  >
    {@render children?.()}
  </div>
</Tooltip.Provider>

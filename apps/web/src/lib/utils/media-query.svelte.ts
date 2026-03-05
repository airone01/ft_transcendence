export function useMediaQuery(query: string) {
  let matches = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    matches = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      matches = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  });

  return {
    get current() {
      return matches;
    },
  };
}

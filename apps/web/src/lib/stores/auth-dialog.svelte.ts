export const authDialogState = $state({
  isOpen: false,
  mode: "login" as "login" | "register",
});

export const openAuthDialog = (mode: "login" | "register" = "login") => {
  authDialogState.mode = mode;
  authDialogState.isOpen = true;
};

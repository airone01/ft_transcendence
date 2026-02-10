export const settingsDialogState = $state({
  isOpen: false,
});

export function openSettingsDialog() {
  settingsDialogState.isOpen = true;
}

export function closeSettingsDialog() {
  settingsDialogState.isOpen = false;
}

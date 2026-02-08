<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@transc/ui/dialog";
  import { Button } from "@transc/ui/button";
  import { Input } from "@transc/ui/input";
  import { Label } from "@transc/ui/label";
  import { KeyRoundIcon } from "@lucide/svelte";
  import { authDialogState } from "$lib/stores/auth-dialog.svelte.js";

  function toggleMode() {
    authDialogState.mode = authDialogState.mode === "login" ? "register" : "login";
  }
</script>

<Dialog bind:open={authDialogState.isOpen}>
  <DialogContent class="sm:max-w-100">
    <DialogHeader>
      <DialogTitle>
        {authDialogState.mode === "login" ? "Welcome Back" : "Create an Account"}
      </DialogTitle>
      <DialogDescription>
        {authDialogState.mode === "login"
          ? "Enter your credentials to sign in."
          : "Enter your details to create a new account."}
      </DialogDescription>
    </DialogHeader>

    {#if authDialogState.mode === "login"}
      <form
        action="/login"
        method="POST"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === 'redirect' || result.type === 'success') {
              authDialogState.isOpen = false;
            }
            await update();
          };
        }}
        class="flex flex-col gap-4 py-4"
      >
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required />
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="***************" required />
        </div>
        <Button type="submit" class="w-full">Login</Button>
      </form>
    {:else}
      <form
        action="/register"
        method="POST"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === 'redirect' || result.type === 'success') {
              authDialogState.isOpen = false;
            }
            await update();
          };
        }}
        class="flex flex-col gap-4 py-4"
      >
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input id="username" name="username" type="text" placeholder="Username" required />
        </div>
        <div class="grid gap-2">
          <Label for="reg-email">Email</Label>
          <Input id="reg-email" name="email" type="email" placeholder="name@example.com" required />
        </div>
        <div class="grid gap-2">
          <Label for="reg-password">Password</Label>
          <Input id="reg-password" name="password" type="password" placeholder="***************" required />
        </div>
        <Button type="submit" class="w-full">Register</Button>
      </form>
    {/if}

    <div class="flex flex-col gap-3">
      <div class="relative">
        <div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button href="/login/discord" variant="outline" class="w-full gap-2">
        <KeyRoundIcon class="h-4 w-4" />
        {authDialogState.mode === "login" ? "Login" : "Sign up"} with Discord
      </Button>

      <div class="text-center text-sm text-muted-foreground mt-2">
        {authDialogState.mode === "login" ? "Don't have an account?" : "Already have an account?"}
        <button onclick={toggleMode} class="underline underline-offset-4 hover:text-primary ml-1 font-medium">
          {authDialogState.mode === "login" ? "Sign up" : "Login"}
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>

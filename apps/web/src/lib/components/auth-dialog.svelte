<script lang="ts">
import { KeyRoundIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@transc/ui/dialog";
import { Input } from "@transc/ui/input";
import { FormFieldErrors, FormField, FormLabel, FormControl } from "@transc/ui/form";
import { authDialogState } from "$lib/stores/auth-dialog.svelte.js";
import { loginSchema, registerSchema } from "$lib/schemas/auth";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner";
import { page } from "$app/state";

const loginForm = superForm(page.data.loginForm, {
  validators: zodClient(loginSchema),
  onResult: ({ result }) => {
    if (result.type === "redirect" || result.type === "success") {
      toast.success("Welcome back!" /* i18n */);
      authDialogState.isOpen = false;
    }
  }
});

const registerForm = superForm(page.data.registerForm, {
  validators: zodClient(registerSchema),
  onResult: ({ result }) => {
    if (result.type === "redirect" || result.type === "success") {
      toast.success("Account created successfully. Welcome!" /* i18n */);
      authDialogState.isOpen = false;
    }
  }
});

// extract form data :-)
const { form: loginData, enhance: loginEnhance, message: loginMsg } = loginForm;
const { form: registerData, enhance: registerEnhance, message: registerMsg } = registerForm;

function toggleMode() {
  authDialogState.mode =
    authDialogState.mode === "login" ? "register" : "login";
}
</script>

<Dialog bind:open={authDialogState.isOpen}>
  <DialogContent class="sm:max-w-100">
    <DialogHeader>
      <DialogTitle>
        {authDialogState.mode === "login" ? "Welcome Back" : "Create an Account" /* i18n */}
      </DialogTitle>
      <DialogDescription>
        {authDialogState.mode === "login"
          ? "Enter your credentials to sign in."
          : "Enter your details to create a new account."}
      </DialogDescription>
    </DialogHeader>

    {#if authDialogState.mode === "login"}
      <form action="/login" method="POST" use:loginEnhance class="space-y-4 py-2">
        {#if $loginMsg}
          <div class="text-sm font-medium text-destructive text-center">{$loginMsg}</div>
        {/if}

        <FormField form={loginForm} name="email">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Email<!-- i18n --></FormLabel>
              <Input {...props} type="email" bind:value={$loginData.email} placeholder="name@example.com" />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <FormField form={loginForm} name="password">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Password<!-- i18n --></FormLabel>
              <Input {...props} type="password" bind:value={$loginData.password} placeholder="••••••••" />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <Button type="submit" class="w-full">Login</Button>
      </form>
    {:else}
      <form action="/register" method="POST" use:registerEnhance class="space-y-4 py-2">
        {#if $registerMsg}
          <div class="text-sm font-medium text-destructive text-center">{$registerMsg}</div>
        {/if}

        <FormField form={registerForm} name="username">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Username<!-- i18n --></FormLabel>
              <Input {...props} bind:value={$registerData.username} placeholder="johndoe" /><!-- i18n (johndoe) -->
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <FormField form={registerForm} name="email">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Email<!-- i18n --></FormLabel>
              <Input {...props} type="email" bind:value={$registerData.email} placeholder="name@example.com" />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <FormField form={registerForm} name="password">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Password<!-- i18n --></FormLabel>
              <Input {...props} type="password" bind:value={$registerData.password} placeholder="••••••••" />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <FormField form={registerForm} name="confirm-password">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Confirm password<!-- i18n --></FormLabel>
              <Input {...props} type="password" bind:value={$registerData.confirmPassword} placeholder="••••••••" />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <Button type="submit" class="w-full cursor-pointer">Create Account</Button>
      </form>
    {/if}

    <div class="flex flex-col gap-3 mt-2">
      <div class="relative">
        <div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Or continue with<!-- i18n --></span>
        </div>
      </div>

      <Button href="/login/discord" variant="outline" class="w-full gap-2">
        <KeyRoundIcon class="h-4 w-4" />
        Discord<!-- i18n -->
      </Button>

      <div class="text-center text-sm text-muted-foreground mt-2">
        {authDialogState.mode === "login" ? "Don't have an account?" : "Already have an account?" /* i18n */}
        <button onclick={toggleMode} class="underline underline-offset-4 hover:text-primary ml-1 font-medium cursor-pointer">
          {authDialogState.mode === "login" ? "Sign up" : "Login" /* i18n */}
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>

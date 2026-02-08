<script lang="ts">
import { enhance } from "$app/forms";
import { Button } from "@transc/ui/components/ui/button/index.ts";
import { Input } from "@transc/ui/components/ui/input/index.ts";
import { Label } from "@transc/ui/components/ui/label/index.ts";
import { CardAction, CardContent, CardHeader, Card, CardTitle, CardFooter, CardDescription } from "@transc/ui/components/ui/card/index.ts";
import { KeyRoundIcon } from "@lucide/svelte";
import { Separator } from "@transc/ui/components/ui/separator/index.ts";

const { form } = $props();
</script>

<main class="h-full w-full flex justify-center items-center">
  <Card class="-my-4 w-full max-w-sm">
    <CardHeader>
      <CardTitle>Login to your account</CardTitle>
      <CardDescription class={form?.message && "text-destructive"}>{form?.message ?? "Log in to your account to play chess against your friends!"}</CardDescription>
      <CardAction>
        <Button variant="link" href="/register">Sign up</Button>
      </CardAction>
    </CardHeader>

    <CardContent>
      <form id="login-form" method="POST" use:enhance class="flex flex-col gap-6">
        <div class="grid gap-2">
          <Label for="in-email">Email</Label>
          <Input id="in-email" name="email" type="email" placeholder="myemail@example.org" required />
        </div>

        <div class="grid gap-2">
          <Label for="in-passw">Password</Label>
          <Input id="in-passw" name="password" type="password" placeholder="@JohnDoe123" required />
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex flex-col">
      <Button type="submit" form="login-form" class="w-full cursor-pointer">Login</Button>
      <Separator class="my-2 -w-2" />
      <Button href="/login/discord" class="w-full cursor-pointer" variant="discord"><KeyRoundIcon /> Login with Discord</Button>
    </CardFooter>
  </Card>
</main>

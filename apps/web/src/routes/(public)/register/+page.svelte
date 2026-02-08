<script lang="ts">
import { enhance } from "$app/forms";
import { Button } from "@transc/ui/components/ui/button/index.ts";
import { Input } from "@transc/ui/components/ui/input/index.ts";
import { Label } from "@transc/ui/components/ui/label/index.ts";
import { CardAction, CardContent, CardHeader, Card, CardTitle, CardFooter, CardDescription } from "@transc/ui/components/ui/card/index.ts";
import { KeyRoundIcon } from "@lucide/svelte";
import { Separator } from "@transc/ui/components/ui/sidebar/index.ts";

const { form } = $props();
</script>

<main class="h-full w-full flex justify-center items-center">
  <Card class="-my-4 w-full max-w-sm">
    <CardHeader>
      <CardTitle>Register an account</CardTitle>
      <CardDescription class={form?.message && "text-destructive"}>{form?.message ?? "Register an account to play chess against your friends!"}</CardDescription>
      <CardAction>
        <Button href="/login" variant="link">Login</Button>
      </CardAction>
    </CardHeader>

    <CardContent>
      <form id="login-form" method="POST" use:enhance class="flex flex-col gap-6 *:grid *:gap-1">
        <div>
          <Label for="in-user">Username</Label>
          <Input id="in-user" name="username" type="text" placeholder="John Doe" required />
        </div>

        <div>
          <Label for="in-email">Email</Label>
          <Input id="in-email" name="email" type="email" placeholder="myemail@example.org" required />
        </div>

        <div>
          <Label for="in-passw">Password</Label>
          <Input id="in-passw" name="password" type="password" placeholder="@JohnDoe123" required />
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex flex-col">
      <Button type="submit" form="login-form" class="w-full cursor-pointer">Register</Button>
      <Separator class="my-2 -w-2" />
      <Button href="/login/discord" class="w-full cursor-pointer" variant="discord"><KeyRoundIcon /> Register with Discord</Button>
    </CardFooter>
  </Card>
</main>

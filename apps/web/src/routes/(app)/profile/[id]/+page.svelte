<script lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@transc/ui/avatar';
import { Card, CardTitle, CardHeader, CardDescription } from '@transc/ui/card';
import { Skeleton } from "@transc/ui/skeleton";
import { TriangleAlert } from '@lucide/svelte';

let { data } = $props();
</script>

<main class="flex flex-col justify-center items-center p-4">

  {#await data.userPromise}

    <Card class="w-87.5">
      <CardHeader class="flex flex-row items-center gap-4">
        <Skeleton class="h-16 w-16 rounded-full" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-50" />
          <Skeleton class="h-4 w-37.5" />
        </div>
      </CardHeader>
    </Card>

  {:then user} 

    <Card class="w-87.5">
      <CardHeader class="flex flex-row items-center gap-4">
        <Avatar class="w-16 h-16 ring ring-primary">
          <AvatarImage src={user.avatar} />
          <AvatarFallback class="text-lg font-bold">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <CardTitle>{user.username}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </CardHeader>
      
      <div class="p-6 pt-0 text-sm text-muted-foreground">
        Member since {new Date(user.createdAt).toLocaleDateString()}
      </div>
    </Card>

  {:catch error}

    <Card class="w-87.5 border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div class="flex items-center gap-2 text-destructive font-bold">
          <TriangleAlert class="h-5 w-5" />
          <CardTitle>Error</CardTitle>
        </div>
        <CardDescription>
          {error.body?.message || "Could not load user profile."}
        </CardDescription>
      </CardHeader>
    </Card>

  {/await}
</main>

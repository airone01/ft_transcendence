<script lang="ts">
import ProfileForm from "$lib/components/profile-form.svelte";

let { data } = $props();
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-medium">Profile</h3>
    <p class="text-sm text-muted-foreground">
      This is how others will see you on the site.
    </p>
  </div>

  <ProfileForm data={data.form} userAvatar={data.user?.avatar ?? null} />
</div>

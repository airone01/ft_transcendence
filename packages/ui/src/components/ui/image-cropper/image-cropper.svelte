<script lang="ts">
import Cropper, { type OnCropCompleteEvent } from "svelte-easy-crop";
import { getCroppedImg } from "../../../canvas";
import { Button } from "../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../dialog";
import { LoaderCircle, Upload, ZoomIn } from "@lucide/svelte";
import { toast } from "svelte-sonner";
import type { Snippet } from "svelte";

let { 
  open = $bindable(false), 
  onCropped,
  children,
}: { 
  open?: boolean; 
  onCropped: (file: File) => void 
  children: Snippet<[]>
} = $props();

let imageSrc: string | null = $state(null);
let crop = $state({ x: 0, y: 0 });
let zoom = $state(1);
let pixelCrop = $state({ x: 0, y: 0, width: 0, height: 0 });
let loading = $state(false);
let fileInput: HTMLInputElement;

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imageSrc = reader.result as string;
      open = true;
    };
    reader.readAsDataURL(file);
  }
}

async function saveCrop() {
  if (!imageSrc || !pixelCrop || pixelCrop.width === 0) {
    console.error("Crop data missing:", pixelCrop);
    toast.error("Please move the image slightly to set the crop.");
    return;
  }

  loading = true;
  try {
    const blob = await getCroppedImg(imageSrc, pixelCrop);
    if (blob) {
      // convert blob to file to satisfy interface
      const file = new File([blob], "avatar.webp", { type: "image/webp" });
      onCropped(file);
      open = false;
      // reset
      imageSrc = null;
      zoom = 1;
    }
  } catch (e) {
    console.error(e);
    toast.error("Failed to crop image" /* i18n */);
  } finally {
    loading = false;
  }
}

function triggerFileInput() {
  fileInput.click();
}
</script>

<input
  type="file"
  accept="image/*"
  class="hidden"
  bind:this={fileInput}
  onchange={onFileSelected}
/>

<div onclick={triggerFileInput} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}>
  {#if children}
    {@render children()}
  {:else}
    <Button variant="outline">
      <Upload class="mr-2 h-4 w-4" /> Upload Image<!-- i18n -->
    </Button>
  {/if}
</div>

<Dialog bind:open>
  <DialogContent class="sm:max-w-125">
    <DialogHeader>
      <DialogTitle>Edit Avatar<!-- i18n --></DialogTitle>
    </DialogHeader>
    
    <div class="relative w-full h-100 bg-black/5 rounded-md overflow-hidden">
      {#if imageSrc}
        <Cropper
          image={imageSrc}
          bind:crop
          bind:zoom
          aspect={1}
          showGrid={true}
          oncropcomplete={(e: OnCropCompleteEvent) => {
            pixelCrop = e.pixels;
          }}
        />
      {/if}
    </div>

    <div class="flex items-center gap-4 py-2">
      <ZoomIn class="h-4 w-4 text-muted-foreground" />
      <input 
        type="range" 
        min="1" 
        max="3" 
        step="0.1" 
        bind:value={zoom} 
        class="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
      />
    </div>

    <DialogFooter>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={saveCrop} disabled={loading}>
        {#if loading}
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Save Changes<!-- i18n -->
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog> 

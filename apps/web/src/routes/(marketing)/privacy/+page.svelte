<script lang="ts">
import {
  CheckCircle2,
  Database,
  Edit,
  Eye,
  Gamepad2,
  Lock,
  Mail,
  MessageSquare,
  Package,
  Share2,
  Shield,
  Trash2,
  User,
} from "@lucide/svelte";
import { m } from "$lib/paraglide/messages";
</script>

<svelte:head>
  <title>{m.privacy_page_title()}</title>
  <meta name="description" content={m.privacy_page_hero_subtitle()}>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
  <!-- Hero Section -->
  <div
    class="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b"
  >
    <div class="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      <div class="text-center space-y-4">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
        >
          <Shield class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
          {m.privacy_page_title()}
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          {m.privacy_page_hero_subtitle()}
        </p>
        <p class="text-sm text-muted-foreground">
          {m.legal_last_updated()}
          <time datetime={new Date().toISOString()}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </p>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-4xl mx-auto px-6 py-12 sm:py-16">
    <div class="prose prose-zinc dark:prose-invert max-w-none">
      <!-- Quick Summary -->
      <div class="not-prose bg-card border rounded-lg p-6 mb-12 shadow-sm">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5 text-primary" />
          {m.privacy_page_tldr_title()}
        </h2>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{m.privacy_page_tldr_1()}</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{m.privacy_page_tldr_2()}</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{m.privacy_page_tldr_3()}</span>
          </li>
        </ul>
      </div>

      <!-- Section 1 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b">
          {m.privacy_page_section_1_title()}
        </h2>

        <div class="space-y-6">
          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-primary">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <User class="w-5 h-5 text-primary" />
              {m.privacy_page_section_1_1_title()}
            </h3>
            <p class="text-muted-foreground mb-3">
              {m.privacy_page_section_1_1_desc()}
            </p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {m.privacy_page_section_1_1_item_1()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {m.privacy_page_section_1_1_item_2()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {m.privacy_page_section_1_1_item_3()}
              </li>
            </ul>
          </div>

          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-blue-500">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <Gamepad2 class="w-5 h-5 text-blue-500" />
              {m.privacy_page_section_1_2_title()}
            </h3>
            <p class="text-muted-foreground mb-3">
              {m.privacy_page_section_1_2_desc()}
            </p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {m.privacy_page_section_1_2_item_1()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {m.privacy_page_section_1_2_item_2()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {m.privacy_page_section_1_2_item_3()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {m.privacy_page_section_1_2_item_4()}
              </li>
            </ul>
          </div>

          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-green-500">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <MessageSquare class="w-5 h-5 text-green-500" />
              {m.privacy_page_section_1_3_title()}
            </h3>
            <p class="text-muted-foreground text-sm">
              {m.privacy_page_section_1_3_desc()}
            </p>
          </div>

          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-amber-500">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <Database class="w-5 h-5 text-amber-500" />
              {m.privacy_page_section_1_4_title()}
            </h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {m.privacy_page_section_1_4_item_1()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {m.privacy_page_section_1_4_item_2()}
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {m.privacy_page_section_1_4_item_3()}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Section 2 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b">
          {m.privacy_page_section_2_title()}
        </h2>
        <div class="grid sm:grid-cols-2 gap-4 mt-6">
          <div
            class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-3 mb-2">
              <Gamepad2 class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">
                {m.privacy_page_section_2_card_1_title()}
              </h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.privacy_page_section_2_card_1_desc()}
            </p>
          </div>
          <div
            class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-3 mb-2">
              <Database class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">
                {m.privacy_page_section_2_card_2_title()}
              </h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.privacy_page_section_2_card_2_desc()}
            </p>
          </div>
          <div
            class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-3 mb-2">
              <Lock class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">
                {m.privacy_page_section_2_card_3_title()}
              </h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.privacy_page_section_2_card_3_desc()}
            </p>
          </div>
          <div
            class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-3 mb-2">
              <MessageSquare class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">
                {m.privacy_page_section_2_card_4_title()}
              </h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.privacy_page_section_2_card_4_desc()}
            </p>
          </div>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="mb-12">
        <h2
          class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2"
        >
          <Share2 class="w-6 h-6" />
          {m.privacy_page_section_3_title()}
        </h2>
        <div
          class="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 mb-6"
        >
          <p class="font-semibold text-lg mb-2 flex items-center gap-2">
            <Shield class="w-5 h-5 text-destructive" />
            {m.privacy_page_section_3_no_sell()}
          </p>
          <p class="text-sm text-muted-foreground">
            {m.privacy_page_section_3_no_sell_desc()}
          </p>
        </div>
        <p class="mb-4">{m.privacy_page_section_3_limited_cases()}</p>
        <div class="space-y-3">
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">
                {m.privacy_page_section_3_case_1_title()}
              </p>
              <p class="text-sm text-muted-foreground">
                {m.privacy_page_section_3_case_1_desc()}
              </p>
            </div>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">
                {m.privacy_page_section_3_case_2_title()}
              </p>
              <p class="text-sm text-muted-foreground">
                {m.privacy_page_section_3_case_2_desc()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4 -->
      <section class="mb-12">
        <h2
          class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2"
        >
          <Lock class="w-6 h-6" />
          {m.privacy_page_section_4_title()}
        </h2>
        <div class="grid sm:grid-cols-2 gap-4 mt-6">
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <Database class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">
                  {m.privacy_page_section_4_database()}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {m.privacy_page_section_4_database_desc()}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Shield class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">
                  {m.privacy_page_section_4_sessions()}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {m.privacy_page_section_4_sessions_desc()}
                </p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <Package class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">
                  {m.privacy_page_section_4_storage()}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {m.privacy_page_section_4_storage_desc()}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Database class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">
                  {m.privacy_page_section_4_retention()}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {m.privacy_page_section_4_retention_desc()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5 -->
      <section class="mb-12">
        <div class="bg-primary/10 border border-primary/20 rounded-lg p-5">
          <p class="text-sm flex items-center gap-2">
            <Mail class="w-4 h-4 text-primary" />
            {m.privacy_page_contact_intro()}
            <a
              href="mailto:fake@chess.io"
              class="font-semibold text-primary hover:underline"
            >
              fake@chess.io
            </a>
          </p>
        </div>
      </section>

      <!-- Contact -->
      <section class="bg-card border rounded-lg p-8 text-center">
        <Mail class="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 class="text-2xl font-semibold mb-4">
          {m.privacy_page_contact_questions()}
        </h2>
        <p class="text-muted-foreground mb-6">
          {m.privacy_page_contact_description()}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:fakeprivacy@chess.io"
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Mail class="w-4 h-4" />
            {m.privacy_page_contact_button_email()}
          </a>

          <a
            href="/terms"
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            <Shield class="w-4 h-4" />
            {m.privacy_page_contact_button_terms()}
          </a>
        </div>
      </section>
    </div>
  </div>
</div>

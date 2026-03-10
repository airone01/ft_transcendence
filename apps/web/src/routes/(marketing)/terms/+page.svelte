<script lang="ts">
import * as m from "$lib/paraglide/messages";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  FileText,
  Gamepad2,
  Mail,
  Scale,
  Shield,
  UserCheck,
  X,
} from "@lucide/svelte";
</script>

<svelte:head>
  <title>{m.terms_page_title()}</title>
  <meta name="description" content={m.terms_page_hero_subtitle()} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
  <!-- Hero Section -->
  <div class="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-background border-b">
    <div class="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
          <FileText class="w-8 h-8 text-blue-500" />
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
          {m.terms_page_title()}
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          {m.terms_page_hero_subtitle()}
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

      <!-- Quick Rules -->
      <div class="not-prose bg-card border rounded-lg p-6 mb-12 shadow-sm">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield class="w-5 h-5 text-primary" />
          {m.terms_page_golden_rules_title()}
        </h2>
        <div class="grid sm:grid-cols-2 gap-4 text-sm">
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>{m.terms_page_golden_rule_1()}</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>{m.terms_page_golden_rule_2()}</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>{m.terms_page_golden_rule_3()}</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>{m.terms_page_golden_rule_4()}</span>
          </div>
        </div>
      </div>

      <!-- Section 1 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <FileText class="w-6 h-6" />
          {m.terms_page_section_1_title()}
        </h2>
        <p class="text-muted-foreground">
          {m.terms_page_section_1_desc()}
        </p>
      </section>

      <!-- Section 2 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <UserCheck class="w-6 h-6" />
          {m.terms_page_section_2_title()}
        </h2>
        <div class="space-y-3">
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p class="text-sm">{m.terms_page_section_2_item_1()}</p>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p class="text-sm">{m.terms_page_section_2_item_2()}</p>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p class="text-sm">{m.terms_page_section_2_item_3()}</p>
          </div>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Shield class="w-6 h-6" />
          {m.terms_page_section_3_title()}
        </h2>
        <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-blue-500">
          <p class="mb-3 font-medium">{m.terms_page_section_3_intro()}</p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_3_item_1()}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_3_item_2()}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_3_item_3()}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Section 4 - Acceptable Use -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <AlertTriangle class="w-6 h-6" />
          {m.terms_page_section_4_title()}
        </h2>

        <div class="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 mb-6">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <Ban class="w-5 h-5 text-destructive" />
            {m.terms_page_section_4_not_allowed()}
          </h3>
          <div class="space-y-4 text-sm">
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">{m.terms_page_section_4_cheat_title()}</p>
                <p class="text-muted-foreground">{m.terms_page_section_4_cheat_desc()}</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">{m.terms_page_section_4_abuse_title()}</p>
                <p class="text-muted-foreground">{m.terms_page_section_4_abuse_desc()}</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">{m.terms_page_section_4_exploit_title()}</p>
                <p class="text-muted-foreground">{m.terms_page_section_4_exploit_desc()}</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">{m.terms_page_section_4_spam_title()}</p>
                <p class="text-muted-foreground">{m.terms_page_section_4_spam_desc()}</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">{m.terms_page_section_4_manipulate_title()}</p>
                <p class="text-muted-foreground">{m.terms_page_section_4_manipulate_desc()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5 - Game Rules -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Gamepad2 class="w-6 h-6" />
          {m.terms_page_section_5_title()}
        </h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <Shield class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">{m.terms_page_section_5_fair_play()}</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.terms_page_section_5_fair_play_desc()}
            </p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <Scale class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">{m.terms_page_section_5_elo_system()}</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.terms_page_section_5_elo_system_desc()}
            </p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <Clock class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">{m.terms_page_section_5_time_controls()}</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.terms_page_section_5_time_controls_desc()}
            </p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <AlertTriangle class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">{m.terms_page_section_5_disconnections()}</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {m.terms_page_section_5_disconnections_desc()}
            </p>
          </div>
        </div>
      </section>

      <!-- Section 6 - Termination -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Ban class="w-6 h-6" />
          {m.terms_page_section_6_title()}
        </h2>
        <div class="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5 mb-4">
          <p class="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-amber-500" />
            {m.terms_page_section_6_intro()}
          </p>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_6_item_1()}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_6_item_2()}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_6_item_3()}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>{m.terms_page_section_6_item_4()}</span>
            </li>
          </ul>
        </div>
        <p class="text-sm text-muted-foreground">
          {m.terms_page_section_6_delete()}
        </p>
      </section>

      <!-- Section 7 - Disclaimers -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <AlertTriangle class="w-6 h-6" />
          {m.terms_page_section_7_title()}
        </h2>
        <div class="bg-muted border rounded-lg p-6">
          <p class="font-bold text-center mb-4 uppercase tracking-wide flex items-center justify-center gap-2">
            <Shield class="w-5 h-5" />
            {m.terms_page_section_7_as_is()}
          </p>
          <div class="space-y-2 text-sm">
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{m.terms_page_section_7_item_1()}</span>
            </p>
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{m.terms_page_section_7_item_2()}</span>
            </p>
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{m.terms_page_section_7_item_3()}</span>
            </p>
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{m.terms_page_section_7_item_4()}</span>
            </p>
          </div>
        </div>
      </section>

      <!-- Section 8 - Governing Law -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Scale class="w-6 h-6" />
          {m.terms_page_section_8_title()}
        </h2>
        <p class="text-muted-foreground">
          {m.terms_page_section_8_desc()}
        </p>
      </section>

      <!-- Contact -->
      <section class="bg-gradient-to-r from-primary/10 to-blue-500/10 border rounded-lg p-8 text-center">
        <Mail class="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 class="text-2xl font-semibold mb-4">{m.terms_page_contact_title()}</h2>
        <p class="text-muted-foreground mb-6">
          {m.terms_page_contact_description()}
        </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
            
                <a href="mailto:support@chess.io"
                class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <Mail class="w-4 h-4" />
                {m.terms_page_contact_button_support()}
              </a>


                <a href="/privacy"
                class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors">
                <Shield class="w-4 h-4" />
                {m.terms_page_contact_button_privacy()}
              </a>
            </div>
      </section>

    </div>
  </div>
</div>
<script lang="ts">
import { 
  Shield, 
  AlertTriangle, 
  UserCheck,
  Ban,
  Gamepad2,
  Clock,
  Scale,
  Mail,
  FileText,
  CheckCircle2,
  X
} from "@lucide/svelte";
</script>

<svelte:head>
  <title>Terms of Service - Chess.io</title>
  <meta name="description" content="Read the Terms of Service for using Chess.io" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
  <!-- Hero Section -->
  <div class="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-background border-b">
    <div class="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
          <FileText class="w-8 h-8 text-blue-500" />
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">Terms of Service</h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Fair play, respect, and transparency. Let's keep chess fun for everyone.
        </p>
        <p class="text-sm text-muted-foreground">
          Last updated: <time datetime={new Date().toISOString()}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
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
          The Golden Rules
        </h2>
        <div class="grid sm:grid-cols-2 gap-4 text-sm">
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>Play fair - no cheating or bots</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>Be respectful to other players</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>Report bugs, don't exploit them</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>Have fun and enjoy the game!</span>
          </div>
        </div>
      </div>

      <!-- Section 1 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <FileText class="w-6 h-6" />
          1. Acceptance of Terms
        </h2>
        <p class="text-muted-foreground">
          By accessing and using Chess.io ("the Service"), you agree to be bound by these Terms of Service. 
          If you do not agree, please do not use the Service.
        </p>
      </section>

      <!-- Section 2 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <UserCheck class="w-6 h-6" />
          2. Eligibility
        </h2>
        <div class="space-y-3">
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p class="text-sm">You must be a 42 School student with a valid 42 account</p>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p class="text-sm">You must be at least 18 years old</p>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p class="text-sm">You must not be banned from the Service</p>
          </div>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Shield class="w-6 h-6" />
          3. Account Responsibilities
        </h2>
        <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-blue-500">
          <p class="mb-3 font-medium">You are responsible for:</p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>Maintaining the security of your 42 account credentials</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>All activities that occur under your account</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>Notifying us immediately of any unauthorized access</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Section 4 - Acceptable Use -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <AlertTriangle class="w-6 h-6" />
          4. Acceptable Use Policy
        </h2>
        
        <div class="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 mb-6">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <Ban class="w-5 h-5 text-destructive" />
            You agree NOT to:
          </h3>
          <div class="space-y-4 text-sm">
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">Cheat</p>
                <p class="text-muted-foreground">Use bots, engines, or external assistance during games</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">Abuse</p>
                <p class="text-muted-foreground">Harass, threaten, or abuse other users</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">Exploit</p>
                <p class="text-muted-foreground">Exploit bugs or vulnerabilities for unfair advantage</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">Spam</p>
                <p class="text-muted-foreground">Send unsolicited messages or advertising</p>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <X class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="font-medium">Manipulate Ratings</p>
                <p class="text-muted-foreground">Artificially inflate or deflate ELO ratings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5 - Game Rules -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Gamepad2 class="w-6 h-6" />
          5. Game Rules & Fair Play
        </h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <Shield class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Fair Play</h3>
            </div>
            <p class="text-sm text-muted-foreground">Play your own games without assistance</p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <Scale class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">ELO System</h3>
            </div>
            <p class="text-sm text-muted-foreground">Ratings calculated using standard formulas (K=30)</p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <Clock class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Time Controls</h3>
            </div>
            <p class="text-sm text-muted-foreground">Blitz (5+2), Rapid (15+10), Casual (10+5)</p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <AlertTriangle class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Disconnections</h3>
            </div>
            <p class="text-sm text-muted-foreground">You may lose on time if disconnected</p>
          </div>
        </div>
      </section>

      <!-- Section 6 - Termination -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Ban class="w-6 h-6" />
          6. Termination
        </h2>
        <div class="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5 mb-4">
          <p class="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-amber-500" />
            We may suspend or terminate your account if you:
          </p>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>Violate these Terms of Service</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>Engage in cheating or unfair play</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>Abuse or harass other users</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>Attempt to exploit or hack the Service</span>
            </li>
          </ul>
        </div>
        <p class="text-sm text-muted-foreground">You may delete your account at any time via your profile settings.</p>
      </section>

      <!-- Section 7 - Disclaimers -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <AlertTriangle class="w-6 h-6" />
          7. Disclaimers
        </h2>
        <div class="bg-muted border rounded-lg p-6">
          <p class="font-bold text-center mb-4 uppercase tracking-wide flex items-center justify-center gap-2">
            <Shield class="w-5 h-5" />
            The Service is provided "AS IS" without warranties of any kind.
          </p>
          <div class="space-y-2 text-sm">
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>We do not guarantee uninterrupted or error-free service</span>
            </p>
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>We are not responsible for lost games due to technical issues</span>
            </p>
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>ELO ratings are for entertainment purposes only</span>
            </p>
            <p class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>We are not liable for user-generated content (chat messages)</span>
            </p>
          </div>
        </div>
      </section>

      <!-- Section 8 - Governing Law -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Scale class="w-6 h-6" />
          8. Governing Law
        </h2>
        <p class="text-muted-foreground">
          These Terms are governed by French law. Any disputes will be resolved in Lyon, France.
        </p>
      </section>

      <!-- Contact -->
      <section class="bg-gradient-to-r from-primary/10 to-blue-500/10 border rounded-lg p-8 text-center">
        <Mail class="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 class="text-2xl font-semibold mb-4">Need Help?</h2>
        <p class="text-muted-foreground mb-6">Have questions about our Terms of Service?</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:support@chess.io" class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Mail class="w-4 h-4" />
            Contact Support
          </a>
          <a href="/privacy" class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors">
            <Shield class="w-4 h-4" />
            View Privacy Policy
          </a>
        </div>
      </section>

    </div>
  </div>
</div>
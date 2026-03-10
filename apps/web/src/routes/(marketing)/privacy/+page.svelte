<script lang="ts">
import { 
  CheckCircle2, 
  User, 
  Gamepad2, 
  MessageSquare, 
  Database,
  Shield,
  Share2,
  Lock,
  Eye,
  Trash2,
  Edit,
  Package,
  Mail
} from "@lucide/svelte";
</script>

<svelte:head>
  <title>Privacy Policy - Chess.io</title>
  <meta name="description" content="Learn how Chess.io protects and handles your personal information." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
  <!-- Hero Section -->
  <div class="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
    <div class="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your privacy matters. Here's how we protect and handle your data.
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
      
      <!-- Quick Summary -->
      <div class="not-prose bg-card border rounded-lg p-6 mb-12 shadow-sm">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5 text-primary" />
          TL;DR - Privacy Quick Facts
        </h2>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>We only collect data necessary to provide chess gameplay</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>We never sell your personal information</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>Authentication is handled securely via 42 School OAuth</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>You can delete your account and data at any time</span>
          </li>
        </ul>
      </div>

      <!-- Section 1 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b">1. Information We Collect</h2>
        
        <div class="space-y-6">
          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-primary">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <User class="w-5 h-5 text-primary" />
              1.1 Account Information
            </h3>
            <p class="text-muted-foreground mb-3">When you authenticate via 42 School OAuth, we receive:</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Your 42 username
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Your 42 email address
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Your 42 profile avatar (if available)
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Unique OAuth identifier
              </li>
            </ul>
          </div>

          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-blue-500">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <Gamepad2 class="w-5 h-5 text-blue-500" />
              1.2 Gameplay Data
            </h3>
            <p class="text-muted-foreground mb-3">We automatically collect:</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Chess game moves and results
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                ELO rating history
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Game statistics (wins, losses, draws)
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Game timing and duration
              </li>
            </ul>
          </div>

          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-green-500">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <MessageSquare class="w-5 h-5 text-green-500" />
              1.3 Chat Messages
            </h3>
            <p class="text-muted-foreground text-sm">
              Messages sent in game chat channels and global chat are stored for gameplay continuity.
            </p>
          </div>

          <div class="bg-muted/30 rounded-lg p-5 border-l-4 border-amber-500">
            <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
              <Database class="w-5 h-5 text-amber-500" />
              1.4 Technical Data
            </h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Session cookies for authentication
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                WebSocket connection data
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Browser localStorage (game state only, no personal data)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Section 2 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b">2. How We Use Your Information</h2>
        <div class="grid sm:grid-cols-2 gap-4 mt-6">
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <Gamepad2 class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Provide the Service</h3>
            </div>
            <p class="text-sm text-muted-foreground">Enable gameplay, matchmaking, and real-time features</p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <Database class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Calculate Rankings</h3>
            </div>
            <p class="text-sm text-muted-foreground">Maintain ELO ratings and leaderboards</p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <Lock class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Authentication</h3>
            </div>
            <p class="text-sm text-muted-foreground">Verify your identity via 42 OAuth</p>
          </div>
          <div class="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <MessageSquare class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Communication</h3>
            </div>
            <p class="text-sm text-muted-foreground">Enable chat functionality</p>
          </div>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Share2 class="w-6 h-6" />
          3. Data Sharing
        </h2>
        <div class="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 mb-6">
          <p class="font-semibold text-lg mb-2 flex items-center gap-2">
            <Shield class="w-5 h-5 text-destructive" />
            We do not sell your personal data.
          </p>
          <p class="text-sm text-muted-foreground">Your privacy is not for sale. Period.</p>
        </div>
        <p class="mb-4">Your data is shared only in these limited cases:</p>
        <div class="space-y-3">
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">42 School</p>
              <p class="text-sm text-muted-foreground">We use 42 OAuth for secure authentication</p>
            </div>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">Public Leaderboards</p>
              <p class="text-sm text-muted-foreground">Your username and ELO rating are visible to other users</p>
            </div>
          </div>
          <div class="flex gap-3 items-start">
            <CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">In-Game</p>
              <p class="text-sm text-muted-foreground">Your username is visible to opponents and spectators during games</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
          <Lock class="w-6 h-6" />
          4. Data Storage & Security
        </h2>
        <div class="grid sm:grid-cols-2 gap-4 mt-6">
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <Database class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">Database</h3>
                <p class="text-sm text-muted-foreground">PostgreSQL with encrypted connections</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Shield class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">Sessions</h3>
                <p class="text-sm text-muted-foreground">HTTP-only cookies with secure flags</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <Package class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">Local Storage</h3>
                <p class="text-sm text-muted-foreground">Game state only (no personal data)</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Database class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 class="font-medium text-sm mb-1">Retention</h3>
                <p class="text-sm text-muted-foreground">Data retained until account deletion</p>
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
            To contact us: <a href="mailto:privacy@chess.io" class="font-semibold text-primary hover:underline">privacy@chess.io</a>
          </p>
        </div>
      </section>

      <!-- Contact -->
      <section class="bg-card border rounded-lg p-8 text-center">
        <Mail class="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 class="text-2xl font-semibold mb-4">Questions?</h2>
        <p class="text-muted-foreground mb-6">We're here to help with any privacy concerns.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:privacy@chess.io" class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Mail class="w-4 h-4" />
            Email Privacy Team
          </a>
          <a href="/terms" class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors">
            <Shield class="w-4 h-4" />
            View Terms of Service
          </a>
        </div>
      </section>

    </div>
  </div>
</div>
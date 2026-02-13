<script setup lang="ts">
const chatPreview = [
  { role: 'user', text: 'Hvordan vil AI forbedre norsk skole?' },
  {
    role: 'assistant',
    text: 'Vi foreslår AI-tilpasset undervisning der hver elev får et personlig læringsløp. Eksamen erstattes gradvis med porteføljevurdering…',
  },
  { role: 'user', text: 'Hva med personvern?' },
]
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900 text-white">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Text -->
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-6 backdrop-blur">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            AI-drevet politikk for Norge
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Norge 2040 –<br />
            <span class="text-blue-300">et AI-assistert samfunn</span>
          </h1>

          <p class="mt-6 text-lg sm:text-xl text-blue-100 max-w-xl leading-relaxed">
            Autonomipartiet kombinerer nordisk tillit med kunstig intelligens for å skape
            bedre offentlige tjenester, smartere utdanning og en grønnere fremtid.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <a
              href="#demo"
              class="inline-flex items-center px-6 py-3 rounded-xl bg-white text-brand-800 font-bold text-base hover:bg-blue-50 transition-colors shadow-lg shadow-black/20"
            >
              Start demo
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#politikk"
              class="inline-flex items-center px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Les partiprogram
            </a>
          </div>
        </div>

        <!-- Right: Mini chat preview -->
        <div class="hidden lg:block">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div class="w-3 h-3 rounded-full bg-green-400"></div>
              <span class="ml-2 text-xs text-blue-200">AI-rådgiveren – Demo</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="(msg, i) in chatPreview"
                :key="i"
                :class="[
                  'rounded-xl px-4 py-2.5 text-sm max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-blue-500/30 ml-auto text-right text-blue-100'
                    : 'bg-white/10 text-white',
                ]"
              >
                {{ msg.text }}
              </div>
              <div class="bg-white/10 rounded-xl px-4 py-2.5 text-sm text-blue-200 max-w-[60%] flex items-center gap-2">
                <span class="flex gap-1">
                  <span class="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </span>
                <span>Tenker…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

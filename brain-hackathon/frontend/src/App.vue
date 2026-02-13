<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Hero from '@/components/Hero.vue'
import PolicyCards from '@/components/PolicyCards.vue'
import DemoChat from '@/components/DemoChat.vue'
import SourcesPanel from '@/components/SourcesPanel.vue'
import Avatars from '@/components/Avatars.vue'
import Faq from '@/components/Faq.vue'

const prefillText = ref('')

function handlePrefill(text: string) {
  prefillText.value = text
}

function handlePrefillConsumed() {
  prefillText.value = ''
}
</script>

<template>
  <div class="min-h-screen">
    <Navbar />
    <Hero />
    <PolicyCards @prefill="handlePrefill" />

    <!-- Demo section -->
    <section id="demo" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">Prøv AI-rådgiveren</h2>
          <p class="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Chat med vår AI om politikk, utdanning, klima og mer. Velg modell, persona og kilder.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <DemoChat :prefill-text="prefillText" @prefill-consumed="handlePrefillConsumed" />
          </div>
          <div>
            <SourcesPanel />
          </div>
        </div>
      </div>
    </section>

    <Avatars />
    <Faq />

    <!-- Footer -->
    <footer class="bg-brand-900 text-blue-200 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 font-bold text-white text-lg">
            <span class="text-2xl">🏛️</span>
            Autonomipartiet
          </div>
          <p class="text-sm text-blue-300">
            Hackathon-prosjekt – NTNU 2025. Ingen ekte politisk tilknytning.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

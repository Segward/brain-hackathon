<script setup lang="ts">
import { ref } from 'vue'

const mobileOpen = ref(false)

const links = [
  { label: 'Politikk', href: '#politikk' },
  { label: 'Demo', href: '#demo' },
  { label: 'Avatarer', href: '#avatarer' },
  { label: 'FAQ', href: '#faq' },
]
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2 font-bold text-xl text-brand-800">
          <span class="text-2xl">🏛️</span>
          <span>Autonomipartiet</span>
        </a>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-8">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
          >
            {{ link.label }}
          </a>
          <a
            href="#demo"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm"
          >
            Prøv AI-rådgiveren
          </a>
        </div>

        <!-- Mobile menu button -->
        <button
          class="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          aria-label="Åpne meny"
          @click="mobileOpen = !mobileOpen"
        >
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden pb-4 space-y-2">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </a>
        <a
          href="#demo"
          class="block px-3 py-2 rounded-md text-base font-semibold text-white bg-brand-700 hover:bg-brand-800"
          @click="mobileOpen = false"
        >
          Prøv AI-rådgiveren
        </a>
      </div>
    </div>
  </nav>
</template>

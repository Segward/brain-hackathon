<script setup lang="ts">
import { ref } from 'vue'

const faqs = [
  {
    q: 'Må jeg være på NTNU-nett/VPN?',
    a: 'Ja, tjenesten kjører på NTNUs infrastruktur og krever tilgang via NTNU-nett eller VPN for å sikre at all databehandling skjer lokalt.',
  },
  {
    q: 'Sendes data ut av NTNU?',
    a: 'Nei. Alle modeller kjøres lokalt på NTNU/NRIS-infrastruktur. Ingen brukerdata eller samtaler sendes til eksterne tjenester eller skytilbydere.',
  },
  {
    q: 'Lagrer dere samtaler?',
    a: 'Samtaler lagres midlertidig i din nettleserøkt og slettes når du lukker fanen. Vi logger anonymisert bruksstatistikk (antall forespørsler, responstider) for å forbedre tjenesten, men aldri selve innholdet.',
  },
  {
    q: 'Kan AI ta feil?',
    a: 'Ja, absolutt. AI-modeller kan hallusinere eller gi unøyaktige svar. Derfor har vi et kildepanel som viser hvor informasjonen kommer fra, slik at du alltid kan verifisere selv. Bruk alltid kritisk sans.',
  },
]

const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section id="faq" class="py-20 bg-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">Ofte stilte spørsmål</h2>
      </div>

      <div class="space-y-3">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="rounded-2xl border border-gray-200 overflow-hidden transition-shadow"
          :class="openIndex === i ? 'shadow-md' : ''"
        >
          <button
            class="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
            @click="toggle(i)"
          >
            <span class="text-base font-semibold text-gray-900">{{ faq.q }}</span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4"
              :class="openIndex === i ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            v-if="openIndex === i"
            class="px-6 pb-5 text-sm text-gray-600 leading-relaxed"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

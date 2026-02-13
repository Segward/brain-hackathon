<script setup lang="ts">
import { useCopilotState } from '@/composables/useCopilotState'

const { persona, setPersona } = useCopilotState()

const avatars = [
  {
    id: 'leader' as const,
    title: 'Partileder',
    name: 'Eira Nordvik',
    description: 'Inspirerende visjonær med fokus på politisk strategi og store linjer.',
    gradient: 'from-blue-600 to-indigo-700',
    initials: 'EN',
  },
  {
    id: 'education' as const,
    title: 'Utdanningsminister',
    name: 'Lars Bergström',
    description: 'Reformist med fokus på vurdering, eksamen og AI i klasserommet.',
    gradient: 'from-cyan-500 to-blue-600',
    initials: 'LB',
  },
  {
    id: 'tech' as const,
    title: 'Teknologiminister',
    name: 'Sofie Haugen',
    description: 'Teknisk arkitekt som tenker i systemer, infrastruktur og skalerbarhet.',
    gradient: 'from-violet-500 to-purple-700',
    initials: 'SH',
  },
]
</script>

<template>
  <section id="avatarer" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">Våre AI-rådgivere</h2>
        <p class="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          Velg en persona og få svar tilpasset deres ekspertise og personlighet.
        </p>
      </div>

      <div class="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <button
          v-for="av in avatars"
          :key="av.id"
          :class="[
            'group text-left rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer',
            persona === av.id
              ? 'border-brand-600 bg-white shadow-lg shadow-brand-100 ring-2 ring-brand-200'
              : 'border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5',
          ]"
          @click="setPersona(av.id)"
        >
          <div
            :class="[
              'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br shadow-md mb-4',
              av.gradient,
            ]"
          >
            {{ av.initials }}
          </div>

          <div class="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            {{ av.title }}
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ av.name }}</h3>
          <p class="mt-2 text-sm text-gray-500 leading-relaxed">{{ av.description }}</p>

          <div
            v-if="persona === av.id"
            class="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700"
          >
            <span class="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            Aktiv
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

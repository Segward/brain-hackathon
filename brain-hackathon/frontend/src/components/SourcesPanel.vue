<script setup lang="ts">
import { useCopilotState } from '@/composables/useCopilotState'

const { lastSources, lastBadges, useRag, messages } = useCopilotState()
</script>

<template>
  <!-- Always show badges when there are messages; show sources only with RAG -->
  <aside
    v-if="messages.length > 0 && (lastBadges.length > 0 || lastSources.length > 0)"
    class="space-y-4"
  >
    <!-- Badges -->
    <div v-if="lastBadges.length > 0" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Politikkområder</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="badge in lastBadges"
          :key="badge"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
        >
          {{ badge }}
        </span>
      </div>
    </div>

    <!-- Sources (only with RAG) -->
    <div v-if="useRag && lastSources.length > 0" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kilder fra partiprogram</h3>
      <div class="space-y-3">
        <div
          v-for="(source, i) in lastSources"
          :key="i"
          class="rounded-xl bg-gray-50 border border-gray-100 p-4"
        >
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
              {{ i + 1 }}
            </span>
            <div>
              <h4 class="text-sm font-semibold text-gray-800">{{ source.title }}</h4>
              <p class="mt-1 text-xs text-gray-500 leading-relaxed">{{ source.snippet }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RAG hint -->
    <div v-if="!useRag && messages.length > 0" class="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-center">
      <p class="text-xs text-blue-600">
        Slå på <strong>RAG (partiprogram)</strong> for å se kilder og partiprogramreferanser.
      </p>
    </div>
  </aside>
</template>

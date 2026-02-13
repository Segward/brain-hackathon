<script setup lang="ts">
import { useCopilotState } from '@/composables/useCopilotState'

const { lastSources, lastBadges, useRag } = useCopilotState()
</script>

<template>
  <aside
    v-if="useRag && (lastSources.length > 0 || lastBadges.length > 0)"
    class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
  >
    <!-- Badges -->
    <div v-if="lastBadges.length > 0" class="mb-5">
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

    <!-- Sources -->
    <div v-if="lastSources.length > 0">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kilder</h3>
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
  </aside>
</template>

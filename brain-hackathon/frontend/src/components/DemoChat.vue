<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useCopilotState } from '@/composables/useCopilotState'

const {
  messages,
  selectedModel,
  useRag,
  persona,
  isLoading,
  send,
} = useCopilotState()

const props = defineProps<{
  prefillText?: string
}>()

const emit = defineEmits<{
  prefillConsumed: []
}>()

const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const copiedId = ref<string | null>(null)

const models = [
  { value: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
  { value: 'Qwen/Qwen3-Coder-Next-FP8', label: 'Qwen3-Coder FP8' },
  { value: 'NorwAI/NorwAI-Magistral-24B-reasoning', label: 'NorwAI-Magistral 24B' },
]

const exampleChips = [
  'Hva er borgerlønn?',
  'Hvordan fungerer AI i skolen?',
  'Er selvkjørende busser trygge?',
  'Hvordan kutte utslipp med AI?',
]

watch(
  () => props.prefillText,
  (text) => {
    if (text) {
      inputText.value = text
      emit('prefillConsumed')
      nextTick(() => {
        const el = document.getElementById('demo')
        el?.scrollIntoView({ behavior: 'smooth' })
        textareaRef.value?.focus()
      })
    }
  },
)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  () => messages.value.length,
  () => scrollToBottom(),
)
watch(isLoading, () => scrollToBottom())

async function handleSend() {
  const text = inputText.value
  inputText.value = ''
  await send(text)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function useChip(chip: string) {
  inputText.value = chip
  textareaRef.value?.focus()
}

async function copyMessage(id: string, content: string) {
  try {
    await navigator.clipboard.writeText(content)
    copiedId.value = id
    setTimeout(() => (copiedId.value = null), 2000)
  } catch {
    // clipboard not available
  }
}

const personaLabels: Record<string, string> = {
  leader: 'Partileder',
  education: 'Utdanningsminister',
  tech: 'Teknologiminister',
}

function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
    <!-- Top controls -->
    <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
      <select
        v-model="selectedModel"
        class="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
      >
        <option v-for="m in models" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>

      <label class="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
        <div class="relative">
          <input type="checkbox" v-model="useRag" class="sr-only peer" />
          <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
        </div>
        Bruk partiprogram (RAG)
      </label>

      <span class="ml-auto text-xs text-gray-400">
        Persona: <strong class="text-gray-600">{{ personaLabels[persona] }}</strong>
      </span>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <!-- Empty state -->
      <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center justify-center h-full text-center">
        <div class="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-3xl mb-4">🏛️</div>
        <h3 class="text-lg font-bold text-gray-800">AI-rådgiveren</h3>
        <p class="text-sm text-gray-500 mt-1 max-w-xs">
          Still et spørsmål om Autonomipartiets politikk, eller velg et eksempel nedenfor.
        </p>
      </div>

      <!-- Message bubbles -->
      <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
        <div
          :class="[
            'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
            msg.role === 'user'
              ? 'bg-brand-700 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md',
          ]"
        >
          <div class="whitespace-pre-wrap" v-html="formatMessage(msg.content)"></div>

          <!-- Copy button for assistant -->
          <button
            v-if="msg.role === 'assistant'"
            class="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            :aria-label="copiedId === msg.id ? 'Kopiert' : 'Kopier svar'"
            @click="copyMessage(msg.id, msg.content)"
          >
            <svg v-if="copiedId !== msg.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ copiedId === msg.id ? 'Kopiert!' : 'Kopier' }}
          </button>
        </div>
      </div>

      <!-- Loading bubble -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <span class="flex gap-1">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </span>
          Tenker…
        </div>
      </div>
    </div>

    <!-- Example chips -->
    <div v-if="messages.length === 0" class="px-4 pb-2 flex flex-wrap gap-2">
      <button
        v-for="chip in exampleChips"
        :key="chip"
        class="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
        @click="useChip(chip)"
      >
        {{ chip }}
      </button>
    </div>

    <!-- Input -->
    <div class="border-t border-gray-100 p-3">
      <div class="flex items-end gap-2">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="Still et spørsmål…"
          rows="1"
          class="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent placeholder:text-gray-400"
          @keydown="handleKeydown"
        ></textarea>
        <button
          :disabled="!inputText.trim() || isLoading"
          class="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send melding"
          @click="handleSend"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

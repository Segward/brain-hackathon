<script setup lang="ts">
import { ref, nextTick, watch, onMounted, computed } from 'vue'
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

const personaEmojis: Record<string, string> = {
  leader: '👨‍💼',
  education: '🎓',
  tech: '🤖',
}

const textAreaHeight = computed(() => {
  return Math.min(Math.max(inputText.value.split('\n').length, 1), 4) * 24
})

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
  <div class="bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-[600px] overflow-hidden">
    <!-- Top controls -->
    <div class="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-200/60 bg-gradient-to-r from-white via-white to-gray-50 backdrop-blur-sm">
      <div class="flex items-center gap-2">
        <span class="text-lg">⚙️</span>
        <select
          v-model="selectedModel"
          class="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent hover:border-gray-400 transition-all cursor-pointer"
        >
          <option v-for="m in models" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <label class="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
        <div class="relative">
          <input type="checkbox" v-model="useRag" class="sr-only peer" />
          <div class="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-400 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-600 peer-checked:to-brand-700 shadow-sm"></div>
        </div>
        <span>Bruk partiprogram</span>
      </label>

      <div class="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs">
        <span class="text-lg">{{ personaEmojis[persona] }}</span>
        <span class="text-gray-600">
          <span class="text-gray-400">Persona:</span> <strong class="text-brand-700 font-semibold">{{ personaLabels[persona] }}</strong>
        </span>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 bg-gradient-to-b from-white via-white to-gray-50/30 scroll-smooth">
      <!-- Empty state -->
      <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center justify-center h-full text-center px-4">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center text-6xl mb-6 shadow-lg" style="animation: float 3s ease-in-out infinite">
          🏛️
        </div>
        <h3 class="text-xl font-bold bg-gradient-to-r from-brand-700 to-brand-600 bg-clip-text text-transparent">AI-rådgiveren</h3>
        <p class="text-sm text-gray-600 mt-3 max-w-sm leading-relaxed">
          Still et spørsmål om Autonomipartiets politikk for å komme i gang.
        </p>
      </div>

      <!-- Message bubbles -->
      <div v-for="(msg, idx) in messages" :key="msg.id" :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']" :style="{ animation: `slideIn 0.4s ease-out ${idx * 0.05}s backwards` }">
        <!-- Assistant avatar -->
        <div v-if="msg.role === 'assistant'" class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-sm font-bold text-white shadow-md">🤖</div>
        
        <div
          :class="[
            'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm hover:shadow-md transition-all duration-200',
            msg.role === 'user'
              ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md',
          ]"
        >
          <div class="whitespace-pre-wrap" v-html="formatMessage(msg.content)"></div>

          <!-- Copy button for assistant -->
          <button
            v-if="msg.role === 'assistant'"
            class="mt-2.5 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 px-2 py-1 rounded"
            :aria-label="copiedId === msg.id ? 'Kopiert' : 'Kopier svar'"
            @click="copyMessage(msg.id, msg.content)"
          >
            <svg v-if="copiedId !== msg.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            {{ copiedId === msg.id ? 'Kopiert!' : 'Kopier' }}
          </button>
        </div>
        
        <!-- User avatar -->
        <div v-if="msg.role === 'user'" class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-sm font-bold shadow-md">👤</div>
      </div>

      <!-- Loading bubble -->
      <div v-if="isLoading" class="flex justify-start gap-2" style="animation: slideIn 0.4s ease-out">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-sm font-bold text-white shadow-md">🤖</div>
        <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-600 flex items-center gap-3 shadow-sm">
          <span class="flex gap-1.5">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </span>
          <span class="font-medium">Tenker…</span>
        </div>
      </div>
    </div>

    <!-- Example chips -->
    <div v-if="messages.length === 0" class="px-5 pb-3 flex flex-wrap gap-2">
      <button
        v-for="(chip, idx) in exampleChips"
        :key="chip"
        class="px-4 py-2 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 active:bg-brand-100 transition-all duration-200 shadow-sm hover:shadow-md"
        @click="useChip(chip)"
        :style="{ animation: `slideUp 0.4s ease-out ${0.5 + idx * 0.1}s backwards` }"
      >
        {{ chip }}
      </button>
    </div>

    <!-- Input -->
    <div class="border-t border-gray-200/60 p-4 bg-gradient-to-t from-white via-white to-gray-50 backdrop-blur-sm">
      <div class="flex items-end gap-3">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="Still et spørsmål…"
          rows="1"
          :style="{ minHeight: textAreaHeight + 'px' }"
          class="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-gray-400 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
          @keydown="handleKeydown"
        ></textarea>
        <button
          :disabled="!inputText.trim() || isLoading"
          class="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
          aria-label="Send melding"
          @click="handleSend"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
      <p class="text-xs text-gray-400 mt-1.5">💡 Trykk Enter for å sende, eller Shift+Enter for ny linje</p>
    </div>

    <!-- CSS animations -->
    <style scoped>
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .scroll-smooth {
        scroll-behavior: smooth;
      }
    </style>
  </div>
</template>

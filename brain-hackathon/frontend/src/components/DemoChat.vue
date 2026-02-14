<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import { useCopilotState } from "@/composables/useCopilotState";

const { messages, persona, isLoading, send, clearChat } = useCopilotState();

const props = defineProps<{ prefillText?: string }>();
const emit = defineEmits<{ prefillConsumed: [] }>();

const inputText = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);
const copiedId = ref<string | null>(null);

const exampleChips = [
  "Hva er borgerlønn?",
  "Hvordan skal eksamen fungere med AI?",
  "Er selvkjørende busser trygge?",
  "Hvordan kutte utslipp med AI?",
];

const personaLabels: Record<string, string> = {
  leader: "Partileder",
  education: "Utdanningsminister",
  tech: "Teknologiminister",
};

watch(
  () => props.prefillText,
  (text) => {
    if (!text) return;
    inputText.value = text;
    emit("prefillConsumed");
    nextTick(() => {
      document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
      textareaRef.value?.focus();
      autoResize();
    });
  },
);

watch(
  () => messages.value.length,
  () => scrollToBottom(),
);

watch(
  () => isLoading.value,
  () => scrollToBottom(),
);

function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });
}

async function handleSend() {
  const text = inputText.value.trim();
  if (!text || isLoading.value) return;

  inputText.value = "";
  resetTextareaHeight();
  await send(text);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function useChip(chip: string) {
  inputText.value = chip;
  textareaRef.value?.focus();
  nextTick(autoResize);
}

function autoResize() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function resetTextareaHeight() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
}

async function copyMessage(id: string, content: string) {
  try {
    await navigator.clipboard.writeText(content);
    copiedId.value = id;
    setTimeout(() => (copiedId.value = null), 1500);
  } catch {
    // ignore
  }
}

function renderMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

onMounted(() => textareaRef.value?.focus());
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 shadow-lg flex flex-col h-[600px] overflow-hidden bg-white"
  >
    <!-- Top bar -->
    <div class="flex items-center px-5 py-4 border-b border-gray-200/60">
      <span class="text-xs text-gray-500">
        <strong class="text-gray-700">{{ personaLabels[persona] }}</strong>
      </span>

      <button
        v-if="messages.length > 0"
        class="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors"
        title="Tøm samtale"
        @click="clearChat"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
      <!-- Empty -->
      <div
        v-if="messages.length === 0 && !isLoading"
        class="h-full flex flex-col items-center justify-center text-center px-4"
      >
        <div class="text-5xl mb-4">🏛️</div>
        <h3 class="text-lg font-semibold text-gray-900">AI-rådgiveren</h3>
        <p class="text-sm text-gray-600 mt-2">Still et spørsmål for å komme i gang.</p>
      </div>

      <!-- Bubbles -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div
          v-if="msg.role === 'assistant'"
          class="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm"
        >
          🤖
        </div>

        <div
          :class="[
            'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
            msg.role === 'user'
              ? 'bg-gray-900 text-white rounded-br-md'
              : 'bg-gray-50 border border-gray-200 text-gray-900 rounded-bl-md',
          ]"
        >
          <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">
            {{ msg.content }}
          </div>

          <div v-else class="prose-sm max-w-none" v-html="renderMarkdown(msg.content)"></div>

          <button
            v-if="msg.role === 'assistant'"
            class="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            :aria-label="copiedId === msg.id ? 'Kopiert' : 'Kopier svar'"
            @click="copyMessage(msg.id, msg.content)"
          >
            <span>{{ copiedId === msg.id ? "Kopiert!" : "Kopier" }}</span>
          </button>
        </div>

        <div
          v-if="msg.role === 'user'"
          class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm"
        >
          👤
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm">
          🤖
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-600">
          Tenker…
        </div>
      </div>
    </div>

    <!-- Chips -->
    <div v-if="messages.length === 0" class="px-4 pb-2 flex flex-wrap gap-2">
      <button
        v-for="chip in exampleChips"
        :key="chip"
        class="px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
        @click="useChip(chip)"
      >
        {{ chip }}
      </button>
    </div>

    <!-- Input -->
    <div class="border-t border-gray-200/60 p-4">
      <div class="flex items-end gap-3">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="Still et spørsmål…"
          rows="1"
          class="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          @keydown="handleKeydown"
          @input="autoResize"
        />

        <button
          :disabled="!inputText.trim() || isLoading"
          class="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send melding"
          @click="handleSend"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p class="text-xs text-gray-400 mt-1.5">
        Enter for å sende, Shift+Enter for ny linje
      </p>
    </div>
  </div>
</template>

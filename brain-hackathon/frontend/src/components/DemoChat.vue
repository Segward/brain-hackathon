<script setup lang="ts">
import { ref, nextTick, watch, onMounted, computed } from "vue";
import { useCopilotState } from "@/composables/useCopilotState";

const { messages, selectedModel, persona, isLoading, send, clearChat } =
  useCopilotState();

const props = defineProps<{
  prefillText?: string;
}>();

const emit = defineEmits<{
  prefillConsumed: [];
}>();

const inputText = ref("");
const messagesContainer = ref<HTMLDivElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const copiedId = ref<string | null>(null);

const models = [
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
  { value: "Qwen/Qwen3-Coder-Next-FP8", label: "Qwen3-Coder FP8" },
  {
    value: "NorwAI/NorwAI-Magistral-24B-reasoning",
    label: "NorwAI-Magistral 24B",
  },
];

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

const showLoadingBubble = computed(() => isLoading.value);

// ---- Prefill from policy cards ----

watch(
  () => props.prefillText,
  (text) => {
    if (text) {
      inputText.value = text;
      emit("prefillConsumed");
      nextTick(() => {
        document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
        textareaRef.value?.focus();
        autoResize();
      });
    }
  },
);

// ---- Auto-scroll (deep watch to catch streaming updates) ----

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(messages, () => scrollToBottom(), { deep: true });
watch(showLoadingBubble, () => scrollToBottom());

// ---- Input handling ----

async function handleSend() {
  const text = inputText.value;
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

// ---- Auto-resize textarea ----

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

// ---- Copy ----

async function copyMessage(id: string, content: string) {
  try {
    await navigator.clipboard.writeText(content);
    copiedId.value = id;
    setTimeout(() => (copiedId.value = null), 2000);
  } catch {
    // clipboard not available
  }
}

// ---- Markdown rendering ----

function renderMarkdown(content: string): string {
  let html = escapeHtml(content);

  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre class="bg-gray-800 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs leading-relaxed"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>',
  );

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  // Headers (## and ###)
  html = html.replace(
    /^### (.+)$/gm,
    '<h4 class="font-bold text-sm mt-3 mb-1">$1</h4>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>',
  );

  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(
    /((?:<li[^>]*>.*<\/li>\n?)+)/g,
    '<ul class="my-1.5 space-y-0.5">$1</ul>',
  );

  // Numbered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal">$1</li>',
  );

  // Blockquotes
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="border-l-3 border-brand-400 pl-3 my-2 text-gray-600 italic">$1</blockquote>',
  );

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p class="mt-2">');

  // Single newlines
  html = html.replace(/\n/g, "<br>");

  return `<p>${html}</p>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

onMounted(() => {
  textareaRef.value?.focus();
});
</script>

<template>
  <div
    class="bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-[600px] overflow-hidden"
  >
    <!-- Top controls -->
    <div
      class="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-200/60 bg-gradient-to-r from-white via-white to-gray-50 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg">⚙️</span>
        <select
          v-model="selectedModel"
          class="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent hover:border-gray-400 transition-all cursor-pointer"
        >
          <option v-for="m in models" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
      </div>

      <div class="ml-auto flex items-center gap-3">
        <span class="text-xs text-gray-400">
          <strong class="text-gray-600">{{ personaLabels[persona] }}</strong>
        </span>
        <button
          v-if="messages.length > 0"
          class="text-xs text-gray-400 hover:text-red-500 transition-colors"
          title="Tøm samtale"
          @click="clearChat"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 bg-gradient-to-b from-white via-white to-gray-50/30 scroll-smooth"
    >
      <!-- Empty state -->
      <div
        v-if="messages.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div
          class="w-24 h-24 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center text-6xl mb-6 shadow-lg"
          style="animation: float 3s ease-in-out infinite"
        >
          🏛️
        </div>
        <h3
          class="text-xl font-bold bg-gradient-to-r from-brand-700 to-brand-600 bg-clip-text text-transparent"
        >
          AI-rådgiveren
        </h3>
        <p class="text-sm text-gray-600 mt-3 max-w-sm leading-relaxed">
          Still et spørsmål for å komme i gang.
        </p>
      </div>

      <!-- Message bubbles -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'flex animate-fade-in',
          msg.role === 'user' ? 'justify-end' : 'justify-start',
        ]"
      >
        <div
          :class="[
            'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
            msg.role === 'user' ?
              'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md',
          ]"
        >
          <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">
            {{ msg.content }}
          </div>

          <div
            v-else
            class="prose-sm prose-headings:text-gray-900 prose-strong:text-gray-900 max-w-none"
            v-html="renderMarkdown(msg.content)"
          ></div>

          <button
            v-if="msg.role === 'assistant'"
            class="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            :aria-label="copiedId === msg.id ? 'Kopiert' : 'Kopier svar'"
            @click="copyMessage(msg.id, msg.content)"
          >
            <svg
              v-if="copiedId !== msg.id"
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <svg
              v-else
              class="w-3.5 h-3.5 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              />
            </svg>
            {{ copiedId === msg.id ? "Kopiert!" : "Kopier" }}
          </button>
        </div>
      </div>

      <!-- Loading bubble (before first token) -->
      <div v-if="showLoadingBubble" class="flex justify-start animate-fade-in">
        <div
          class="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500 flex items-center gap-2"
        >
          <span class="flex gap-1">
            <span
              class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0ms"
            ></span>
            <span
              class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></span>
            <span
              class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></span>
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
        :style="{
          animation: `slideUp 0.4s ease-out ${0.5 + idx * 0.1}s backwards`,
        }"
      >
        {{ chip }}
      </button>
    </div>

    <!-- Input -->
    <div
      class="border-t border-gray-200/60 p-4 bg-gradient-to-t from-white via-white to-gray-50 backdrop-blur-sm"
    >
      <div class="flex items-end gap-3">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="Still et spørsmål…"
          rows="1"
          class="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-gray-400 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
          @keydown="handleKeydown"
          @input="autoResize"
        ></textarea>
        <button
          :disabled="!inputText.trim() || isLoading"
          class="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
          aria-label="Send melding"
          @click="handleSend"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14m-7-7l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <p class="text-[10px] text-gray-400 mt-1.5 text-center">
        Enter for å sende · Shift+Enter for ny linje
      </p>
    </div>
  </div>
</template>

<style scoped>
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
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.25s ease-out;
}

.scroll-smooth {
  scroll-behavior: smooth;
}
</style>

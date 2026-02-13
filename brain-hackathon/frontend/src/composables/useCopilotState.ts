import { ref } from "vue";
import {
  sendMessageStream,
  sendMessageFull,
  type Source,
  type ChatMessage,
} from "@/services/chat";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const messages = ref<Message[]>([]);
const selectedModel = ref("openai/gpt-oss-120b");
const useRag = ref(false);
const persona = ref<"leader" | "education" | "tech">("leader");
const lastSources = ref<Source[]>([]);
const lastBadges = ref<string[]>([]);
const isLoading = ref(false);
const streamingId = ref<string | null>(null);

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useCopilotState() {
  function buildHistory(): ChatMessage[] {
    return messages.value
      .filter((m) => m.content.trim() !== "")
      .map((m) => ({ role: m.role, content: m.content }));
  }

  async function send(content: string) {
    if (!content.trim() || isLoading.value) return;
    const text = content.trim();

    // Add user message
    messages.value.push({
      id: uid(),
      role: "user",
      content: text,
      ts: Date.now(),
    });

    isLoading.value = true;
    streamingId.value = null;

    const history = buildHistory();
    const req = {
      messages: history,
      model: selectedModel.value,
      useRag: useRag.value,
      persona: persona.value,
    };

    try {
      // Try streaming first
      await sendMessageStream(req, (token) => {
        if (!streamingId.value) {
          // First token — create assistant message
          const id = uid();
          streamingId.value = id;
          messages.value.push({
            id,
            role: "assistant",
            content: token,
            ts: Date.now(),
          });
        } else {
          // Append to existing message
          const msg = messages.value.find((m) => m.id === streamingId.value);
          if (msg) msg.content += token;
        }
      });

      // After streaming, get sources/badges via non-streaming endpoint
      if (useRag.value) {
        try {
          const full = await sendMessageFull({
            messages: [{ role: "user", content: text }],
            model: selectedModel.value,
            useRag: true,
            persona: persona.value,
          });
          lastSources.value = full.sources;
          lastBadges.value = full.badges;
        } catch {
          // Sources are nice-to-have, don't fail on this
        }
      } else {
        lastSources.value = [];
        lastBadges.value = detectBadgesLocal(text);
      }

      // If no tokens arrived (empty stream), add a fallback
      if (!streamingId.value) {
        messages.value.push({
          id: uid(),
          role: "assistant",
          content: "Beklager, fikk tomt svar fra modellen. Prøv igjen.",
          ts: Date.now(),
        });
      }
    } catch {
      // Streaming failed — try non-streaming fallback
      try {
        const full = await sendMessageFull(req);
        messages.value.push({
          id: uid(),
          role: "assistant",
          content: full.reply,
          ts: Date.now(),
        });
        lastSources.value = full.sources;
        lastBadges.value = full.badges;
      } catch {
        messages.value.push({
          id: uid(),
          role: "assistant",
          content: "Kunne ikke nå serveren. Sjekk at backend kjører",
          ts: Date.now(),
        });
      }
    } finally {
      isLoading.value = false;
      streamingId.value = null;
    }
  }

  function setPersona(p: "leader" | "education" | "tech") {
    persona.value = p;
  }

  function clearChat() {
    messages.value = [];
    lastSources.value = [];
    lastBadges.value = [];
  }

  return {
    messages,
    selectedModel,
    useRag,
    persona,
    lastSources,
    lastBadges,
    isLoading,
    streamingId,
    send,
    setPersona,
    clearChat,
  };
}

function detectBadgesLocal(message: string): string[] {
  const lower = message.toLowerCase();
  const badges: string[] = [];
  if (/eksamen|skole|utdanning|elev|lærer|vurdering/.test(lower))
    badges.push("Utdanning");
  if (/jobb|arbeid|automatis|omstilling|ansatt/.test(lower))
    badges.push("Arbeidsliv");
  if (/klima|co2|utslipp|miljø|energi/.test(lower)) badges.push("Klima");
  if (/transport|logistikk|buss|tog|selvkjørende/.test(lower))
    badges.push("Transport");
  if (/borgerlønn|grunninntekt|velferd|trygd/.test(lower))
    badges.push("Velferd");
  if (badges.length === 0) badges.push("Generelt");
  return badges;
}

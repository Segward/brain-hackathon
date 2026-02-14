import { ref } from "vue";
import { sendMessage, type ChatMessage } from "@/services/chat";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const messages = ref<Message[]>([]);
const selectedModel = ref("openai/gpt-oss-120b");
const persona = ref<"leader" | "education" | "tech">("leader");
const isLoading = ref(false);

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

    try {
      const reply = await sendMessage({
        messages: buildHistory().concat({ role: "user", content: text }),
        model: selectedModel.value,
        persona: persona.value,
      });

      messages.value.push({
        id: uid(),
        role: "assistant",
        content: reply,
        ts: Date.now(),
      });
    } catch {
      messages.value.push({
        id: uid(),
        role: "assistant",
        content: "Kunne ikke nå serveren. Sjekk at backend kjører",
        ts: Date.now(),
      });
    } finally {
      isLoading.value = false;
    }
  }

  function setPersona(p: "leader" | "education" | "tech") {
    persona.value = p;
  }

  function clearChat() {
    messages.value = [];
  }

  return {
    messages,
    selectedModel,
    persona,
    isLoading,
    send,
    setPersona,
    clearChat,
  };
}

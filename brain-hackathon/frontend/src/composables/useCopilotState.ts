import { ref } from 'vue'
import { sendMessage as apiSendMessage, type Source } from '@/services/chat'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: number
}

const messages = ref<Message[]>([])
const selectedModel = ref('openai/gpt-oss-120b')
const useRag = ref(false)
const persona = ref<'leader' | 'education' | 'tech'>('leader')
const lastSources = ref<Source[]>([])
const lastBadges = ref<string[]>([])
const isLoading = ref(false)

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function useCopilotState() {
  function addUserMessage(content: string) {
    messages.value.push({
      id: uid(),
      role: 'user',
      content,
      ts: Date.now(),
    })
  }

  async function send(content: string) {
    if (!content.trim() || isLoading.value) return
    addUserMessage(content.trim())
    isLoading.value = true

    try {
      const res = await apiSendMessage({
        message: content.trim(),
        model: selectedModel.value,
        useRag: useRag.value,
        persona: persona.value,
      })

      messages.value.push({
        id: uid(),
        role: 'assistant',
        content: res.reply,
        ts: Date.now(),
      })

      lastSources.value = res.sources
      lastBadges.value = res.badges
    } catch {
      messages.value.push({
        id: uid(),
        role: 'assistant',
        content: 'Beklager, noe gikk galt. Prøv igjen.',
        ts: Date.now(),
      })
    } finally {
      isLoading.value = false
    }
  }

  function prefillInput(text: string) {
    return text
  }

  function setPersona(p: 'leader' | 'education' | 'tech') {
    persona.value = p
  }

  function clearChat() {
    messages.value = []
    lastSources.value = []
    lastBadges.value = []
  }

  return {
    messages,
    selectedModel,
    useRag,
    persona,
    lastSources,
    lastBadges,
    isLoading,
    send,
    prefillInput,
    setPersona,
    clearChat,
  }
}

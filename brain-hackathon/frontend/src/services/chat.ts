export interface Source {
  title: string
  snippet: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatStreamRequest {
  messages: ChatMessage[]
  model: string
  useRag: boolean
  persona: 'leader' | 'education' | 'tech'
}

export interface ChatResponse {
  reply: string
  sources: Source[]
  badges: string[]
}

/**
 * Streaming chat — reads SSE tokens from POST /api/chat/stream.
 * Calls onToken for each chunk as it arrives.
 */
export async function sendMessageStream(
  req: ChatStreamRequest,
  onToken: (token: string) => void,
): Promise<void> {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE format: "data:token\n\n" — Spring sends each Flux element as a data: line
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (line.startsWith('data:')) {
          const data = line.slice(5)
          if (data && data.trim() !== '') {
            onToken(data)
          }
        }
      }
    }
  }
}

/**
 * Non-streaming fallback — POST /api/chat returns full JSON.
 */
export async function sendMessageFull(req: ChatStreamRequest): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`)
  }

  return await res.json()
}

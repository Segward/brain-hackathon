export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model: string
  persona: 'leader' | 'education' | 'tech'
}

export async function sendMessage(req: ChatRequest): Promise<string> {
  const latestUser = [...req.messages].reverse().find((m) => m.role === 'user')
  const text = latestUser?.content ?? ''

  const res = await fetch(
    `/api/chat?message=${encodeURIComponent(text)}&mode=${encodeURIComponent(req.persona)}`
  )

  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`)
  }

  return await res.text()
}

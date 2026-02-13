export interface Source {
  title: string
  snippet: string
}

export interface ChatRequest {
  message: string
  model: string
  useRag: boolean
  persona: 'leader' | 'education' | 'tech'
}

export interface ChatResponse {
  reply: string
  sources: Source[]
  badges: string[]
}

export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  try {
    const url = `http://localhost:8080/api/chat?message=${encodeURIComponent(req.message)}`
    const res = await fetch(url)

    if (!res.ok) throw new Error(`Backend responded with ${res.status}`)

    const reply = await res.text()
    return { reply, sources: [], badges: [] }
  } catch (err) {
    console.warn('Backend unavailable, using mock fallback:', err)
    return sendMockMessage(req)
  }
}

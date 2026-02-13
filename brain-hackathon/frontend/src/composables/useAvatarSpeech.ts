import { ref, watch } from 'vue'
import { useCopilotState } from './useCopilotState'
import { speak as speakNorwegian, stop as stopNorwegian } from './useNorwegianTTS'

type Persona = 'leader' | 'education' | 'tech'

/** Reactive mouth-open value (0–1) driven by speech */
const mouthOpen = ref(0)
const isSpeaking = ref(false)

// Track which message we already spoke
let lastSpokenId: string | null = null

// Mouth animation via interval during speech
let mouthInterval: ReturnType<typeof setInterval> | null = null
let cachedVoices: SpeechSynthesisVoice[] = []
let voicesInitialized = false

// ===== PREMIUM VOICE SETTINGS =====

const VOICE_PROFILES = {
  leader: {
    // Eira Nordvik - Elegant, authoritative female voice
    preferredVoices: [
      'Nora (Enhanced)', // macOS Premium
      'Google norsk Naturlig', // Google Neural
      'Microsoft Nora Online (Natural)', // Microsoft Neural
      'Samantha (Enhanced)', // macOS fallback
      'Google US English Female',
    ],
    prosody: {
      rate: 0.92, // Slightly slower for gravitas
      pitch: 1.0, // Normal pitch for mature female
      volume: 1.0,
    },
    emotion: 'confident',
  },
  education: {
    // Lars Bergström - Warm, pedagogical male voice
    preferredVoices: [
      'Thomas (Enhanced)', // macOS Premium
      'Google norsk Naturlig Mann', // Google Neural
      'Microsoft Finn Online (Natural)', // Microsoft Neural
      'Alex (Enhanced)', // macOS fallback
      'Google UK English Male',
    ],
    prosody: {
      rate: 0.95, // Steady, clear pace
      pitch: 0.95, // Slightly deeper male voice
      volume: 1.0,
    },
    emotion: 'friendly',
  },
  tech: {
    // Sofie Haugen - Energetic, modern female voice
    preferredVoices: [
      'Sara (Enhanced)', // macOS Premium
      'Google norsk Naturlig Kvinne', // Google Neural
      'Microsoft Ingrid Online (Natural)', // Microsoft Neural
      'Karen (Enhanced)', // macOS fallback
      'Google US English Female 2',
    ],
    prosody: {
      rate: 0.98, // Slightly faster, energetic
      pitch: 1.05, // Slightly higher, youthful
      volume: 0.98,
    },
    emotion: 'enthusiastic',
  },
}

// Voice quality scoring - prioritize neural/enhanced voices
const PREMIUM_VOICE_INDICATORS = [
  'enhanced',
  'premium',
  'natural',
  'neural',
  'wavenet',
  'high quality',
  'hq',
]

const POOR_VOICE_INDICATORS = [
  'compact',
  'samantha',
  'fred',
  'victoria',
  'espeak',
  'robot',
  'synthetic',
]

function refreshVoices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) return []
  cachedVoices = window.speechSynthesis.getVoices()
  return cachedVoices
}

function scoreVoice(voice: SpeechSynthesisVoice, persona: Persona): number {
  const lang = voice.lang.toLowerCase()
  const name = voice.name.toLowerCase()
  const profile = VOICE_PROFILES[persona]

  let score = 0

  // Check if voice is in preferred list (highest priority)
  const preferredIndex = profile.preferredVoices.findIndex((preferred) =>
    name.includes(preferred.toLowerCase())
  )
  if (preferredIndex !== -1) {
    score += 1000 - preferredIndex * 10 // Higher score for earlier in list
  }

  // Language scoring - Norwegian first
  if (lang === 'nb-no' || lang === 'no-no') score += 150
  else if (lang.startsWith('nb') || lang.startsWith('no')) score += 130
  else if (lang === 'nn-no') score += 110
  else if (lang.startsWith('sv') || lang.startsWith('da')) score += 80
  else if (lang.startsWith('en-us')) score += 50
  else if (lang.startsWith('en')) score += 40

  // Premium voice indicators
  if (PREMIUM_VOICE_INDICATORS.some((hint) => name.includes(hint))) score += 100
  if (POOR_VOICE_INDICATORS.some((hint) => name.includes(hint))) score -= 200

  // Local voices often sound better
  if (voice.localService) score += 30
  if (voice.default) score += 10

  // Gender matching (loose)
  if (persona === 'leader' || persona === 'tech') {
    if (/(female|woman|girl|she|nora|sara|karen|ingrid|liv|anna)/i.test(name)) {
      score += 20
    }
  } else if (persona === 'education') {
    if (/(male|man|boy|he|thomas|alex|finn|henrik)/i.test(name)) {
      score += 20
    }
  }

  return score
}

function pickBestVoice(persona: Persona): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length ? cachedVoices : refreshVoices()
  if (!voices.length) return null

  const ranked = [...voices].sort((a, b) => scoreVoice(b, persona) - scoreVoice(a, persona))

  // Debug: Log top 3 voices
  console.log(`🎤 Top voices for ${persona}:`)
  ranked.slice(0, 3).forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.name} (${v.lang}) - Score: ${scoreVoice(v, persona)}`)
  })

  return ranked[0] ?? null
}

// ===== ADVANCED MOUTH SYNC =====

function startAdvancedMouthAnimation() {
  stopMouthAnimation()
  isSpeaking.value = true

  // Web Speech API doesn't expose PCM stream reliably,
  // so we use time-based animation tuned for natural movement.
  startTimedMouthAnimation()
}

function startTimedMouthAnimation() {
  mouthInterval = setInterval(() => {
    // More realistic mouth movement with vowel-like patterns
    const t = Date.now() / 100
    const vowelPattern = Math.sin(t * 1.5) * 0.5 + 0.5
    const consonantPattern = Math.random() > 0.7 ? 0.2 : 0
    mouthOpen.value = 0.2 + vowelPattern * 0.6 + consonantPattern
  }, 60) // Faster update for smoother animation
}

function stopMouthAnimation() {
  if (mouthInterval) {
    clearInterval(mouthInterval)
    mouthInterval = null
  }
  mouthOpen.value = 0
  isSpeaking.value = false
}

// ===== TEXT PREPROCESSING FOR NATURAL SPEECH =====

function preprocessTextForSpeech(text: string): string {
  let clean = text

  // Remove markdown
  clean = clean
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/`[^`]+`/g, '') // Inline code
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/^#{1,6}\s+/gm, '') // Headers
    .replace(/^[-*]\s+/gm, '') // Lists
    .replace(/^\d+\.\s+/gm, '') // Numbered lists
    .replace(/^>\s+/gm, '') // Blockquotes

  // Add natural pauses (Web Speech API doesn't support SSML tags,
  // so we emulate pauses with punctuation + spacing)
  clean = clean
    .replace(/\.\s+/g, '.  ') // Pause after sentences
    .replace(/\?\s+/g, '?  ') // Longer pause after questions
    .replace(/!\s+/g, '!  ') // Pause after exclamations
    .replace(/:\s+/g, ': ') // Short pause after colons
    .replace(/;\s+/g, '; ') // Short pause after semicolons

  // Expand common abbreviations for better pronunciation
  clean = clean
    .replace(/\bAI\b/g, 'A.I.') // Pronounce letter by letter
    .replace(/\bVPN\b/g, 'V.P.N.')
    .replace(/\bNTNU\b/g, 'N.T.N.U.')
    .replace(/\bf\.eks\./g, 'for eksempel')
    .replace(/\bdvs\./g, 'det vil si')
    .replace(/\bmv\./g, 'med videre')

  // Fix common Norwegian pronunciation issues
  clean = clean
    .replace(/\bkr\b/g, 'kroner')
    .replace(/(\d+)\s*%/g, '$1 prosent')
    .replace(/(\d{4})-(\d{4})/g, '$1 til $2') // Year ranges

  return clean.trim()
}

// ===== MAIN SPEECH FUNCTION (Using Norwegian TTS) =====

async function speak(text: string, persona: Persona) {
  // Stop any ongoing speech
  stopSpeaking()

  const clean = preprocessTextForSpeech(text)
  if (!clean) return

  try {
    startAdvancedMouthAnimation()
    console.log(`🗣️ ${persona} started speaking`)
    
    // Use Norwegian TTS service (supports Azure, Google, and Web Speech)
    await speakNorwegian(clean, persona)
    
    stopMouthAnimation()
    console.log(`🤐 ${persona} finished speaking`)
  } catch (error) {
    console.error('🔇 Speech error:', error)
    stopMouthAnimation()
  }
}

function stopSpeaking() {
  stopNorwegian()
  stopMouthAnimation()
}

// ===== COMPOSABLE EXPORT =====

export function useAvatarSpeech() {
  const { messages, streamingId, isLoading, persona } = useCopilotState()

  function speakLastAssistantMessage() {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id !== lastSpokenId) {
      lastSpokenId = lastMsg.id
      speak(lastMsg.content, persona.value)
    }
  }

  // Watch for streaming to finish
  watch(streamingId, (newVal, oldVal) => {
    if (oldVal && !newVal) {
      // Small delay to ensure full text is rendered
      setTimeout(() => speakLastAssistantMessage(), 200)
    }
  })

  // Fallback for non-streaming
  watch(isLoading, (newVal, oldVal) => {
    if (oldVal && !newVal && !streamingId.value) {
      setTimeout(() => speakLastAssistantMessage(), 200)
    }
  })

  // Preload voices (required for Chrome/Edge)
  if (window.speechSynthesis && !voicesInitialized) {
    voicesInitialized = true
    refreshVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      refreshVoices()
      console.log(`🎤 Loaded ${cachedVoices.length} voices`)
    }
  }

  return {
    mouthOpen,
    isSpeaking,
    speak,
    stopSpeaking,
  }
}

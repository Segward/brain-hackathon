/**
 * Norwegian TTS Service - Web Speech API with unique voices per persona
 */

import { ref } from 'vue'

type Persona = 'leader' | 'education' | 'tech'

const isSpeaking = ref(false)

const VOICE_PREFERENCES = {
  leader: {
    preferredNames: ['Nora', 'Pernille', 'Sara', 'Samantha', 'Karen', 'Victoria'],
    gender: 'female',
    pitch: 1.15,
    rate: 0.85,
  },
  education: {
    preferredNames: ['Finn', 'Henrik', 'Thomas', 'Daniel', 'Oliver', 'Alex'],
    gender: 'male',
    pitch: 0.70,
    rate: 0.95,
  },
  tech: {
    preferredNames: ['Iselin', 'Sofie', 'Ingrid', 'Zira', 'Hazel', 'Kate'],
    gender: 'female',
    pitch: 1.30,
    rate: 1.08,
  },
}

function preprocessNorwegianText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\bAI\b/g, 'A I')
    .replace(/\bNTNU\b/g, 'N T N U')
    .replace(/\bf\.eks\./g, 'for eksempel')
    .replace(/\bkr\b/g, 'kroner')
    .replace(/(\d+)\s*%/g, '$1 prosent')
    .replace(/(\d{4})-(\d{4})/g, '$1 til $2')
    .trim()
    .slice(0, 1000)
}

const selectedVoices: Record<Persona, SpeechSynthesisVoice | null> = {
  leader: null,
  education: null,
  tech: null,
}

function findUniqueVoiceForPersona(
  voices: SpeechSynthesisVoice[],
  persona: Persona
): SpeechSynthesisVoice | null {
  if (selectedVoices[persona]) return selectedVoices[persona]

  const prefs = VOICE_PREFERENCES[persona]
  const alreadyUsed = Object.entries(selectedVoices)
    .filter(([p, v]) => p !== persona && v !== null)
    .map(([_, v]) => v)

  // Try Norwegian/Nordic first, then quality English voices
  let candidates = voices.filter(v => 
    v.lang.startsWith('nb') || v.lang.startsWith('no') ||
    v.lang.startsWith('sv') || v.lang.startsWith('da')
  )

  if (candidates.length < 3) {
    candidates = voices.filter(v => {
      const name = v.name.toLowerCase()
      return name.includes('enhanced') || name.includes('premium') ||
             name.includes('natural') || name.includes('neural') ||
             prefs.preferredNames.some(n => name.includes(n.toLowerCase()))
    })
  }

  if (candidates.length === 0) candidates = voices

  const scored = candidates
    .map(v => ({
      voice: v,
      score: scoreVoice(v, persona),
      isUsed: alreadyUsed.some(used => used?.name === v.name)
    }))
    .sort((a, b) => {
      if (a.isUsed !== b.isUsed) return a.isUsed ? 1 : -1
      return b.score - a.score
    })

  const selected = scored[0]?.voice
  selectedVoices[persona] = selected
  console.log(`🎤 ${persona}: ${selected?.name} (pitch: ${prefs.pitch}, rate: ${prefs.rate})`)
  
  return selected
}

function scoreVoice(voice: SpeechSynthesisVoice, persona: Persona): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  const prefs = VOICE_PREFERENCES[persona]
  let score = 0

  // Language priority
  if (lang.startsWith('nb') || lang.startsWith('no')) score += 300
  else if (lang.startsWith('sv') || lang.startsWith('da')) score += 150
  else if (lang === 'en-gb') score += 100
  else if (lang.startsWith('en')) score += 80
  else return 0

  // Quality
  if (name.includes('enhanced') || name.includes('premium')) score += 150
  if (name.includes('natural') || name.includes('neural')) score += 120

  // Preferred names
  if (prefs.preferredNames.some(n => name.includes(n.toLowerCase()))) score += 300

  // Gender match
  const femaleNames = ['nora', 'pernille', 'sara', 'samantha', 'karen', 'victoria', 'female']
  const maleNames = ['finn', 'henrik', 'thomas', 'daniel', 'oliver', 'alex', 'male']
  
  const isFemale = femaleNames.some(n => name.includes(n))
  const isMale = maleNames.some(n => name.includes(n))
  
  if (prefs.gender === 'female' && isFemale) score += 150
  if (prefs.gender === 'male' && isMale) score += 150
  if (prefs.gender === 'female' && isMale) score -= 100
  if (prefs.gender === 'male' && isFemale) score -= 100

  // Avoid poor
  if (name.includes('compact') || name.includes('espeak')) score -= 300

  if (voice.localService) score += 80

  return score
}

export async function speak(text: string, persona: Persona): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'))
      return
    }

    window.speechSynthesis.cancel()

    const clean = preprocessNorwegianText(text)
    const utterance = new SpeechSynthesisUtterance(clean)
    
    const voices = window.speechSynthesis.getVoices()
    const voice = findUniqueVoiceForPersona(voices, persona)
    
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = 'nb-NO'
    }

    const prefs = VOICE_PREFERENCES[persona]
    utterance.rate = prefs.rate
    utterance.pitch = prefs.pitch
    utterance.volume = 1.0

    utterance.onstart = () => { isSpeaking.value = true }
    utterance.onend = () => { isSpeaking.value = false; resolve() }
    utterance.onerror = (event) => { isSpeaking.value = false; reject(event) }

    window.speechSynthesis.speak(utterance)
  })
}

export function stop(): void {
  window.speechSynthesis?.cancel()
  isSpeaking.value = false
}

export function useNorwegianTTS() {
  return { isSpeaking, speak, stop }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices()
    Object.keys(VOICE_PREFERENCES).forEach(p => 
      findUniqueVoiceForPersona(voices, p as Persona)
    )
  }
}

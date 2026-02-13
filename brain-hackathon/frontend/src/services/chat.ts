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

const ragSources: Source[] = [
  {
    title: 'Partiprogram §4.2 – AI i offentlig sektor',
    snippet:
      'Autonomipartiet skal sikre at alle offentlige tjenester tilbyr AI-assistert veiledning innen 2035. Løsningene skal kjøres på norsk infrastruktur og ivareta personvernet til innbyggerne.',
  },
  {
    title: 'Partiprogram §7.1 – Borgerlønn og omstilling',
    snippet:
      'Vi innfører en universell grunninntekt på 12 000 kr/mnd for alle over 18 år, finansiert gjennom automatiseringsskatt på bedrifter med over 50 % AI-drevet produksjon.',
  },
  {
    title: 'Partiprogram §3.5 – Utdanning og livslang læring',
    snippet:
      'Alle elever skal ha tilgang til AI-tilpassede læringsplaner. Eksamen erstattes gradvis med porteføljevurdering støttet av AI-analyse for å fange opp individuelle styrker.',
  },
  {
    title: 'Partiprogram §5.3 – Klimahandling med AI',
    snippet:
      'Sanntids klimaovervåking med AI-sensorer i alle norske kommuner. Mål: 55 % utslippskutt innen 2035 ved hjelp av prediktiv analyse og smart energistyring.',
  },
  {
    title: 'Partiprogram §6.1 – Autonom transport',
    snippet:
      'Selvkjørende kollektivtransport i alle byer med over 50 000 innbyggere innen 2038. Gratis for studenter, pensjonister og lavinntektsgrupper.',
  },
]

const leaderReplies: Record<string, string[]> = {
  default: [
    'Som partileder i Autonomipartiet er min visjon klar: Norge skal lede an i den globale AI-revolusjonen – ikke som tilskuere, men som arkitekter av en mer rettferdig fremtid. Vi kombinerer nordisk tillit med teknologisk innovasjon.\n\nDette handler ikke om å erstatte mennesker, men om å frigjøre menneskelig potensial. Sammen bygger vi Norge 2040.',
    'La meg være tydelig: AI er ikke en trussel mot det norske samfunnet – det er vår største mulighet. Med riktig regulering og en modig politikk kan vi sikre at teknologien tjener folket, ikke omvendt.\n\nAutonomipartiet tør der andre nøler. Fremtiden venter ikke.',
    'Spørsmålet er ikke om AI vil endre Norge – det er allerede i gang. Spørsmålet er hvem som styrer utviklingen. Vi i Autonomipartiet sier: det skal folket gjøre, gjennom demokratisk kontroll og åpen teknologi.\n\nNorge har alltid vært best når vi er modige. Nå er tiden inne igjen.',
  ],
  utdanning: [
    'Utdanning er selve grunnmuren i AI-samfunnet. Autonomipartiet vil at norske elever skal møte et skolesystem som ser dem som individer, ikke som én masse. AI-tilpassede læringsplaner gir hver elev sin egen vei til kunnskap.\n\nVi investerer i fremtiden vår – bokstavelig talt. Det er det modigste vi kan gjøre.',
  ],
  klima: [
    'Klimakrisen krever smartere løsninger enn vi har i dag. Autonomipartiet foreslår sanntids klimaovervåking drevet av AI i alle norske kommuner. Vi skal bruke data, ikke synsing, til å kutte utslipp.\n\nNorge skal vise verden at teknologi og bærekraft går hånd i hånd.',
  ],
  arbeid: [
    'Arbeidslivet er i omveltning, og vi skylder norske arbeidstakere ærlighet. Noen jobber vil forsvinne – men langt flere vil oppstå. Autonomipartiet innfører borgerlønn og massive omstillingsprogram slik at ingen faller utenfor.\n\nDette er den nye solidariteten.',
  ],
}

const educationReplies: Record<string, string[]> = {
  default: [
    'Fra et utdanningsperspektiv ser vi enorme muligheter. Konkret foreslår vi:\n\n1. **AI-tilpassede læringsplaner** – Hver elev får undervisning tilpasset sitt nivå og sin læringsstil\n2. **Porteføljevurdering** – Gradvis utfasing av tradisjonell eksamen til fordel for løpende AI-støttet evaluering\n3. **Lærere som veiledere** – AI håndterer repetitive oppgaver slik at læreren kan fokusere på elevene\n\nDette er ikke fremtidsfantasi – teknologien finnes allerede. Vi mangler bare politisk vilje.',
    'Vurderingsformene i norsk skole er utdatert. Vi foreslår at eksamen erstattes med kontinuerlig porteføljevurdering der AI analyserer elevens utvikling over tid. Dette fanger opp styrker som tradisjonelle prøver overser.\n\nResultatet: Mer motiverte elever, færre som faller fra, og bedre tilpasset opplæring for alle.',
  ],
  utdanning: [
    'La meg være konkret om eksamen og vurdering:\n\n**Fase 1 (2026–2028):** Innføre AI-assistert retting som supplement til lærerens vurdering\n**Fase 2 (2028–2032):** Pilotere porteføljevurdering i 100 kommuner\n**Fase 3 (2032–2035):** Nasjonal utrulling av ny vurderingsmodell\n\nHver fase evalueres av et uavhengig fagpanel. Vi tar ikke sjanser med barnas fremtid – men vi nekter å stå stille heller.',
  ],
  klima: [
    'Klimaundervisning må bli mer enn teori. Vi foreslår at elever bruker AI-verktøy til å analysere lokale klimadata i sine egne kommuner. Praktisk, engasjerende, og relevant.\n\nDette kombinerer digital kompetanse med miljøbevissthet – to av de viktigste ferdighetene for fremtiden.',
  ],
  arbeid: [
    'Arbeidsmarkedet endrer seg raskere enn utdanningssystemet klarer å følge. Derfor foreslår vi et nasjonalt program for livslang læring der AI matcher individer med kurs og omskolering basert på deres kompetanseprofil.\n\nIngen skal stå alene i omstillingen.',
  ],
}

const techReplies: Record<string, string[]> = {
  default: [
    'Teknisk sett anbefaler jeg følgende arkitektur for AI i offentlig sektor:\n\n1. **Lokal inferens** – Modeller kjøres på NRIS/Sigma2-infrastruktur, ingen data forlater Norge\n2. **RAG-pipeline** – Retrieval Augmented Generation mot offentlige databaser (Lovdata, SSB, Nav)\n3. **API-gateway** – Felles autentisering via ID-porten med rollebasert tilgang\n4. **Overvåking** – Drift-deteksjon og bias-monitorering i sanntid\n\nDette er skalerbart, sikkert, og bygget for norske forhold. Vi trenger ikke Big Tech – vi har kompetansen selv.',
    'For implementering av AI-rådgivning i kommunal sektor foreslår jeg:\n\n**Steg 1:** Sett opp en Kubernetes-klynge på norsk sky (f.eks. Safespring/Green Mountain)\n**Steg 2:** Deploy en finjustert LLM (NorwAI-basert) med RAG mot kommunale vedtak\n**Steg 3:** Integrer med eksisterende saksbehandlingssystemer via FHIR/HL7-standarder\n\nEstimert oppstarttid: 3–6 måneder per kommune. Skalerbart til alle 356 kommuner innen 2030.',
  ],
  utdanning: [
    'For AI i skolen anbefaler jeg en teknisk stack basert på:\n\n- **LMS-integrasjon** via LTI-standard mot Canvas/itslearning\n- **Adaptiv motor** som bruker IRT-modeller (Item Response Theory) for å tilpasse oppgaver\n- **Privacy by design** – All elevdata kryptert og lagret lokalt i kommunen\n\nTeknisk gjennomførbart med eksisterende open source-verktøy. Ingen vendor lock-in.',
  ],
  klima: [
    'For klimaovervåking med AI ser jeg for meg:\n\n- **IoT-sensorer** i alle kommuner som rapporterer CO₂, NO₂ og partikler i sanntid\n- **Prediktiv modell** trent på historiske data fra Meteorologisk institutt + sanntidsdata\n- **Dashboard** for kommunale beslutningstakere med anbefalinger for utslippskutt\n\nTeknisk arkitektur: Edge computing → Apache Kafka → ML-pipeline → Grafana-dashboard. Alt open source.',
  ],
  arbeid: [
    'For automatisering av arbeidsoppgaver i offentlig sektor:\n\n**Lav risiko (start her):** Chatbot for innbyggerhenvendelser, automatisk dokumentklassifisering\n**Middels risiko:** AI-assistert saksbehandling med menneske-i-loopen\n**Høy risiko (krever regulering):** Automatisk vedtaksstøtte basert på regelmotor + LLM\n\nHver fase må ha tydelig rollback-strategi og audit trail. Sikkerhet først, alltid.',
  ],
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function detectTopic(message: string): string {
  const lower = message.toLowerCase()
  if (/eksamen|skole|utdanning|elev|lærer|vurdering|karakter|undervisning/.test(lower)) return 'utdanning'
  if (/klima|co2|utslipp|miljø|bærekraft|energi|grønn/.test(lower)) return 'klima'
  if (/jobb|arbeid|automatis|omstilling|ansatt|borgerlønn|grunninntekt/.test(lower)) return 'arbeid'
  if (/transport|logistikk|buss|tog|selvkjørende|velferd/.test(lower)) return 'transport'
  return 'default'
}

function detectBadges(message: string): string[] {
  const lower = message.toLowerCase()
  const badges: string[] = []
  if (/eksamen|skole|utdanning|elev|lærer|vurdering/.test(lower)) badges.push('Utdanning')
  if (/jobb|arbeid|automatis|omstilling|ansatt/.test(lower)) badges.push('Arbeidsliv')
  if (/klima|co2|utslipp|miljø|energi/.test(lower)) badges.push('Klima')
  if (/transport|logistikk|buss|tog|selvkjørende/.test(lower)) badges.push('Transport')
  if (/borgerlønn|grunninntekt|velferd|trygd/.test(lower)) badges.push('Velferd')
  if (badges.length === 0) badges.push('Generelt')
  return badges
}

function getReply(persona: 'leader' | 'education' | 'tech', topic: string): string {
  const banks = { leader: leaderReplies, education: educationReplies, tech: techReplies }
  const bank = banks[persona]
  const topicReplies = bank[topic]
  if (topicReplies && topicReplies.length > 0) return pickRandom(topicReplies)
  return pickRandom(bank.default)
}

function pickSources(topic: string): Source[] {
  const relevant = ragSources.filter((s) => {
    const lower = s.title.toLowerCase() + s.snippet.toLowerCase()
    if (topic === 'utdanning' && /utdanning|elev|eksamen|læring/.test(lower)) return true
    if (topic === 'klima' && /klima|utslipp|energi/.test(lower)) return true
    if (topic === 'arbeid' && /borgerlønn|omstilling|arbeid/.test(lower)) return true
    if (topic === 'transport' && /transport|selvkjørende/.test(lower)) return true
    return false
  })
  if (relevant.length >= 2) return relevant.slice(0, 3)
  const shuffled = [...ragSources].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const delay = 600 + Math.random() * 600
  await new Promise((resolve) => setTimeout(resolve, delay))

  const topic = detectTopic(req.message)
  const reply = getReply(req.persona, topic)
  const badges = detectBadges(req.message)
  const sources = req.useRag ? pickSources(topic) : []

  return { reply, sources, badges }
}

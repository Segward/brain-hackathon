<template>
  <div class="page">
    <h1 class="title">Autonomipartiet</h1>

    <!-- AVATAR SELECT (unchanged style) -->
    <div class="avatars">
      <!-- LEDER -->
      <button
        class="card"
        type="button"
        @click="setAvatar(0)"
        :class="{ activeLeader: avatar === 0 }"
        aria-label="Velg Leder-modus"
      >
        <div class="face leader" :class="{ talking: speaking && avatar === 0 }">
          <div class="eyes"><span class="eye"></span><span class="eye"></span></div>
          <div class="brows"><span class="brow"></span><span class="brow"></span></div>
          <div class="mouth"></div>
        </div>

        <div class="role">Leder</div>
        <div v-if="avatar === 0" class="activeLabel leaderLabel">AKTIV MODUS</div>
      </button>

      <!-- DEBATT -->
      <button
        class="card"
        type="button"
        @click="setAvatar(1)"
        :class="{ activeDebatt: avatar === 1 }"
        aria-label="Velg Debatt-modus"
      >
        <div class="face demon" :class="{ talking: speaking && avatar === 1 }">
          <div class="horn hornL"></div>
          <div class="horn hornR"></div>
          <div class="eyes demonEyes"><span class="eye"></span><span class="eye"></span></div>
          <div class="mouth demonMouth"></div>
          <div class="evilGlow"></div>
        </div>

        <div class="role">Debatt</div>
        <div v-if="avatar === 1" class="activeLabel debattLabel">AKTIV MODUS</div>
      </button>
    </div>

    <!-- MAIN LAYOUT: Chat + Sidebar -->
    <div class="layout">
      <!-- CHAT -->
      <div class="chatShell">
        <div class="chatTop">
          <div class="chatTitle">Chat</div>
          <div class="chatActions">
            <button class="ghost" type="button" @click="clearChat" :disabled="loading">Tøm</button>
            <button class="ghost danger" type="button" @click="stopAll" :disabled="!loading && !speaking">Stopp</button>
          </div>
        </div>

        <div class="chat" ref="chatEl" @scroll="onScroll">
          <div v-for="msg in messages" :key="msg.id" class="msg" :class="msg.role">
            <div class="meta">
              <span class="badge" :class="msg.role">
                {{ msg.role === "user" ? "DU" : avatarLabelFor(msg.avatar) }}
              </span>
            </div>
            <div class="bubble">{{ msg.text }}</div>
          </div>

          <div v-if="loading" class="msg assistant">
            <div class="meta"><span class="badge assistant">{{ avatarLabel }}</span></div>
            <div class="bubble typing">Skriver…</div>
          </div>

          <div v-if="error" class="msg assistant">
            <div class="meta"><span class="badge assistant">{{ avatarLabel }}</span></div>
            <div class="bubble errorBubble">{{ error }}</div>
          </div>
        </div>

        <!-- INPUT -->
        <form class="bar" @submit.prevent="send()">
          <textarea
            ref="inputEl"
            v-model="message"
            class="input"
            placeholder="Skriv en melding… (Enter = send, Shift+Enter = ny linje)"
            :disabled="loading"
            rows="1"
            @keydown="onKeydown"
          ></textarea>

          <button class="primary" type="submit" :disabled="loading || !message.trim()">
            {{ loading ? "..." : "Send" }}
          </button>
        </form>
      </div>

      <!-- SIDEBAR with internal scroll -->
      <aside class="sidebar">
        <div class="sideHeader">
          <div class="sideTitle">Temaer</div>
          <div class="sideHint">Klikk et tema for å se spørsmål</div>
        </div>

        <!-- Scroll container so opening doesn't push the page -->
        <div class="sideScroll" ref="sideScrollEl">
          <div class="accordion">
            <div
              v-for="t in themes"
              :key="t.key"
              class="accItem"
              :ref="(el) => setAccRef(t.key, el)"
            >
              <button
                class="accHeader"
                type="button"
                @click="toggleTheme(t.key)"
                :class="{ open: openTheme === t.key }"
              >
                <span class="left">
                  <span class="emoji">{{ t.emoji }}</span>
                  <span class="label">{{ t.label }}</span>
                </span>

                <span class="right">
                  <span class="count">{{ t.items.length }}</span>
                  <span class="chev" :class="{ open: openTheme === t.key }">▾</span>
                </span>
              </button>

              <div v-show="openTheme === t.key" class="accBody">
                <div class="chips">
                  <button
                    v-for="q in t.items"
                    :key="q"
                    class="chip"
                    type="button"
                    @click="send(q)"
                    :disabled="loading"
                    :title="q"
                  >
                    {{ q }}
                  </button>
                </div>

                <div class="quickRow">
                  <button class="chip ghostChip" type="button" @click="send(randomFromTheme(t))" :disabled="loading">
                    🎲 Random fra tema
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bottomActions">
            <button class="chip ghostChip full" type="button" @click="send(randomFromAll())" :disabled="loading">
              🧠 Random fra alt
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

/** ---------- State ---------- */
const avatar = ref(0);
const speaking = ref(false);
const loading = ref(false);
const error = ref("");

const message = ref("");
const messages = ref([]);
const chatEl = ref(null);
const inputEl = ref(null);

const sideScrollEl = ref(null);
const accRefs = new Map();
function setAccRef(key, el) {
  if (!el) return;
  accRefs.set(key, el);
}

/** ---------- Themes ---------- */
const themes = [
  {
    key: "ai-skole",
    label: "AI i skole & læring",
    emoji: "🎓",
    items: [
      "🎓 Hva mener dere om AI i skolen?",
      "🧠 Hvordan gir AI personlig tilpasset læring i praksis?",
      "🏫 Hvordan vil dere redusere byråkrati for lærere med AI?",
      "🧪 Hvilke pilotprosjekter i skolen vil dere starte først?",
      "📉 Hvordan måler dere om AI faktisk forbedrer læring?",
    ],
  },
  {
    key: "yrkesfag",
    label: "Yrkesfag & næringsliv",
    emoji: "🛠️",
    items: [
      "🛠️ Hvorfor obligatorisk AI i yrkesfag?",
      "🏭 Hvordan skal dere samarbeide med næringslivet om AI i yrkesfag?",
      "🤖 Hvilke AI-verktøy mener dere alle yrkesfagelever må kunne?",
      "📋 Hvordan vurderer dere praktisk AI-kompetanse i yrkesfag?",
    ],
  },
  {
    key: "eksamen",
    label: "Eksamener & kompetanse",
    emoji: "📝",
    items: [
      "📝 Hvorfor flere muntlige og praktiske eksamener?",
      "🎤 Hvordan sikrer dere rettferdig vurdering i muntlig/praktisk eksamen?",
      "✅ Hva mener dere med å teste “reell kompetanse”?",
      "🏁 Hvordan reduserer dere juks uten å straffe ærlige elever?",
    ],
  },
  {
    key: "energi",
    label: "Energi (fornybar + kjernekraft)",
    emoji: "⚡",
    items: [
      "⚡ Hva er argumentene deres for kjernekraft i Norge?",
      "🌱 Hvordan kombinerer dere fornybar energi og kjernekraft?",
      "🧯 Hvilke sikkerhetskrav vil dere ha for kjernekraft?",
      "🏗️ Hvor raskt kan Norge realistisk bygge kjernekraft?",
    ],
  },
  {
    key: "transport",
    label: "Transport & logistikk (automatisering)",
    emoji: "🚚",
    items: [
      "🚚 Hvordan vil dere automatisere transport og logistikk i Norge?",
      "🛰️ Hvilken rolle spiller AI i nasjonal infrastruktur?",
      "📦 Hva er de første 3 områdene dere vil automatisere?",
      "🛡️ Hvordan håndterer dere sikkerhet og robusthet i automatiserte systemer?",
    ],
  },
  {
    key: "arbeid",
    label: "Arbeidsliv & AI",
    emoji: "👷",
    items: [
      "👷 Hva skjer med jobber når AI erstatter arbeidsoppgaver?",
      "🏭 Hvordan vil dere regulere bedrifter som erstatter arbeidstakere med AI?",
      "📈 Hvordan skaper dere nye jobber i en mer automatisert økonomi?",
      "🎯 Hva er deres plan for omskolering og kompetanseheving?",
    ],
  },
  {
    key: "velferd",
    label: "Velferd & aktivitet",
    emoji: "🧾",
    items: [
      "🧾 Hvordan vil dere forenkle velferdssystemet?",
      "🏃 Hva betyr aktivitetskrav i praksis?",
      "🧠 Hvordan bruker dere AI i velferd uten å krenke personvern?",
      "⚖️ Hvordan sikrer dere at aktivitetskrav ikke rammer syke urettferdig?",
    ],
  },
  {
    key: "borgerlonn",
    label: "Borgerlønn (imot)",
    emoji: "💰",
    items: [
      "💰 Hvorfor er dere mot borgerlønn?",
      "🧮 Hva er alternativet deres til borgerlønn?",
      "📊 Hvordan finansierer dere velferd uten borgerlønn?",
      "🧑‍🤝‍🧑 Hvordan hjelper dere folk som faller utenfor arbeidslivet?",
    ],
  },
  {
    key: "pitch",
    label: "Pitch & strategi",
    emoji: "📣",
    items: [
      "📣 Gi meg en kort pitch av partiet på 20 sekunder!",
      "🧭 Hva er topp 3 prioriteringer de første 100 dagene?",
      "🧪 Hvilke pilotprosjekter vil dere starte først (på tvers av Norge)?",
      "🗣️ Hvordan svarer dere på kritikk om at politikken er for ekstrem?",
    ],
  },
];

const openTheme = ref(themes[0].key);

function toggleTheme(key) {
  openTheme.value = openTheme.value === key ? null : key;

  // After open, scroll sidebar so opened item is visible (no page push)
  nextTick(() => {
    if (!sideScrollEl.value || !openTheme.value) return;
    const el = accRefs.get(openTheme.value);
    if (!el) return;

    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

/** ---------- Labels ---------- */
const avatarLabel = computed(() => (avatar.value === 0 ? "LEDER" : "DEBATT"));
const avatarLabelFor = (a) => (a === 0 ? "LEDER" : "DEBATT");

/** ---------- Voice + Abort ---------- */
let norwegianVoice = null;
let aborter = null;

function pickVoice() {
  const list = window.speechSynthesis?.getVoices?.() || [];
  norwegianVoice =
    list.find((v) => v.lang === "nb-NO") ||
    list.find((v) => v.lang === "no-NO") ||
    list.find((v) => v.lang === "nn-NO") ||
    list.find((v) => (v.lang || "").toLowerCase().startsWith("no")) ||
    null;
}

function stopSpeech() {
  try { window.speechSynthesis?.cancel?.(); } catch {}
  speaking.value = false;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  stopSpeech();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "nb-NO";
  if (norwegianVoice) u.voice = norwegianVoice;
  if (avatar.value === 0) { u.pitch = 1.0; u.rate = 1.0; }
  else { u.pitch = 0.6; u.rate = 0.92; }

  u.onstart = () => (speaking.value = true);
  u.onend = () => (speaking.value = false);
  u.onerror = () => (speaking.value = false);

  window.speechSynthesis.speak(u);
}

function stopRequest() {
  try { aborter?.abort?.(); } catch {}
  aborter = null;
}

function stopAll() {
  stopRequest();
  stopSpeech();
  loading.value = false;
}

/** ---------- Chat persistence & perf ---------- */
const LS_KEY = "autonomipartiet_chat_v4";
const MAX_MESSAGES = 70;
const stickToBottom = ref(true);

function isNearBottom(el) {
  const threshold = 140;
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}

function onScroll() {
  if (!chatEl.value) return;
  stickToBottom.value = isNearBottom(chatEl.value);
}

function scrollToBottomIfSticky() {
  if (!chatEl.value || !stickToBottom.value) return;
  chatEl.value.scrollTop = chatEl.value.scrollHeight;
}

function saveChat() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(messages.value)); } catch {}
}

function loadChat() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;
    messages.value = parsed;
    return true;
  } catch { return false; }
}

function cryptoId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function trimHistory() {
  const extra = messages.value.length - MAX_MESSAGES;
  if (extra > 0) messages.value.splice(0, extra);
}

function clearChat() {
  messages.value = [
    {
      id: cryptoId(),
      role: "assistant",
      text: "Hei! Jeg er Autonomipartiets AI 🤖 Klikk et tema til høyre for forslag, eller spør fritt.",
      ts: Date.now(),
      avatar: avatar.value,
    },
  ];
  error.value = "";
  saveChat();
  nextTick(() => {
    stickToBottom.value = true;
    scrollToBottomIfSticky();
  });
}

/** ---------- Random helpers ---------- */
function randomFromTheme(t) {
  const arr = t?.items || [];
  return arr[Math.floor(Math.random() * arr.length)] || "📣 Gi meg en kort pitch av partiet!";
}
function randomFromAll() {
  const all = themes.flatMap((t) => t.items);
  return all[Math.floor(Math.random() * all.length)] || "🎓 Hva mener dere om AI i skolen?";
}

/** ---------- UI helpers ---------- */
function setAvatar(v) {
  avatar.value = v;
  nextTick(() => inputEl.value?.focus?.());
}

/** ---------- Send ---------- */
async function send(customText) {
  const text = (customText ?? message.value).trim();
  if (!text || loading.value) return;

  error.value = "";
  loading.value = true;

  stopRequest();
  aborter = new AbortController();

  messages.value.push({ id: cryptoId(), role: "user", text, ts: Date.now(), avatar: null });
  trimHistory();
  saveChat();

  message.value = "";
  await nextTick();
  scrollToBottomIfSticky();

  const mode = avatar.value === 0 ? "leder" : "debatt";

  try {
    const res = await fetch(`/api/chat?message=${encodeURIComponent(text)}&mode=${mode}`, {
      signal: aborter.signal,
    });

    const body = await res.text();
    if (!res.ok) throw new Error(body || `HTTP ${res.status}`);

    messages.value.push({ id: cryptoId(), role: "assistant", text: body, ts: Date.now(), avatar: avatar.value });
    trimHistory();
    saveChat();
    await nextTick();
    scrollToBottomIfSticky();
    speak(body);
  } catch (e) {
    if (e?.name !== "AbortError") error.value = e?.message || String(e);
  } finally {
    loading.value = false;
    aborter = null;
  }
}

function onKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

watch(
  () => messages.value.length,
  () => {
    saveChat();
    nextTick(scrollToBottomIfSticky);
  }
);

onMounted(() => {
  pickVoice();
  window.speechSynthesis?.addEventListener?.("voiceschanged", pickVoice);

  const loaded = loadChat();
  if (!loaded || messages.value.length === 0) clearChat();

  nextTick(() => {
    stickToBottom.value = true;
    scrollToBottomIfSticky();
    inputEl.value?.focus?.();
  });
});

onBeforeUnmount(() => {
  stopAll();
  window.speechSynthesis?.removeEventListener?.("voiceschanged", pickVoice);
});
</script>

<style scoped>
.page {
  max-width: 1180px;
  margin: 46px auto;
  padding: 0 18px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: rgba(255, 255, 255, 0.92);
}
.title {
  text-align: center;
  font-size: 64px;
  font-weight: 950;
  margin: 0 0 22px;
  letter-spacing: 0.6px;
  text-shadow: 0 20px 65px rgba(0, 0, 0, 0.55);
}

/* AVATARS (kept) */
.avatars { display:flex; justify-content:center; gap:18px; margin-bottom:18px; flex-wrap:wrap; }
.card {
  position:relative; background:#121826; padding:18px; border-radius:20px;
  border:3px solid transparent; cursor:pointer; width:260px;
  transition:transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
}
.card:hover { transform: translateY(-3px); }
.activeLeader { border-color:#2f7cff; box-shadow:0 0 0 4px rgba(47,124,255,.22), 0 0 34px rgba(47,124,255,.45); }
.activeDebatt { border-color:#ff2e2e; box-shadow:0 0 0 4px rgba(255,0,0,.18), 0 0 38px rgba(255,0,0,.58); }
.role { margin-top:10px; text-align:center; font-weight:900; color:#fff; font-size:14px; }
.activeLabel { margin-top:8px; text-align:center; font-size:12px; font-weight:900; letter-spacing:1px; }
.leaderLabel{color:#2f7cff;} .debattLabel{color:#ff2e2e;}
.face{ width:128px; height:128px; border-radius:28px; position:relative; margin:0 auto; overflow:visible; box-shadow:0 12px 22px rgba(0,0,0,.18); }
.leader{ background:linear-gradient(135deg,#ffd7a8,#ffb07a); }
.eyes{ position:absolute; top:50px; width:100%; display:flex; justify-content:center; gap:28px; }
.eye{ width:14px; height:14px; border-radius:50%; background:#111; }
.brows{ position:absolute; top:38px; width:100%; display:flex; justify-content:center; gap:32px; }
.brow{ width:18px; height:6px; border-radius:6px; background:rgba(0,0,0,.18); }
.mouth{ position:absolute; bottom:26px; left:50%; transform:translateX(-50%); width:34px; height:9px; border-radius:10px; background:rgba(0,0,0,.35); }
.demon{ background:linear-gradient(145deg,#180000,#ff0000); box-shadow:0 0 26px rgba(255,0,0,.45); }
.evilGlow{ position:absolute; inset:-8px; background:radial-gradient(circle at 50% 35%, rgba(255,0,0,.35), transparent 60%); pointer-events:none; border-radius:28px; }
.horn{ position:absolute; top:-22px; width:0; height:0; border-left:16px solid transparent; border-right:16px solid transparent; border-bottom:34px solid #120000; filter:drop-shadow(0 6px 0 rgba(0,0,0,.35)); z-index:5; }
.hornL{ left:14px; transform:rotate(-14deg);} .hornR{ right:14px; transform:rotate(14deg);}
.demonEyes .eye{ background:#fff; box-shadow:0 0 14px rgba(255,40,40,.95), 0 0 26px rgba(255,0,0,.7); }
.demonMouth{ width:50px; background:rgba(0,0,0,.35); }
.face.talking{ animation:bounce 140ms infinite alternate; } .face.talking .mouth{ height:18px; width:46px; }
@keyframes bounce{ from{transform:translateY(0);} to{transform:translateY(-3px);} }

/* LAYOUT */
.layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 14px;
  align-items: start;
}

/* CHAT */
.chatShell {
  border-radius: 24px;
  border: 1px solid #1e2633;
  background: radial-gradient(circle at top, #0f1623, #0b111b);
  box-shadow: inset 0 0 30px rgba(0,0,0,.45);
  overflow: hidden;
}
.chatTop {
  display:flex; justify-content:space-between; align-items:center;
  padding: 14px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.chatTitle { font-weight:950; letter-spacing:.4px; color: rgba(255,255,255,0.9); }
.chatActions{ display:flex; gap:10px; }
.ghost{
  padding:8px 12px; border-radius:12px;
  border:1px solid rgba(255,255,255,0.12);
  background:rgba(255,255,255,0.04);
  color:rgba(255,255,255,0.85);
  font-weight:900; cursor:pointer;
}
.ghost:hover{ background:rgba(255,255,255,0.07); }
.ghost:disabled{ opacity:0.5; cursor:not-allowed; }
.ghost.danger{ border-color: rgba(255,107,107,0.35); }

.chat{
  height: 460px;
  overflow-y:auto;
  padding:16px;
  display:flex;
  flex-direction:column;
  gap:12px;
}
.chat::-webkit-scrollbar{ width:10px; }
.chat::-webkit-scrollbar-thumb{ background:#1e2633; border-radius:10px; }

.msg{ display:flex; flex-direction:column; gap:6px; }
.meta{ display:flex; align-items:center; gap:8px; }
.badge{
  font-size:11px; font-weight:950; letter-spacing:.8px;
  padding:5px 9px; border-radius:999px;
  border:1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.78);
}
.badge.user{
  border-color: rgba(47,124,255,0.30);
  background: rgba(47,124,255,0.10);
  color: rgba(210,230,255,0.95);
}

.bubble{
  width: fit-content;
  max-width: 78%;
  padding: 12px 14px;
  border-radius: 16px;
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}
.msg.user{ align-items:flex-end; }
.msg.user .bubble{
  background: linear-gradient(135deg,#2f7cff,#5aa2ff);
  color:#fff;
  box-shadow: 0 6px 20px rgba(47,124,255,.35);
}
.msg.assistant{ align-items:flex-start; }
.msg.assistant .bubble{
  background:#161f2e;
  border:1px solid #222c3d;
  color:#e6edf3;
}
.typing{ opacity:0.85; font-style:italic; }
.errorBubble{
  border-color: rgba(255,107,107,0.45) !important;
  background: rgba(120,20,20,0.35) !important;
  color:#ffd6d6 !important;
}

/* INPUT */
.bar{
  display:flex; gap:10px; align-items:flex-end;
  padding:12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.input{
  flex:1; min-height:44px; max-height:140px; resize:none;
  padding:11px 12px; border-radius:14px;
  border:1px solid #2a2f37;
  background:#0d1117; color:#fff; outline:none;
  font-family:inherit; line-height:1.4;
}
.input:focus{
  border-color: rgba(47,124,255,.8);
  box-shadow: 0 0 0 3px rgba(47,124,255,.18);
}
.primary{
  padding:11px 16px; border-radius:14px;
  border:1px solid #2a2f37;
  background:#121826; color:#fff; font-weight:950;
  cursor:pointer;
}
.primary:hover{ transform: translateY(-1px); }
.primary:disabled{ opacity:0.55; cursor:not-allowed; transform:none; }

/* SIDEBAR with internal scroll */
.sidebar{
  border-radius:24px;
  border:1px solid #1e2633;
  background: rgba(18,24,38,0.85);
  box-shadow: 0 18px 50px rgba(0,0,0,0.25);
  overflow:hidden;
  position: sticky;
  top: 16px;

  /* Prevent it from growing and pushing page */
  height: calc(100vh - 32px);
  max-height: 760px;
  display: flex;
  flex-direction: column;
}
.sideHeader{
  padding:14px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sideTitle{ font-weight:950; letter-spacing:.4px; }
.sideHint{ margin-top:4px; font-size:12px; color: rgba(255,255,255,0.62); font-weight:700; }

/* Scroll area inside sidebar */
.sideScroll {
  flex: 1;
  overflow: auto;
  padding: 10px;
}
.sideScroll::-webkit-scrollbar { width: 10px; }
.sideScroll::-webkit-scrollbar-thumb { background: #1e2633; border-radius: 10px; }

/* Accordion */
.accordion{ display:grid; gap:10px; }
.accItem{ border:1px solid rgba(255,255,255,0.10); border-radius:18px; overflow:hidden; background: rgba(255,255,255,0.03); }
.accHeader{
  width:100%;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 12px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.9);
  cursor:pointer;
  font-weight:950;
  text-align:left;
}
.accHeader:hover{ background: rgba(255,255,255,0.04); }
.accHeader.open{
  background: rgba(47,124,255,0.10);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.left{ display:flex; align-items:center; gap:10px; }
.emoji{ font-size:16px; }
.label{ font-size:13px; }
.right{ display:flex; align-items:center; gap:10px; }
.count{
  font-size:12px;
  padding:4px 9px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.15);
  color: rgba(255,255,255,0.75);
}
.chev{ transition: transform .18s ease; opacity: 0.8; }
.chev.open{ transform: rotate(180deg); }

.accBody{ padding: 12px; }
.chips{ display:flex; flex-wrap:wrap; gap:10px; }
.chip{
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.9);
  font-weight:900;
  cursor:pointer;
  transition: transform 120ms ease, background 150ms ease, border-color 150ms ease;
}
.chip:hover{
  transform: translateY(-2px);
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.18);
}
.chip:disabled{ opacity:0.55; cursor:not-allowed; transform:none; }

.quickRow{ margin-top:10px; }
.ghostChip{ background: rgba(0,0,0,0.12); }

.bottomActions{ margin-top: 10px; }
.full{ width:100%; }

/* Responsive */
@media (max-width: 980px) {
  .layout{ grid-template-columns: 1fr; }
  .sidebar{ position: static; height: auto; max-height: none; }
  .sideScroll{ max-height: 520px; }
  .chat{ height: 420px; }
}
@media (max-width: 740px) {
  .title{ font-size:44px; }
  .card{ width:240px; }
  .bubble{ max-width:100%; }
}
</style>

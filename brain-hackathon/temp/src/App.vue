<template>
  <div class="page">
    <header class="header">
      <div class="header-content">
        <h1 class="title">Autonomipartiet</h1>
        <p class="subtitle">Framtidas politikk med kunstig intelligens</p>
      </div>
    </header>

    <div class="container">
      <main class="main-content">
        <div class="avatars">
      <!-- LEDER -->
      <button
        class="card"
        type="button"
        @click="avatar = 0"
        :class="{ activeLeader: avatar === 0 }"
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
        @click="avatar = 1"
        :class="{ activeDebatt: avatar === 1 }"
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

    <form class="bar" @submit.prevent="send">
      <input v-model="message" placeholder="Skriv en melding…" autocomplete="off" />
      <button type="submit" :disabled="loading || !message.trim()">
        {{ loading ? "..." : "Send" }}
      </button>
      <button type="button" @click="stop" :disabled="!speaking">Stopp</button>
    </form>

    <div class="answer">
      <div class="answerTitle">Svar</div>
      <div v-if="response" class="answerBody">{{ response }}</div>
      <div v-else class="muted">Ingen svar ennå.</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
      </main>

      <SuggestionBar @select="selectSuggestion" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import SuggestionBar from "./SuggestionBar.vue";

const message = ref("Hei!");
const response = ref("");
const error = ref("");
const loading = ref(false);

const speaking = ref(false);
const avatar = ref(0);

let norwegianVoice = null;

function pickVoice() {
  const list = window.speechSynthesis?.getVoices?.() || [];
  norwegianVoice =
    list.find((v) => v.lang === "nb-NO") ||
    list.find((v) => v.lang === "no-NO") ||
    list.find((v) => v.lang === "nn-NO") ||
    list.find((v) => (v.lang || "").toLowerCase().startsWith("no")) ||
    null;
}

function stop() {
  try {
    window.speechSynthesis?.cancel?.();
  } catch {}
  speaking.value = false;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  stop();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "nb-NO";
  if (norwegianVoice) u.voice = norwegianVoice;

  // Leder vs Debatt
  if (avatar.value === 0) {
    u.pitch = 1.0;
    u.rate = 1.0;
  } else {
    // mørkere/roligere
    u.pitch = 0.6;
    u.rate = 0.92;
  }

  u.onstart = () => (speaking.value = true);
  u.onend = () => (speaking.value = false);
  u.onerror = () => (speaking.value = false);

  window.speechSynthesis.speak(u);
}

async function send() {
  error.value = "";
  response.value = "";
  loading.value = true;

  const mode = avatar.value === 0 ? "leder" : "debatt";

  try {
    const res = await fetch(
      `/api/chat?message=${encodeURIComponent(message.value)}&mode=${mode}`
    );
    const body = await res.text();
    if (!res.ok) throw new Error(body || `HTTP ${res.status}`);

    response.value = body;
    speak(body);
  } catch (e) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}

function selectSuggestion(suggestion) {
  message.value = suggestion;
  nextTick(() => {
    send();
  });
}

onMounted(() => {
  pickVoice();
  window.speechSynthesis?.addEventListener?.("voiceschanged", pickVoice);
});
</script>

<style scoped>
/* Layout */
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: #eee;
  overflow: hidden;
}

.header {
  background: linear-gradient(180deg, rgba(47, 124, 255, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid #2a2a2a;
  padding: 40px 0 28px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 40px;
  text-align: center;
}

.title {
  font-size: 64px;
  font-weight: 900;
  margin: 0 0 10px;
  letter-spacing: 1.5px;
  background: linear-gradient(135deg, #fff 0%, #bbb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 17px;
  color: #888;
  letter-spacing: 0.8px;
}

.container {
  flex: 1;
  margin: 0;
  padding: 32px 38px;
  display: flex;
  gap: 36px;
  align-items: stretch;
  min-height: 0;
  overflow: visible;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  max-height: 100%;
}

/* Avatars row */
.avatars {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 0;
  flex-wrap: wrap;
  flex-shrink: 0;
  min-height: fit-content;
}

/* Cards (obvious selected state) */
.card {
  position: relative;
  background: #f2f2f2;
  padding: 24px;
  border-radius: 24px;
  border: 3px solid transparent;
  cursor: pointer;
  width: 240px;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease,
    border-color 180ms ease;
}
.card:hover {
  transform: translateY(-5px);
}

.activeLeader {
  border-color: #2f7cff;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(47, 124, 255, 0.22), 0 0 34px rgba(47, 124, 255, 0.45);
}

.activeDebatt {
  border-color: #ff2e2e;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.18), 0 0 38px rgba(255, 0, 0, 0.58);
}

.role {
  margin-top: 14px;
  text-align: center;
  font-weight: 900;
  color: #111;
  font-size: 18px;
}

.activeLabel {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 1.2px;
}
.leaderLabel { color: #2f7cff; }
.debattLabel { color: #ff2e2e; }

/* Faces */
.face {
  width: 140px;
  height: 160px;
  border-radius: 36px;
  position: relative;
  margin: 0 auto;
  overflow: visible;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
}

/* LEDER */
.leader {
  background: linear-gradient(135deg, #ffd7a8, #ffb07a);
}

.eyes {
  position: absolute;
  top: 62px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 36px;
}
.eye {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #111;
}

.brows {
  position: absolute;
  top: 48px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 42px;
}
.brow {
  width: 22px;
  height: 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.18);
}

.mouth {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 42px;
  height: 11px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
}

/* DEMON */
.demon {
  background: linear-gradient(145deg, #180000, #ff0000);
  box-shadow: 0 0 26px rgba(255, 0, 0, 0.45);
}
.evilGlow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle at 50% 35%, rgba(255,0,0,.35), transparent 60%);
  pointer-events: none;
  border-radius: 28px;
}

.horn {
  position: absolute;
  top: -28px;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 44px solid #120000;
  filter: drop-shadow(0 8px 0 rgba(0,0,0,.35));
  z-index: 5;
}
.hornL { left: 18px; transform: rotate(-14deg); }
.hornR { right: 18px; transform: rotate(14deg); }

.demonEyes .eye {
  background: #fff;
  box-shadow: 0 0 14px rgba(255, 40, 40, 0.95), 0 0 26px rgba(255, 0, 0, 0.7);
}

.demonMouth {
  width: 62px;
  background: rgba(0, 0, 0, 0.35);
}

/* Talking animation */
.face.talking { animation: bounce 140ms infinite alternate; }
.face.talking .mouth { height: 22px; width: 56px; }

@keyframes bounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-3px); }
}

/* Input bar */
.bar {
  display: flex;
  gap: 13px;
  align-items: center;
  margin-bottom: 0;
  flex-shrink: 0;
  flex-wrap: wrap;
  min-height: fit-content;
}

input {
  flex: 1;
  padding: 13px 17px;
  border-radius: 13px;
  border: 1px solid #444;
  background: #2f2f2f;
  color: #fff;
  outline: none;
  font-size: 15px;
}

button {
  padding: 13px 22px;
  border-radius: 13px;
  border: 1px solid #333;
  background: #1f1f1f;
  color: #fff;
  cursor: pointer;
  transition: all 180ms ease;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

button:hover:not(:disabled) {
  background: #2a2a2a;
  border-color: #444;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Answer box */
.answer {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border-radius: 24px;
  padding: 28px;
  color: #000;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  border: 1px solid #e0e0e0;
  width: 100%;
}

.answerTitle {
  text-align: center;
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 16px;
  font-size: 26px;
  flex-shrink: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #2f7cff 0%, #1e5fbf 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.answerBody {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  color: #1a1a1a;
  box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  font-size: 18px;
  min-height: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.muted {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #999;
  font-size: 18px;
  padding: 24px;
  min-height: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.06);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.error {
  margin-top: 12px;
  color: #b00020;
  font-weight: 800;
  font-size: 15px;
}

/* Responsive */
@media (max-width: 1200px) {
  .container {
    padding: 24px 12px;
  }
}

@media (max-width: 960px) {
  .title { font-size: 42px; }
  .card { width: 180px; }
  .bar { flex-wrap: wrap; }
  button { flex: 1; }
  
  .container {
    flex-direction: column;
  }
}

@media (max-width: 740px) {
  .title { font-size: 36px; }
  .subtitle { font-size: 14px; }
  .header { padding: 24px 0 16px; }
  .card { width: 160px; }
  .bar { flex-wrap: wrap; }
  button { flex: 1; min-width: 80px; }
}
</style>

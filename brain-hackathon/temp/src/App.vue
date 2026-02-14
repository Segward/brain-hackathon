<template>
  <div class="page">
    <h1 class="title">Autonomipartiet</h1>

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
        <div v-if="avatar === 0" class="activeLabel">AKTIV MODUS</div>
      </button>

      <!-- DEBATT / EVIL -->
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
        </div>

        <div class="role">Debatt</div>
        <div v-if="avatar === 1" class="activeLabel red">AKTIV MODUS</div>
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
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

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

  // Leder vs Debatt voice (Debatt is darker)
  if (avatar.value === 0) {
    u.pitch = 1.0;
    u.rate = 1.0;
  } else {
    u.pitch = 0.6;
    u.rate = 0.9;
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

onMounted(() => {
  pickVoice();
  window.speechSynthesis?.addEventListener?.("voiceschanged", pickVoice);
});
</script>

<style scoped>
/* Layout */
.page {
  max-width: 920px;
  margin: 50px auto;
  padding: 0 18px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: #eee;
}

.title {
  text-align: center;
  font-size: 56px;
  font-weight: 900;
  margin: 0 0 26px;
  letter-spacing: 0.5px;
}

/* Avatars row */
.avatars {
  display: flex;
  justify-content: center;
  gap: 22px;
  margin-bottom: 18px;
}

/* Cards (strong selected state) */
.card {
  position: relative;
  background: #f2f2f2;
  padding: 18px;
  border-radius: 20px;
  border: 3px solid transparent;
  cursor: pointer;
  width: 190px;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease,
    border-color 180ms ease;
}

.card:hover {
  transform: translateY(-3px);
}

.activeLeader {
  border-color: #2f7cff;
  box-shadow: 0 0 0 4px rgba(47, 124, 255, 0.25), 0 0 30px rgba(47, 124, 255, 0.45);
  background: #fff;
}

.activeDebatt {
  border-color: #ff2e2e;
  box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.25), 0 0 35px rgba(255, 0, 0, 0.55);
  background: #fff;
}

.role {
  margin-top: 10px;
  text-align: center;
  font-weight: 900;
  color: #111;
  font-size: 14px;
}

/* Active mode label */
.activeLabel {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 900;
  color: #2f7cff;
  letter-spacing: 1px;
}

.activeLabel.red {
  color: #ff2e2e;
}

/* Faces */
.face {
  width: 122px;
  height: 122px;
  border-radius: 28px;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.18);
  overflow: visible;
}

.leader {
  background: linear-gradient(135deg, #ffd7a8, #ffb07a);
}

.eyes {
  position: absolute;
  top: 46px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 26px;
}

.eye {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #111;
}

.brows {
  position: absolute;
  top: 34px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 30px;
}
.brow {
  width: 18px;
  height: 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
}

.mouth {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 9px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
}

/* Demon (more evil) */
.demon {
  background: linear-gradient(145deg, #2a0000, #ff0000);
  box-shadow: 0 0 26px rgba(255, 0, 0, 0.45);
}

.horn {
  position: absolute;
  top: -18px;
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-bottom: 28px solid #160000;
  filter: drop-shadow(0 6px 0 rgba(0,0,0,.25));
}

.hornL {
  left: 16px;
  transform: rotate(-14deg);
}
.hornR {
  right: 16px;
  transform: rotate(14deg);
}

.demonEyes .eye {
  background: #fff;
  box-shadow: 0 0 14px rgba(255, 40, 40, 0.95), 0 0 26px rgba(255, 0, 0, 0.7);
}

.demonMouth {
  width: 48px;
  background: rgba(0, 0, 0, 0.35);
}

/* Talking animation */
.face.talking {
  animation: bounce 140ms infinite alternate;
}
.face.talking .mouth {
  height: 18px;
  width: 46px;
}
@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-3px);
  }
}

/* Input bar */
.bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 18px;
}

input {
  flex: 1;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid #444;
  background: #2f2f2f;
  color: #fff;
  outline: none;
}

button {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #333;
  background: #1f1f1f;
  color: #fff;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Answer box */
.answer {
  background: #f2f2f2;
  border-radius: 20px;
  padding: 18px;
  color: #000;
}

.answerTitle {
  text-align: center;
  font-weight: 900;
  color: #000;
  margin-bottom: 10px;
  font-size: 18px;
}

.answerBody {
  background: #fff;
  padding: 16px;
  border-radius: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #000;
}

.muted {
  text-align: center;
  color: #333;
}

.error {
  margin-top: 10px;
  color: #b00020;
  font-weight: 800;
}

/* Responsive */
@media (max-width: 640px) {
  .title {
    font-size: 40px;
  }
  .avatars {
    gap: 12px;
  }
  .card {
    width: 160px;
    padding: 14px;
  }
  .bar {
    flex-wrap: wrap;
  }
  button {
    flex: 1;
  }
}
</style>

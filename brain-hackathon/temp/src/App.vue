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
        <div v-if="avatar === 0" class="activeLabel leaderLabel">AKTIV MODUS</div>
      </button>

      <!-- DEBATT / DEMON -->
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

      <!-- GOJO-STYLE -->
      <button
        class="card"
        type="button"
        @click="avatar = 2"
        :class="{ activeGojo: avatar === 2 }"
      >
        <div class="face gojo" :class="{ talking: speaking && avatar === 2 }">
          <!-- spiky hair -->
          <div class="hairBack"></div>
          <div class="hairSpikes">
            <span class="spike s1"></span><span class="spike s2"></span><span class="spike s3"></span>
            <span class="spike s4"></span><span class="spike s5"></span><span class="spike s6"></span>
            <span class="spike s7"></span><span class="spike s8"></span><span class="spike s9"></span>
          </div>

          <!-- blindfold -->
          <div class="blindfold"></div>

          <!-- subtle nose line -->
          <div class="nose"></div>

          <!-- mouth -->
          <div class="mouth gojoMouth"></div>

          <!-- purple collar -->
          <div class="collar"></div>
          <div class="collarShadow"></div>
        </div>

        <div class="role">Gojo</div>
        <div v-if="avatar === 2" class="activeLabel gojoLabel">AKTIV MODUS</div>
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

  // Leder vs Debatt vs Gojo
  if (avatar.value === 0) {
    u.pitch = 1.0;
    u.rate = 1.0;
  } else if (avatar.value === 1) {
    // mørkere stemme
    u.pitch = 0.6;
    u.rate = 0.9;
  } else {
    // litt “skarpere/lysere” men fortsatt norsk
    u.pitch = 1.15;
    u.rate = 1.02;
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

  const mode = avatar.value === 0 ? "leder" : avatar.value === 1 ? "debatt" : "gojo";

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
  max-width: 980px;
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
  letter-spacing: 0.6px;
}

/* Avatars row */
.avatars {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

/* Cards (obvious selected state) */
.card {
  position: relative;
  background: #f2f2f2;
  padding: 18px;
  border-radius: 20px;
  border: 3px solid transparent;
  cursor: pointer;
  width: 200px;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease,
    border-color 180ms ease;
}
.card:hover {
  transform: translateY(-3px);
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

.activeGojo {
  border-color: #7b5cff;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(123, 92, 255, 0.18), 0 0 38px rgba(123, 92, 255, 0.55);
}

.role {
  margin-top: 10px;
  text-align: center;
  font-weight: 900;
  color: #111;
  font-size: 14px;
}

.activeLabel {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
}
.leaderLabel { color: #2f7cff; }
.debattLabel { color: #ff2e2e; }
.gojoLabel { color: #7b5cff; }

/* Faces */
.face {
  width: 128px;
  height: 128px;
  border-radius: 28px;
  position: relative;
  margin: 0 auto;
  overflow: visible; /* horn/hair can stick out */
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.18);
}

/* LEDER */
.leader {
  background: linear-gradient(135deg, #ffd7a8, #ffb07a);
}

.eyes {
  position: absolute;
  top: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 28px;
}
.eye {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #111;
}

.brows {
  position: absolute;
  top: 38px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 32px;
}
.brow {
  width: 18px;
  height: 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.18);
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
  top: -22px;
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 34px solid #120000;
  filter: drop-shadow(0 6px 0 rgba(0,0,0,.35));
  z-index: 5;
}
.hornL { left: 14px; transform: rotate(-14deg); }
.hornR { right: 14px; transform: rotate(14deg); }

.demonEyes .eye {
  background: #fff;
  box-shadow: 0 0 14px rgba(255, 40, 40, 0.95), 0 0 26px rgba(255, 0, 0, 0.7);
}

.demonMouth {
  width: 50px;
  background: rgba(0, 0, 0, 0.35);
}

/* GOJO-STYLE (inspirert: hvitt spiky hår + blindfold + lilla krage) */
.gojo {
  background: linear-gradient(135deg, #f6d7b6, #f0b48c);
}

/* hair base */
.hairBack {
  position: absolute;
  left: 10px;
  right: 10px;
  top: -6px;
  height: 44px;
  border-radius: 22px 22px 14px 14px;
  background: linear-gradient(#ffffff, #e7e7ef);
  box-shadow: 0 10px 18px rgba(0,0,0,.08);
  z-index: 3;
}

/* spikes */
.hairSpikes {
  position: absolute;
  top: -28px;
  left: 8px;
  right: 8px;
  height: 60px;
  z-index: 4;
  pointer-events: none;
}
.spike {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 30px solid #ffffff;
  filter: drop-shadow(0 4px 0 rgba(0,0,0,.12));
}
.s1{ left: 6px;  top: 22px; transform: rotate(-28deg) scale(0.95); }
.s2{ left: 22px; top: 12px; transform: rotate(-18deg) scale(1.05); }
.s3{ left: 40px; top: 6px;  transform: rotate(-8deg)  scale(1.18); }
.s4{ left: 58px; top: 2px;  transform: rotate(2deg)   scale(1.22); }
.s5{ left: 76px; top: 6px;  transform: rotate(12deg)  scale(1.18); }
.s6{ left: 94px; top: 12px; transform: rotate(20deg)  scale(1.05); }
.s7{ left: 110px; top: 22px; transform: rotate(30deg) scale(0.95); }
.s8{ left: 34px; top: 20px; transform: rotate(-6deg)  scale(0.92); opacity:.9; }
.s9{ left: 86px; top: 20px; transform: rotate(10deg)  scale(0.92); opacity:.9; }

/* blindfold */
.blindfold {
  position: absolute;
  top: 48px;
  left: 14px;
  right: 14px;
  height: 28px;
  border-radius: 16px;
  background: linear-gradient(#0f0f12, #1a1a22);
  box-shadow: 0 0 0 2px rgba(255,255,255,.06), 0 10px 18px rgba(0,0,0,.25);
  z-index: 5;
}
.blindfold::after {
  content: "";
  position: absolute;
  inset: 4px 8px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,0));
  opacity: .8;
}

/* nose + mouth */
.nose {
  position: absolute;
  top: 82px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 10px;
  border-left: 2px solid rgba(0,0,0,.18);
  border-radius: 8px;
  z-index: 2;
}
.gojoMouth {
  width: 30px;
  height: 7px;
  background: rgba(0,0,0,.28);
  bottom: 30px;
  z-index: 2;
}

/* purple collar */
.collar {
  position: absolute;
  left: -6px;
  right: -6px;
  bottom: -6px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1b102b, #2b1550);
  z-index: 1;
  box-shadow: 0 -6px 14px rgba(0,0,0,.22);
}
.collarShadow {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 18px;
  height: 20px;
  border-radius: 14px;
  background: rgba(255,255,255,.06);
  z-index: 2;
}

/* Talking animation */
.face.talking { animation: bounce 140ms infinite alternate; }
.face.talking .mouth { height: 18px; width: 46px; }
.gojo.talking .gojoMouth { width: 34px; height: 14px; border-radius: 12px; }

@keyframes bounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-3px); }
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
@media (max-width: 740px) {
  .title { font-size: 42px; }
  .card { width: 180px; }
  .bar { flex-wrap: wrap; }
  button { flex: 1; }
}
</style>

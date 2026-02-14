<template>
  <div class="page">
    <h1 class="title">Autonomipartiet</h1>

    <div class="avatars">
      <!-- LEDER -->
      <button class="card" @click="avatar = 0" :class="{ active: avatar === 0 }">
        <div class="face leader" :class="{ talking: speaking && avatar === 0 }">
          <div class="eyes"><span class="eye"></span><span class="eye"></span></div>
          <div class="brows"><span class="brow"></span><span class="brow"></span></div>
          <div class="mouth"></div>
        </div>
        <div class="role">Leder</div>
      </button>

      <!-- DEBATT / EVIL -->
      <button class="card" @click="avatar = 1" :class="{ active: avatar === 1 }">
        <div class="face demon" :class="{ talking: speaking && avatar === 1 }">
          <div class="horn hornL"></div>
          <div class="horn hornR"></div>
          <div class="eyes demonEyes"><span class="eye"></span><span class="eye"></span></div>
          <div class="mouth demonMouth"></div>
        </div>
        <div class="role">Debatt</div>
      </button>
    </div>

    <form class="bar" @submit.prevent="send">
      <input v-model="message" placeholder="Skriv en melding…" />
      <button :disabled="loading || !message.trim()">Send</button>
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
import { ref, onMounted } from "vue";

const message = ref("Hei!");
const response = ref("");
const error = ref("");
const loading = ref(false);
const speaking = ref(false);
const avatar = ref(0);

let norwegianVoice = null;

function pickVoice() {
  const list = speechSynthesis.getVoices();
  norwegianVoice = list.find(v => v.lang === "nb-NO") || list.find(v => v.lang?.startsWith("no"));
}

function stop() {
  speechSynthesis.cancel();
  speaking.value = false;
}

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "nb-NO";
  if (norwegianVoice) u.voice = norwegianVoice;

  // Leder vs Debatt voice
  if (avatar.value === 0) {
    u.pitch = 1;
    u.rate = 1;
  } else {
    u.pitch = 0.6;   // mørkere stemme
    u.rate = 0.9;
  }

  u.onstart = () => speaking.value = true;
  u.onend = () => speaking.value = false;
  speechSynthesis.speak(u);
}

async function send() {
  loading.value = true;
  const mode = avatar.value === 0 ? "leder" : "debatt";
  try {
    const res = await fetch(`/api/chat?message=${encodeURIComponent(message.value)}&mode=${mode}`);
    const text = await res.text();
    response.value = text;
    speak(text);
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
});
</script>

<style scoped>
/* Background */
.page {
  max-width: 920px;
  margin: 50px auto;
  font-family: system-ui;
  color: #eee;
}

/* Title */
.title {
  text-align: center;
  font-size: 54px;
  font-weight: 900;
  margin-bottom: 25px;
  letter-spacing: 1px;
}

/* Avatar cards */
.avatars { display:flex; justify-content:center; gap:26px; margin-bottom:20px; }

.card {
  background:#f2f2f2;
  padding:18px;
  border-radius:20px;
  border:2px solid transparent;
  cursor:pointer;
  transition:.2s;
}
.card:hover { transform:translateY(-3px); }
.card.active { border-color:#000; background:#fff; }

.role { text-align:center; margin-top:10px; font-weight:800; color:#111; }

/* Faces */
.face { width:120px;height:120px;border-radius:28px;position:relative;margin:auto;box-shadow:0 10px 20px rgba(0,0,0,.2); }
.leader { background:linear-gradient(135deg,#ffd7a8,#ffb07a); }

.eyes { position:absolute; top:45px; width:100%; display:flex; justify-content:center; gap:26px;}
.eye { width:14px;height:14px;border-radius:50%; background:#111; }

.brows { position:absolute; top:34px; width:100%; display:flex; justify-content:center; gap:30px;}
.brow { width:18px;height:6px;border-radius:6px;background:rgba(0,0,0,.2); }

.mouth { position:absolute; bottom:26px; left:50%; transform:translateX(-50%); width:34px;height:8px;border-radius:8px;background:#333; }

/* EVIL AVATAR */
.demon {
  background:linear-gradient(145deg,#5c0000,#ff0000);
  box-shadow:0 0 25px rgba(255,0,0,.4);
}
.horn {
  position:absolute; top:-16px;
  border-left:14px solid transparent;
  border-right:14px solid transparent;
  border-bottom:26px solid #300;
}
.hornL{ left:18px; transform:rotate(-12deg); }
.hornR{ right:18px; transform:rotate(12deg); }

.demonEyes .eye {
  background:#fff;
  box-shadow:0 0 14px red, 0 0 24px red;
}

.demonMouth { width:44px; background:#200; }

/* Talking animation */
.face.talking { animation:bounce .14s infinite alternate; }
.face.talking .mouth { height:18px; width:44px; }
@keyframes bounce { from{transform:translateY(0);} to{transform:translateY(-3px);} }

/* Input bar */
.bar { display:flex; gap:10px; margin-bottom:18px; }
input {
  flex:1; padding:12px; border-radius:12px; border:1px solid #444;
  background:#2f2f2f; color:#fff;
}
button {
  padding:10px 16px; border-radius:12px; border:none;
  background:#1f1f1f; color:#fff; cursor:pointer;
}

/* Answer */
.answer { background:#f2f2f2; border-radius:20px; padding:18px; color:#000; }
.answerTitle { text-align:center; font-weight:900; margin-bottom:10px; }
.answerBody { background:#fff; padding:16px; border-radius:14px; line-height:1.6; }
</style>

<template>
  <div class="app">
    <nav class="nav">
      <div class="logo">
        <span class="logo-icon">🏛️</span>
        <span class="logo-text">Autonomipartiet</span>
      </div>
      <div class="nav-links">
        <router-link to="/">Chat</router-link>
        <router-link to="/program">Program</router-link>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Update page title dynamically based on route
  document.title = 'Autonomipartiet - AI Chat';
});
</script>

<style>
/* ===== GLOBAL APP DARK THEME ===== */

/* Page background (the important part) */
html, body {
  margin: 0;
  padding: 0;
  background: #0d1117;
  color: rgba(255,255,255,0.92);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* Vue root wrapper */
.app {
  min-height: 100vh;
  background: #0d1117;
}

/* ===== NAVBAR ===== */

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(18,24,38,0.5);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 20px;
  color: #fff;
  letter-spacing: 0.3px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  background: linear-gradient(135deg, #2f7cff, #5aa2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 24px;
}

/* Links */
.nav-links a {
  position: relative;
  color: #9aa4af;
  font-weight: 700;
  text-decoration: none;
  font-size: 16px;
  transition: color .2s ease;
  padding: 8px 12px;
  border-radius: 8px;
}

/* Hover glow */
.nav-links a:hover {
  color: #ffffff;
  background: rgba(47,124,255,0.1);
}

/* Active route */
.nav-links a.router-link-active {
  color: #ffffff;
  background: rgba(47,124,255,0.15);
  border-bottom: 2px solid #2f7cff;
}

/* Smooth page spacing */
#app {
  min-height: 100vh;
}

/* Responsive */
@media (max-width: 640px) {
  .nav {
    flex-direction: column;
    gap: 14px;
    padding: 14px 18px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .nav-links {
    gap: 12px;
  }
}
</style>

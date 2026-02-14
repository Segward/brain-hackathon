<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/program">Program</router-link>
    </nav>

    <router-view />
  </div>
</template>

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
  justify-content: center;
  gap: 28px;
  padding: 22px 0;
}

/* Links */
.nav a {
  position: relative;
  color: #9aa4af;
  font-weight: 700;
  text-decoration: none;
  font-size: 18px;
  transition: color .2s ease;
}

/* Hover glow */
.nav a:hover {
  color: #ffffff;
}

/* Active route */
.nav a.router-link-active {
  color: #ffffff;
}

/* Underline animation */
.nav a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0%;
  height: 2px;
  background: #6ea2ff;
  transition: width .25s ease;
}

.nav a:hover::after {
  width: 100%;
}

.nav a.router-link-active::after {
  width: 100%;
}

/* Smooth page spacing */
#app {
  min-height: 100vh;
}
</style>

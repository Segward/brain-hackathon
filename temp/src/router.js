import { createRouter, createWebHistory } from 'vue-router'

import Home from './components/home.vue'
import Program from './components/program.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Autonomipartiet - AI Chat' }
  },
  {
    path: '/program',
    name: 'program',
    component: Program,
    meta: { title: 'Autonomipartiet - Partiprogram' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title on route change
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Autonomipartiet'
  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

import Home from './components/home.vue'
import Program from './components/program.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/program',
    name: 'program',
    component: Program
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

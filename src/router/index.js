import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/login.vue'
import Bar from '../pages/main/bar.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/main',
    name: 'bar',
    component: Bar,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../pages/login.vue'
import Bar from '../pages/main/bar.vue'
import Home from '../pages/main/home.vue'
import Transmission from '../pages/main/item/transmission.vue'
import Energy from '../pages/main/item/energy.vue'
import Unit from '../pages/main/item/unit.vue'

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
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: { title: '首页' },
      },
      {
        path: 'transmission',
        name: 'transmission',
        component: Transmission,
        meta: { title: '输电监控' },
      },
      {
        path: 'energy',
        name: 'energy',
        component: Energy,
        meta: { title: '能耗分析' },
      },
      {
        path: 'unit',
        name: 'unit',
        component: Unit,
        meta: { title: '单元管理' },
      },
    ],
  },
]

const router = createRouter({
  // hash 模式：纯静态托管无需服务器重写规则，刷新子页面不会 404
  history: createWebHashHistory(),
  routes,
})

export default router

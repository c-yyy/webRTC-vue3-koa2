import { createRouter, createWebHashHistory } from 'vue-router'

export const constantRoutes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import(/* webpackChunkName: "userManager" */'@/views/Home.vue')
  },
  {
    path: '/webRTC',
    name: 'WebRTC',
    component: () => import(/* webpackChunkName: "userManager" */'@/views/WebRTC.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
    { path: '/calendar', name: 'calendar', component: () => import('./pages/CalendarPage.vue') },
    { path: '/growth', name: 'growth', component: () => import('./pages/GrowthPage.vue') },
    { path: '/plan', name: 'plan', component: () => import('./pages/PlanPage.vue') },
    { path: '/mine', name: 'mine', component: () => import('./pages/MinePage.vue') },
  ],
})

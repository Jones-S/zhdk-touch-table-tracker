import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Tracker',
    component: () => import('../views/TrackerView.vue')
  },
  {
    path: '/calibration',
    name: 'Calibration',
    component: () => import('../views/CalibrationView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

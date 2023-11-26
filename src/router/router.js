import { createRouter, createWebHashHistory } from 'vue-router'

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
  // not using the default createWebHistory, because reloading the built app in electron with fail
  // https://stackoverflow.com/a/56995887/1121268
  history: createWebHashHistory(),
  routes
})

export default router

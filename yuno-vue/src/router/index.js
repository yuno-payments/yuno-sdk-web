import { createRouter, createWebHistory } from 'vue-router'
import CheckoutLite from '../views/checkout-lite/CheckoutLite.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CheckoutLite
    }
  ]
})

export default router

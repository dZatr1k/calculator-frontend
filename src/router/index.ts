/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {createRouter, createWebHistory} from 'vue-router/auto'
import {setupLayouts} from 'virtual:generated-layouts'
import {useCalculatorStore} from "@/store/app";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  extendRoutes: setupLayouts,
})

router.beforeEach(async (to, from) => {
  const store = useCalculatorStore()
  const requiresAuth = to.matched.some(it => it.meta['requiresAuth'] === true)
  const isLogin = to.fullPath.startsWith('/login')

  if (requiresAuth || isLogin) {
    const isAuthorized = await store.loadAuth()

    if (isLogin && isAuthorized) {
      return {path: '/admin'}
    }

    if (requiresAuth && !isAuthorized) {
      return {
        path: '/login', query: {
          redirect: to.fullPath
        }
      }
    }
  }
})

console.info(router.getRoutes())

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaign',
    name: 'Campaign',
    component: () => import(/* webpackChunkName: "campaign" */ '../views/Campaign.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "auth" */ '../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "auth" */ '../views/Register.vue')
  },
  {
    path: '/techniques',
    name: 'Techniques',
    component: () => import(/* webpackChunkName: "pages" */ '../views/Techniques.vue')
  },
  {
    path: '/topup',
    name: 'TopUp',
    component: () => import(/* webpackChunkName: "pages" */ '../views/TopUp.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import(/* webpackChunkName: "pages" */ '../views/Account.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import(/* webpackChunkName: "pages" */ '../views/Pricing.vue')
  }
  ,
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('../views/Admin/Login.vue')
  },
  {
    path: '/admin/calls-audit',
    name: 'AdminCallsAudit',
    component: () => import('../views/Admin/CallsAudit.vue'),
    meta: { adminOnly: true }
  }
  ,
  {
    path: '/admin/plans',
    name: 'AdminPlans',
    component: () => import('../views/Admin/Plans.vue'),
    meta: { adminOnly: true }
  }
  ,
  {
    path: '/topup/complete',
    name: 'TopUpComplete',
    component: () => import('../views/TopUpComplete.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Protected routes that require a logged-in user (not admin-only routes)
    if (to.meta && to.meta.requiresAuth && !session) {
      next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && session) {
      next('/')
    } else {
      next()
    }
  } catch (error) {
    // Si Supabase n'est pas configuré, rediriger vers login for user-only routes
    console.error('Erreur Supabase:', error)
    if (to.meta && to.meta.requiresAuth) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router


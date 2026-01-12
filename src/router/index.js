import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaign',
    name: 'Campaign',
    component: () => import('../views/Campaign.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/techniques',
    name: 'Techniques',
    component: () => import('../views/Techniques.vue')
  }
  ,
  {
    path: '/topup',
    name: 'TopUp',
    component: () => import('../views/TopUp.vue'),
    meta: { requiresAuth: true }
  }
  ,
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    meta: { requiresAuth: true }
  }
  ,
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('../views/Pricing.vue')
  }
  ,
  {
    path: '/admin/calls-audit',
    name: 'AdminCallsAudit',
    component: () => import('../views/Admin/CallsAudit.vue'),
    meta: { requiresAuth: true }
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
    
    if (to.meta.requiresAuth && !session) {
      next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && session) {
      next('/')
    } else {
      next()
    }
  } catch (error) {
    // Si Supabase n'est pas configuré, rediriger vers login
    console.error('Erreur Supabase:', error)
    if (to.meta.requiresAuth) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router


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
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('../views/Admin/Login.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/Admin/Dashboard.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/admin/plans',
    name: 'AdminPlans',
    component: () => import('../views/Admin/Plans.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/admin/calls-audit',
    name: 'AdminCallsAudit',
    component: () => import('../views/Admin/CallsAudit.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/admin/security',
    name: 'AdminSecurity',
    component: () => import('../views/Admin/Security.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('../views/Admin/Settings.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/topup/complete',
    name: 'TopUpComplete',
    component: () => import('../views/TopUpComplete.vue')
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('../views/PrivacyPolicy.vue')
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import('../views/TermsOfService.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Admin token validation function
const isAdminTokenValid = () => {
  const token = localStorage.getItem('admin_token')
  return !!token && typeof token === 'string' && token.length > 16
}

router.beforeEach(async (to, from, next) => {
  // Pages publiques - pas de protection
  const publicPages = ['/privacy-policy', '/terms-of-service', '/admin', '/techniques', '/pricing', '/login', '/register']
  
  if (publicPages.includes(to.path)) {
    // Pour /admin, check si déjà connecté en tant qu'admin
    if (to.path === '/admin' && isAdminTokenValid()) {
      next({ name: 'AdminDashboard' })
      return
    }
    next()
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Admin-only routes protection
    if (to.meta && to.meta.adminOnly) {
      // Must have valid admin token
      if (!isAdminTokenValid()) {
        // Redirect to admin login instead of regular login
        next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
        return
      }
    }
    
    // Protected routes that require a logged-in user (not admin-only routes)
    if (to.meta && to.meta.requiresAuth && !session) {
      next('/login')
    } else {
      next()
    }
  } catch (error) {
    // Si Supabase n'est pas configuré
    console.error('Erreur Supabase:', error)
    if (to.meta && to.meta.requiresAuth) {
      next('/login')
    } else if (to.meta && to.meta.adminOnly) {
      next({ name: 'AdminLogin' })
    } else {
      next()
    }
  }
})

export default router
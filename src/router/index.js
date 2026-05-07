import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',             redirect: '/dashboard' },
  { path: '/login',        component: () => import('../views/LoginView.vue'),        meta: { guest: true } },
  { path: '/register',     component: () => import('../views/RegisterView.vue'),     meta: { guest: true } },
  { path: '/forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { guest: true } },
  { path: '/check-email',  component: () => import('../views/CheckEmailView.vue'),   meta: { guest: true } },
  { path: '/verify-email', component: () => import('../views/VerifyEmailView.vue'),  meta: { guest: true } },
  { path: '/packages',     component: () => import('../views/PackagesView.vue'),     meta: { auth: true } },
  { path: '/dashboard',    component: () => import('../views/DashboardView.vue'),    meta: { auth: true } },
  { path: '/activities',   component: () => import('../views/TasksView.vue'),        meta: { auth: true } },
  { path: '/nexpay',       component: () => import('../views/NexPayView.vue'),       meta: { auth: true } },
  { path: '/referrals',    component: () => import('../views/ReferralsView.vue'),    meta: { auth: true } },
  { path: '/profile',      component: () => import('../views/ProfileView.vue'),      meta: { auth: true } },
  { path: '/admin',        component: () => import('../views/AdminView.vue'),        meta: { auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('nexgain_token')
  const user  = JSON.parse(localStorage.getItem('nexgain_user') || 'null')

  if (to.meta.auth && !token) return next('/login')
  if (to.meta.guest && token) {
    if (user?.is_admin) return next('/admin')
    return next('/dashboard')
  }

  // Admin só acede ao painel admin
  if (token && user?.is_admin && to.path !== '/admin') {
    return next('/admin')
  }

  // Utilizador normal sem pacote vai para pacotes
  if (token && user && !user.is_admin &&
      !user.package_selected && !user.package &&
      to.path !== '/packages') {
    return next('/packages')
  }

  next()
})

export default router
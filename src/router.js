import { createRouter, createWebHistory } from 'vue-router';
import { ensureAuthLoaded, isAuthenticated, isAdmin } from './store.js';
import { i18n } from './i18n.js';
import HomeView from './views/HomeView.vue';
import SearchView from './views/SearchView.vue';
import MeetupsView from './views/MeetupsView.vue';
import MeetupDetailView from './views/MeetupDetailView.vue';
import PredictionsView from './views/PredictionsView.vue';
import PredictorLeaderboardView from './views/PredictorLeaderboardView.vue';
import TradesView from './views/TradesView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import ProfileView from './views/ProfileView.vue';
import AdminView from './views/AdminView.vue';
import NewsView from './views/NewsView.vue';
import NewsArticleView from './views/NewsArticleView.vue';

const LOCALE_CODES = { en: 'en', fr: 'fr', de: 'de', rs: 'sr' };

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            component: HomeView },
    { path: '/search',      component: SearchView },
    { path: '/meetups',     component: MeetupsView },
    { path: '/meetups/:id(\\d+)', component: MeetupDetailView },
    { path: '/predictions', component: PredictionsView },
    { path: '/predictions/leaderboard', component: PredictorLeaderboardView },
    { path: '/trades',      component: TradesView, meta: { requiresAuth: true } },
    { path: '/login',       component: LoginView, meta: { guestOnly: true } },
    { path: '/register',    component: RegisterView, meta: { guestOnly: true } },
    { path: '/profile',     component: ProfileView, meta: { requiresAuth: true } },
    { path: '/account',     redirect: () => (isAuthenticated.value ? '/profile' : '/login') },
    { path: '/admin',       component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/news',        component: NewsView },
    { path: '/news/:slug',  component: NewsArticleView },
    { path: '/:lang(en|fr|de|rs)', redirect: to => {
      i18n.global.locale.value = LOCALE_CODES[to.params.lang];
      return '/';
    }},
  ]
});

router.beforeEach(async (to) => {
  await ensureAuthLoaded();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return '/login';
  }
  if (to.meta.guestOnly && isAuthenticated.value) {
    return '/profile';
  }
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return '/';
  }
});

export default router;

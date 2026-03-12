import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, isAdmin } from './store.js';
import { i18n } from './i18n.js';
import HomeView from './views/HomeView.vue';
import SearchView from './views/SearchView.vue';
import MeetupsView from './views/MeetupsView.vue';
import MeetupDetailView from './views/MeetupDetailView.vue';
import PredictionsView from './views/PredictionsView.vue';
import PredictorLeaderboardView from './views/PredictorLeaderboardView.vue';
import TradesView from './views/TradesView.vue';
import AccountView from './views/AccountView.vue';
import AdminView from './views/AdminView.vue';

const LOCALE_CODES = { en: 'en', de: 'de', rs: 'sr' };

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
    { path: '/account',     component: AccountView },
    { path: '/admin',       component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/:lang(en|de|rs)', redirect: to => {
      i18n.global.locale.value = LOCALE_CODES[to.params.lang];
      return '/';
    }},
  ]
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return '/account';
  }
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return '/';
  }
});

export default router;

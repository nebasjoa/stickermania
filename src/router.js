import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from './store.js';
import HomeView from './views/HomeView.vue';
import SearchView from './views/SearchView.vue';
import MeetupsView from './views/MeetupsView.vue';
import PredictionsView from './views/PredictionsView.vue';
import TradesView from './views/TradesView.vue';
import AccountView from './views/AccountView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            component: HomeView },
    { path: '/search',      component: SearchView },
    { path: '/meetups',     component: MeetupsView },
    { path: '/predictions', component: PredictionsView },
    { path: '/trades',      component: TradesView, meta: { requiresAuth: true } },
    { path: '/account',     component: AccountView },
  ]
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return '/account';
  }
});

export default router;

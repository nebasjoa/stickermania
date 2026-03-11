<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  currentUser, errorMessage, isAdmin, message,
  fetchGroupStandings, fetchHomeLeaderboard, fetchMe, fetchMeetups, fetchPredictions,
  fetchRecentCollectors, fetchTrades, fetchUpcomingGames, handleLogout, handleVerify,
  isAuthenticated, setStatus, verificationToken
} from './store.js';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

watch(() => route.path, () => setStatus());

const langOptions = [
  { value: 'en', label: 'EN', fi: 'gb' },
  { value: 'de', label: 'DE', fi: 'de' },
  { value: 'sr', label: 'SR', fi: 'rs' }
];
const langDropdownOpen = ref(false);
const currentLang = computed(() => langOptions.find(l => l.value === locale.value));
const drawerOpen = ref(false);

function closeDrawer() { drawerOpen.value = false; }

function selectLang(value) {
  locale.value = value;
  langDropdownOpen.value = false;
}

function onLangClickOutside(e) {
  if (!e.target.closest('.lang-dropdown')) {
    langDropdownOpen.value = false;
  }
}

async function logout() {
  await handleLogout();
  router.push('/');
}

onUnmounted(() => {
  document.removeEventListener('click', onLangClickOutside);
});

onMounted(async () => {
  document.addEventListener('click', onLangClickOutside);

  const params = new URLSearchParams(window.location.search);
  const token = params.get('verify');
  if (token) {
    verificationToken.value = token;
    router.push('/account');
    await handleVerify(token);
    window.history.replaceState({}, '', '/account');
  }

  await fetchMe();
  await fetchTrades();
  await fetchMeetups();
  await fetchPredictions();
  await fetchHomeLeaderboard();
  await fetchRecentCollectors();
  await fetchUpcomingGames();
  await fetchGroupStandings();
});
</script>

<template>
  <div class="shell">
    <header class="navbar">
      <div>
        <RouterLink class="brand" to="/">{{ t('appName') }}</RouterLink>
      </div>

      <nav class="nav-links">
        <RouterLink to="/">{{ t('navHome') }}</RouterLink>
        <RouterLink to="/search">{{ t('navSearch') }}</RouterLink>
        <RouterLink to="/meetups">{{ t('navMeetups') }}</RouterLink>
        <RouterLink to="/predictions">Predictions</RouterLink>
        <RouterLink to="/trades">{{ t('navTrades') }}</RouterLink>
        <RouterLink to="/account">{{ t('navAccount') }}</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
      </nav>

      <div class="toolbar">
        <div class="lang-dropdown" :class="{ open: langDropdownOpen }">
          <button type="button" class="lang-trigger" @click.stop="langDropdownOpen = !langDropdownOpen">
            <span :class="`fi fi-${currentLang.fi}`"></span>
            <span>{{ currentLang.label }}</span>
            <svg class="lang-chevron" viewBox="0 0 12 12" width="12" height="12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <ul v-if="langDropdownOpen" class="lang-menu">
            <li v-for="lang in langOptions" :key="lang.value">
              <button type="button" :class="{ selected: locale === lang.value }" @click="selectLang(lang.value)">
                <span :class="`fi fi-${lang.fi}`"></span>
                <span>{{ lang.label }}</span>
              </button>
            </li>
          </ul>
        </div>

        <button v-if="isAuthenticated" type="button" class="secondary" @click="logout">
          {{ t('logout') }}
        </button>
      </div>

      <button class="burger" type="button" :aria-expanded="drawerOpen" aria-label="Menu" @click="drawerOpen = !drawerOpen">
        <span></span><span></span><span></span>
      </button>
    </header>

    <!-- Mobile drawer -->
    <transition name="drawer">
      <div v-if="drawerOpen" class="drawer" @click.self="closeDrawer">
        <nav class="drawer-nav">
          <RouterLink to="/" @click="closeDrawer">{{ t('navHome') }}</RouterLink>
          <RouterLink to="/search" @click="closeDrawer">{{ t('navSearch') }}</RouterLink>
          <RouterLink to="/meetups" @click="closeDrawer">{{ t('navMeetups') }}</RouterLink>
          <RouterLink to="/predictions" @click="closeDrawer">Predictions</RouterLink>
          <RouterLink to="/trades" @click="closeDrawer">{{ t('navTrades') }}</RouterLink>
          <RouterLink to="/account" @click="closeDrawer">{{ t('navAccount') }}</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" @click="closeDrawer">Admin</RouterLink>
          <hr class="drawer-divider" />
          <div class="drawer-lang">
            <button
              v-for="lang in langOptions"
              :key="lang.value"
              type="button"
              :class="{ selected: locale === lang.value }"
              @click="selectLang(lang.value); closeDrawer()"
            ><span :class="`fi fi-${lang.fi}`"></span> {{ lang.label }}</button>
          </div>
          <button v-if="isAuthenticated" type="button" class="secondary" @click="logout(); closeDrawer()">
            {{ t('logout') }}
          </button>
        </nav>
      </div>
    </transition>

    <main class="main-content">
      <section v-if="message" class="notice success">{{ message }}</section>
      <section v-if="errorMessage" class="notice error">{{ errorMessage }}</section>
      <RouterView />
    </main>

    <footer class="footer">
      <span>{{ t('footer') }}</span>
      <span v-if="currentUser">{{ currentUser.username }}</span>
    </footer>
  </div>
</template>

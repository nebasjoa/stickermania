<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  currentUser, errorMessage, message,
  fetchHomeLeaderboard, fetchMe, fetchMeetups, fetchPredictions,
  fetchRecentCollectors, fetchTrades, handleLogout, handleVerify,
  isAuthenticated, verificationToken
} from './store.js';

const { t, locale } = useI18n();
const router = useRouter();

const langOptions = [
  { value: 'en', label: 'EN', flag: '🇬🇧' },
  { value: 'de', label: 'DE', flag: '🇩🇪' },
  { value: 'sr', label: 'SR', flag: '🇷🇸' }
];
const langDropdownOpen = ref(false);
const currentLang = computed(() => langOptions.find(l => l.value === locale.value));

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
      </nav>

      <div class="toolbar">
        <div class="lang-dropdown" :class="{ open: langDropdownOpen }">
          <button type="button" class="lang-trigger" @click.stop="langDropdownOpen = !langDropdownOpen">
            <span>{{ currentLang.flag }} {{ currentLang.label }}</span>
            <svg class="lang-chevron" viewBox="0 0 12 12" width="12" height="12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <ul v-if="langDropdownOpen" class="lang-menu">
            <li v-for="lang in langOptions" :key="lang.value">
              <button type="button" :class="{ selected: locale === lang.value }" @click="selectLang(lang.value)">
                <span class="lang-flag">{{ lang.flag }}</span>
                <span>{{ lang.label }}</span>
              </button>
            </li>
          </ul>
        </div>

        <button v-if="isAuthenticated" type="button" class="secondary" @click="logout">
          {{ t('logout') }}
        </button>
      </div>
    </header>

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

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AppFooter from './components/AppFooter.vue';
import {
  currentUser, errorMessage, isAdmin, message,
  ensureAuthLoaded, fetchGroupStandings, fetchHomeLeaderboard, fetchMeetups, fetchPredictions,
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
const toastVisible = ref(false);
const toastText = ref('');
const toastType = ref('success');
let toastTimer = null;

function showToast(text, type = 'success') {
  clearTimeout(toastTimer);
  toastText.value = text;
  toastType.value = type;
  toastVisible.value = true;
  toastTimer = setTimeout(() => { toastVisible.value = false; }, 3500);
}

watchEffect(() => {
  if (message.value) showToast(message.value, 'success');
});

watchEffect(() => {
  if (errorMessage.value) showToast(errorMessage.value, 'error');
});

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
    router.push('/login');
    await handleVerify(token);
    window.history.replaceState({}, '', '/login');
  }

  await ensureAuthLoaded();
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
        <RouterLink class="brand" to="/">
          <img src="/src/assets/logo/logo.png" alt="World Cup Stuff" class="navbar-logo" />
          <span class="brand-name">World Cup Stuff</span>
        </RouterLink>
      </div>

      <nav class="nav-links">
        <div class="nav-links-primary">
          <RouterLink to="/">{{ t('navHome') }}</RouterLink>
          <RouterLink to="/search">{{ t('navSearch') }}</RouterLink>
          <RouterLink to="/meetups">{{ t('navMeetups') }}</RouterLink>
          <RouterLink to="/predictions">{{ t('navPredictions') }}</RouterLink>
          <RouterLink to="/trades">{{ t('navTrades') }}</RouterLink>
          <RouterLink to="/news">{{ t('navNews') }}</RouterLink>
        </div>
        <div class="nav-links-secondary">
          <RouterLink v-if="isAuthenticated" to="/profile">{{ t('navProfile') }}</RouterLink>
          <RouterLink v-else to="/login">{{ t('navLogin') }}</RouterLink>
          <RouterLink v-if="!isAuthenticated" to="/register">{{ t('navRegister') }}</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
        </div>
      </nav>

      <div class="toolbar">
        <div v-if="isAuthenticated" class="navbar-user">
          <span class="navbar-user-label">{{ t('navSignedInAs') }}</span>
          <strong class="navbar-user-name">{{ currentUser?.username }}</strong>
        </div>

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
          <RouterLink to="/predictions" @click="closeDrawer">{{ t('navPredictions') }}</RouterLink>
          <RouterLink to="/trades" @click="closeDrawer">{{ t('navTrades') }}</RouterLink>
          <RouterLink to="/news" @click="closeDrawer">{{ t('navNews') }}</RouterLink>
          <RouterLink v-if="isAuthenticated" to="/profile" @click="closeDrawer">{{ t('navProfile') }}</RouterLink>
          <RouterLink v-else to="/login" @click="closeDrawer">{{ t('navLogin') }}</RouterLink>
          <RouterLink v-if="!isAuthenticated" to="/register" @click="closeDrawer">{{ t('navRegister') }}</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" @click="closeDrawer">Admin</RouterLink>
          <hr class="drawer-divider" />
          <div v-if="isAuthenticated" class="drawer-user">
            <span class="navbar-user-label">{{ t('navSignedInAs') }}</span>
            <strong class="navbar-user-name">{{ currentUser?.username }}</strong>
          </div>
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
      <RouterView />
    </main>

    <transition name="toast">
      <div v-if="toastVisible" :class="['toast', toastType]" role="status" aria-live="polite">
        {{ toastText }}
      </div>
    </transition>

    <AppFooter />
  </div>
</template>

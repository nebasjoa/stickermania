<script setup>
import { onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  handleLogin, handleVerify, isAuthenticated, loading, loginForm, setStatus, verificationToken
} from '../store.js';

const { t } = useI18n();
const isDev = import.meta.env.VITE_ENV === 'development';
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const token = route.query.verify;
  if (token) {
    verificationToken.value = token;
    await handleVerify(token);
    window.history.replaceState({}, '', '/login');
  }

  if (isAuthenticated.value) {
    router.replace('/profile');
  }
});

async function submitLogin() {
  const didLogin = await handleLogin();
  if (didLogin) {
    router.push('/profile');
  }
}

async function submitVerify() {
  await handleVerify(verificationToken.value);
}

function goToRegister() {
  setStatus();
  router.push('/register');
}
</script>

<template>
  <section class="auth-shell">
    <article class="card auth-card">
      <h2>{{ t('login') }}</h2>
      <form class="stack" @submit.prevent="submitLogin">
        <input v-model="loginForm.email" :placeholder="t('email')" type="email" required />
        <input v-model="loginForm.password" :placeholder="t('password')" type="password" required />
        <button type="submit" :disabled="loading">{{ t('login') }}</button>
      </form>

      <p class="auth-switch-copy">
        {{ t('authNeedAccount') }}
        <RouterLink to="/register" @click="setStatus()">{{ t('register') }}</RouterLink>
      </p>

      <template v-if="isDev">
        <div class="divider"></div>

        <h3>{{ t('verifyNotice') }}</h3>
        <form class="stack" @submit.prevent="submitVerify">
          <input v-model="verificationToken" placeholder="Verification token" />
          <button type="submit" class="secondary" :disabled="loading">Verify email</button>
        </form>
      </template>
    </article>

    <article class="card auth-side-card">
      <p class="section-kicker">{{ t('navRegister') }}</p>
      <h2>{{ t('register') }}</h2>
      <p>{{ t('authRegisterTeaser') }}</p>
      <button type="button" class="secondary" @click="goToRegister">{{ t('register') }}</button>
    </article>
  </section>
</template>

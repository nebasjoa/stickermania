<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  handleLogin, handleVerify, handleForgotPassword, handleResetPassword,
  isAuthenticated, loading, loginForm, setStatus, verificationToken
} from '../store.js';

const { t } = useI18n();
const isDev = import.meta.env.VITE_ENV === 'development';
const route = useRoute();
const router = useRouter();

const showForgotPasswordForm = ref(false);
const forgotPasswordEmail = ref('');
const resetPasswordToken = ref('');
const resetPasswordNew = ref('');
const resetPasswordConfirm = ref('');
const resetPasswordsDontMatch = ref(false);

onMounted(async () => {
  const verifyParam = route.query.verify;
  if (verifyParam) {
    verificationToken.value = verifyParam;
    await handleVerify(verifyParam);
    window.history.replaceState({}, '', '/login');
    return;
  }

  const resetParam = route.query.reset;
  if (resetParam) {
    resetPasswordToken.value = resetParam;
    window.history.replaceState({}, '', '/login');
    return;
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

async function submitForgotPassword() {
  await handleForgotPassword(forgotPasswordEmail.value);
  forgotPasswordEmail.value = '';
}

async function submitResetPassword() {
  resetPasswordsDontMatch.value = false;
  if (resetPasswordNew.value !== resetPasswordConfirm.value) {
    resetPasswordsDontMatch.value = true;
    return;
  }
  const ok = await handleResetPassword(resetPasswordToken.value, resetPasswordNew.value);
  if (ok) {
    resetPasswordToken.value = '';
    resetPasswordNew.value = '';
    resetPasswordConfirm.value = '';
  }
}

function goToRegister() {
  setStatus();
  router.push('/register');
}
</script>

<template>
  <section class="auth-shell">
    <article class="card auth-card">
      <template v-if="resetPasswordToken">
        <h2>{{ t('resetPasswordTitle') }}</h2>
        <form class="stack" @submit.prevent="submitResetPassword">
          <input v-model="resetPasswordNew" :placeholder="t('newPassword')" type="password" minlength="8" required />
          <input v-model="resetPasswordConfirm" :placeholder="t('repeatPassword')" type="password" minlength="8" required />
          <p v-if="resetPasswordsDontMatch" class="form-feedback form-feedback--error">{{ t('passwordsDoNotMatch') }}</p>
          <button type="submit" :disabled="loading">{{ t('resetPasswordButton') }}</button>
        </form>
      </template>

      <template v-else-if="showForgotPasswordForm">
        <h2>{{ t('forgotPasswordTitle') }}</h2>
        <p class="form-hint">{{ t('forgotPasswordHelp') }}</p>
        <form class="stack" @submit.prevent="submitForgotPassword">
          <input v-model="forgotPasswordEmail" :placeholder="t('email')" type="email" required />
          <button type="submit" :disabled="loading">{{ t('forgotPasswordButton') }}</button>
        </form>
        <button type="button" class="btn-link" @click="showForgotPasswordForm = false">{{ t('backToLogin') }}</button>
      </template>

      <template v-else>
        <h2>{{ t('login') }}</h2>
        <form class="stack" @submit.prevent="submitLogin">
          <input v-model="loginForm.email" :placeholder="t('email')" type="email" required />
          <input v-model="loginForm.password" :placeholder="t('password')" type="password" required />
          <button type="submit" :disabled="loading">{{ t('login') }}</button>
        </form>
        <button type="button" class="btn-link" @click="showForgotPasswordForm = true">{{ t('forgotPassword') }}</button>

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
      </template>
    </article>

    <article v-if="!resetPasswordToken && !showForgotPasswordForm" class="card auth-side-card">
      <p class="section-kicker">{{ t('navRegister') }}</p>
      <h2>{{ t('register') }}</h2>
      <p>{{ t('authRegisterTeaser') }}</p>
      <button type="button" class="secondary" @click="goToRegister">{{ t('register') }}</button>
    </article>
  </section>
</template>

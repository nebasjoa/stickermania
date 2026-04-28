<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentUser, isAuthenticated } from '../store.js';

const { t } = useI18n();

const browserTimeZone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
</script>

<template>
  <footer class="footer">
    <div class="footer-grid">
      <section class="footer-block">
        <p class="footer-kicker">{{ t('appName') }}</p>
        <h2 class="footer-title">{{ t('footerTitle') }}</h2>
        <p class="footer-copy">{{ t('footer') }}</p>
      </section>

      <nav class="footer-block" aria-label="Footer">
        <p class="footer-heading">{{ t('footerQuickLinks') }}</p>
        <div class="footer-links">
          <RouterLink to="/search">{{ t('navSearch') }}</RouterLink>
          <RouterLink to="/meetups">{{ t('navMeetups') }}</RouterLink>
          <RouterLink to="/predictions">{{ t('navPredictions') }}</RouterLink>
          <RouterLink v-if="isAuthenticated" to="/profile">{{ t('navProfile') }}</RouterLink>
          <RouterLink v-else to="/login">{{ t('navLogin') }}</RouterLink>
          <RouterLink v-if="!isAuthenticated" to="/register">{{ t('navRegister') }}</RouterLink>
        </div>
      </nav>

      <nav class="footer-block" aria-label="Legal">
        <p class="footer-heading">{{ t('footerLegal') }}</p>
        <div class="footer-links">
          <RouterLink to="/terms">{{ t('footerTerms') }}</RouterLink>
          <RouterLink to="/privacy">{{ t('footerPrivacy') }}</RouterLink>
        </div>
      </nav>

      <section class="footer-block">
        <p class="footer-heading">{{ t('footerUsefulInfo') }}</p>
        <div class="footer-meta">
          <p><strong>{{ t('footerTimeZone') }}:</strong> {{ browserTimeZone }}</p>
          <p><strong>{{ t('footerTimesLabel') }}:</strong> {{ t('footerTimesValue') }}</p>
          <p><strong>{{ t('footerTradeLabel') }}:</strong> {{ t('footerTradeValue') }}</p>
          <p v-if="currentUser"><strong>{{ t('footerSignedInAs') }}:</strong> {{ currentUser.username }}</p>
        </div>
      </section>
    </div>
  </footer>
</template>

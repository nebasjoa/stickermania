<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentUser } from '../store.js';

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
          <RouterLink to="/account">{{ t('navAccount') }}</RouterLink>
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

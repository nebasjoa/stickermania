<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { homeMeetups, homeLeaderboard, homeRecentCollectors } from '../store.js';

const { t } = useI18n();

// FIFA World Cup 2026 kick-off: June 11, 21:00 Europe/Berlin (CEST = UTC+2) → 19:00 UTC
const KICKOFF = new Date('2026-06-11T19:00:00.000Z');

const countdown = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
const localKickoffTime = KICKOFF.toLocaleString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
});

let countdownInterval = null;

function updateCountdown() {
  const diff = KICKOFF - Date.now();
  if (diff <= 0) {
    countdown.expired = true;
    countdown.days = countdown.hours = countdown.minutes = countdown.seconds = 0;
    clearInterval(countdownInterval);
    return;
  }
  countdown.days = Math.floor(diff / 86_400_000);
  countdown.hours = Math.floor((diff % 86_400_000) / 3_600_000);
  countdown.minutes = Math.floor((diff % 3_600_000) / 60_000);
  countdown.seconds = Math.floor((diff % 60_000) / 1_000);
}

function formatMeetupDate(iso) {
  return new Date(iso).toLocaleString();
}

onMounted(() => {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  clearInterval(countdownInterval);
});
</script>

<template>
  <section class="hero card">
    <div>
      <p class="eyebrow">{{ t('heroEyebrow') }}</p>
      <h1>{{ t('heroTitle') }}</h1>
      <p>{{ t('heroBody') }}</p>
    </div>

    <div class="countdown-wrap">
      <p class="countdown-label">
        <template v-if="!countdown.expired">KICKOFF IN</template>
        <template v-else>THE WORLD CUP HAS STARTED!</template>
      </p>
      <div v-if="!countdown.expired" class="countdown-tiles">
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.days).padStart(2, '0') }}</span>
          <span class="countdown-unit">days</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.hours).padStart(2, '0') }}</span>
          <span class="countdown-unit">hrs</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.minutes).padStart(2, '0') }}</span>
          <span class="countdown-unit">min</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.seconds).padStart(2, '0') }}</span>
          <span class="countdown-unit">sec</span>
        </div>
      </div>
      <p class="countdown-localtime">{{ localKickoffTime }}</p>
    </div>

    <div class="hero-grid">
      <div class="info-box">
        <strong>{{ t('searchTitle') }}</strong>
        <p>{{ t('searchHelp') }}</p>
      </div>
      <div class="info-box">
        <strong>{{ t('meetupsTitle') }}</strong>
        <p>{{ t('meetupHelp') }}</p>
      </div>
    </div>
  </section>

  <div class="home-panels-grid">
    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">{{ t('navMeetups') }}</p>
          <h2>{{ t('meetupBrowseTitle') }}</h2>
        </div>
        <RouterLink to="/meetups" class="btn secondary">{{ t('navMeetups') }}</RouterLink>
      </div>
      <div v-if="!homeMeetups.length" class="home-panel-empty">{{ t('meetupEmpty') }}</div>
      <article v-for="meetup in homeMeetups" :key="`home-meetup-${meetup.id}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <strong>{{ meetup.title }}</strong>
          <span class="pill">{{ meetup.attendee_count }} going</span>
        </div>
        <p class="home-panel-item-sub">{{ meetup.city }}, {{ meetup.country }}</p>
        <p class="home-panel-item-date">{{ formatMeetupDate(meetup.starts_at) }}</p>
      </article>
    </section>

    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">Predictions</p>
          <h2>Top Predictors</h2>
        </div>
        <RouterLink to="/predictions" class="btn secondary">Predict</RouterLink>
      </div>
      <div v-if="!homeLeaderboard.length" class="home-panel-empty">No predictions yet.</div>
      <article v-for="(entry, index) in homeLeaderboard" :key="`lb-${entry.username}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <span class="home-rank">{{ index + 1 }}</span>
          <strong>{{ entry.username }}</strong>
          <span class="pill">{{ entry.count }} / 72</span>
        </div>
        <p class="home-panel-item-sub">{{ [entry.city, entry.country].filter(Boolean).join(', ') || '—' }}</p>
      </article>
    </section>

    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">Community</p>
          <h2>New Collectors</h2>
        </div>
        <RouterLink to="/search" class="btn secondary">{{ t('navSearch') }}</RouterLink>
      </div>
      <div v-if="!homeRecentCollectors.length" class="home-panel-empty">No collectors yet.</div>
      <article v-for="collector in homeRecentCollectors" :key="`collector-${collector.id}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <strong>{{ collector.username }}</strong>
        </div>
        <p class="home-panel-item-sub">{{ [collector.city, collector.country].filter(Boolean).join(', ') || '—' }}</p>
      </article>
    </section>
  </div>
</template>

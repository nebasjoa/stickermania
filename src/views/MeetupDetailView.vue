<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LocationLabel from '../components/LocationLabel.vue';
import api from '../api.js';
import { isAuthenticated, loading, setStatus, toggleMeetupAttendance } from '../store.js';

const { t } = useI18n();
const route = useRoute();
const meetup = ref(null);
const shareOrigin = window.location.origin;

function meetupPath(id) {
  return `/meetups/${id}`;
}

function formatMeetupDate(iso) {
  return new Date(iso).toLocaleString();
}

async function loadMeetup() {
  const meetupId = Number(route.params.id);
  if (!meetupId) {
    meetup.value = null;
    setStatus('', 'Invalid meetup id.');
    return;
  }

  try {
    const { data } = await api.get(`/meetups/${meetupId}`);
    meetup.value = data.meetup;
  } catch (error) {
    meetup.value = null;
    setStatus('', error.response?.data?.message || 'Could not load meetup.');
  }
}

async function toggleAttendance() {
  if (!meetup.value) return;
  await toggleMeetupAttendance(meetup.value);
  await loadMeetup();
}

onMounted(() => {
  loadMeetup();
});
</script>

<template>
  <section class="stack">
    <article v-if="meetup" class="card meetup-card meetup-card--selected">
      <div class="card-top">
        <div>
          <p class="eyebrow">Meetup #{{ meetup.id }}</p>
          <h2>{{ meetup.title }}</h2>
          <p><LocationLabel :city="meetup.city" :country="meetup.country" /></p>
        </div>
        <span class="status">{{ formatMeetupDate(meetup.starts_at) }}</span>
      </div>
      <p>{{ meetup.description }}</p>
      <div class="meetup-meta">
        <span><strong>{{ t('meetupCreator') }}:</strong> {{ meetup.creator_username }}</span>
        <span><strong>{{ t('meetupVenue') }}:</strong> {{ meetup.venue || '-' }}</span>
        <span><strong>{{ t('meetupAttendees') }}:</strong> {{ meetup.attendee_count }}</span>
        <span><strong>Share URL:</strong> {{ shareOrigin }}{{ meetupPath(meetup.id) }}</span>
      </div>
      <p><strong>{{ t('meetupDetails') }}:</strong> {{ meetup.details || '-' }}</p>
      <div class="meetup-card-actions">
        <RouterLink class="btn secondary" to="/meetups">All meetups</RouterLink>
        <button
          v-if="isAuthenticated"
          type="button"
          :class="{ secondary: meetup.isAttending }"
          @click="toggleAttendance"
        >
          {{ meetup.isAttending ? t('meetupCancelAttend') : t('meetupAttend') }}
        </button>
      </div>
    </article>

    <article v-else class="card">
      <p>Meetup not found.</p>
      <RouterLink class="btn secondary" to="/meetups">Back to meetups</RouterLink>
    </article>
  </section>
</template>

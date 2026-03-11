<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import CountrySelect from '../components/CountrySelect.vue';
import LocationLabel from '../components/LocationLabel.vue';
import {
  isAuthenticated, loading, meetups, meetupFilterForm, meetupForm,
  createMeetup, fetchMeetups, setStatus, toggleMeetupAttendance
} from '../store.js';

const { t } = useI18n();

const countryOptions = Object.keys(locations);
const meetupFilterCityOptions = computed(() => locations[meetupFilterForm.country] || []);
const meetupFormCityOptions = computed(() => locations[meetupForm.country] || []);

watch(() => meetupFilterForm.country, (next, prev) => {
  if (next !== prev) meetupFilterForm.city = '';
});

watch(() => meetupForm.country, (next, prev) => {
  if (next !== prev) meetupForm.city = '';
});

function formatMeetupDate(iso) {
  return new Date(iso).toLocaleString();
}

async function searchMeetups() {
  loading.value = true;
  setStatus();
  try {
    await fetchMeetups();
    if (!meetups.value.length) setStatus(t('meetupEmpty'));
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Meetup search failed.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="stack">
    <article class="card">
      <h2>{{ t('meetupBrowseTitle') }}</h2>
      <form class="search-row" @submit.prevent="searchMeetups">
        <div class="search-fields">
          <CountrySelect
            v-model="meetupFilterForm.country"
            :options="countryOptions"
            :placeholder="t('anyCountry')"
          />
          <select v-model="meetupFilterForm.city" :disabled="!meetupFilterForm.country">
            <option value="">{{ t('anyCity') }}</option>
            <option v-for="city in meetupFilterCityOptions" :key="`meetup-city-${city}`" :value="city">
              {{ city }}
            </option>
          </select>
        </div>
        <button type="submit" :disabled="loading">{{ t('meetupSearchButton') }}</button>
      </form>
    </article>

    <article v-if="isAuthenticated" class="card">
      <h2>{{ t('meetupCreateTitle') }}</h2>
      <form class="stack" @submit.prevent="createMeetup">
        <input v-model="meetupForm.title" :placeholder="t('meetupTitle')" required />
        <textarea v-model="meetupForm.description" :placeholder="t('meetupDescription')" required></textarea>
        <CountrySelect
          v-model="meetupForm.country"
          :options="countryOptions"
          :placeholder="t('searchCountry')"
        />
        <select v-model="meetupForm.city" :disabled="!meetupForm.country" required>
          <option disabled value="">{{ t('searchCity') }}</option>
          <option v-for="city in meetupFormCityOptions" :key="`meetup-form-city-${city}`" :value="city">
            {{ city }}
          </option>
        </select>
        <input v-model="meetupForm.venue" :placeholder="t('meetupVenue')" />
        <input v-model="meetupForm.startsAt" type="datetime-local" required />
        <input v-model="meetupForm.details" :placeholder="t('meetupDetails')" />
        <button type="submit" :disabled="loading">{{ t('meetupCreateButton') }}</button>
      </form>
    </article>

    <div class="results-grid">
      <article v-for="meetup in meetups" :key="meetup.id" class="card meetup-card">
        <div class="card-top">
          <div>
            <h3>{{ meetup.title }}</h3>
            <p><LocationLabel :city="meetup.city" :country="meetup.country" /></p>
          </div>
          <span class="status">{{ formatMeetupDate(meetup.starts_at) }}</span>
        </div>
        <p>{{ meetup.description }}</p>
        <div class="meetup-meta">
          <span><strong>{{ t('meetupCreator') }}:</strong> {{ meetup.creator_username }}</span>
          <span><strong>{{ t('meetupVenue') }}:</strong> {{ meetup.venue || '-' }}</span>
          <span><strong>{{ t('meetupAttendees') }}:</strong> {{ meetup.attendee_count }}</span>
        </div>
        <p><strong>{{ t('meetupDetails') }}:</strong> {{ meetup.details || '-' }}</p>
        <button
          v-if="isAuthenticated"
          type="button"
          :class="{ secondary: meetup.isAttending }"
          @click="toggleMeetupAttendance(meetup)"
        >
          {{ meetup.isAttending ? t('meetupCancelAttend') : t('meetupAttend') }}
        </button>
      </article>
      <article v-if="!meetups.length" class="card">
        <p>{{ t('meetupEmpty') }}</p>
      </article>
    </div>
  </section>
</template>

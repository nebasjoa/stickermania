<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import CountrySelect from '../components/CountrySelect.vue';
import { BADGES, computeEarnedBadges } from '../utils/badges.js';
import {
  completedPredictionsCount, currentUser, deleteAccountPermanently, exportPersonalData,
  loading, meetups, predictions, profileForm, saveProfile, trades
} from '../store.js';

const { t } = useI18n();
const router = useRouter();
const showDeleteAccountModal = ref(false);

const earnedBadgeIds = computed(() => {
  const earned = computeEarnedBadges(currentUser.value, trades.value, meetups.value, predictions.value);
  return new Set(earned.map((b) => b.id));
});

const badgesByCategory = computed(() => {
  const categories = ['collection', 'trading', 'community', 'predictions', 'account'];
  return categories.map((cat) => ({
    key: cat,
    label: t(`badgeCategory${cat.charAt(0).toUpperCase() + cat.slice(1)}`),
    badges: BADGES.filter((b) => b.category === cat),
  }));
});

const stickerNumbers = Array.from({ length: 980 }, (_, i) => String(i + 1));
const totalStickerCount = stickerNumbers.length;
const countryOptions = Object.keys(locations).sort((a, b) => a.localeCompare(b));
const collectedStickerCount = computed(() => totalStickerCount - profileForm.needs.length);
const collectedStickerPercent = computed(() =>
  Math.max(0, Math.min(100, (collectedStickerCount.value / totalStickerCount) * 100))
);
const collectedStickerPercentLabel = computed(() => collectedStickerPercent.value.toFixed(1));
const profileCollectedStickerCount = computed(() => totalStickerCount - profileForm.needs.length);

function toggleSticker(form, key, sticker) {
  const list = form[key];
  const idx = list.indexOf(sticker);
  if (idx >= 0) {
    list.splice(idx, 1);
    return;
  }
  list.push(sticker);
  list.sort((a, b) => Number(a) - Number(b));
}

function isStickerSelected(form, key, sticker) {
  return form[key].includes(sticker);
}

function isProfileStickerCollected(sticker) {
  return !profileForm.needs.includes(sticker);
}

function toggleProfileCollectedSticker(sticker) {
  const missing = new Set(profileForm.needs);
  if (missing.has(sticker)) {
    missing.delete(sticker);
  } else {
    missing.add(sticker);
  }
  profileForm.needs.splice(0, profileForm.needs.length, ...stickerNumbers.filter((entry) => missing.has(entry)));
}

function selectAllStickers(form, key) {
  form[key].splice(0, form[key].length, ...stickerNumbers);
}

function clearAllStickers(form, key) {
  form[key].splice(0, form[key].length);
}

function selectAllCollectedStickers() {
  profileForm.needs.splice(0, profileForm.needs.length);
}

function clearAllCollectedStickers() {
  profileForm.needs.splice(0, profileForm.needs.length, ...stickerNumbers);
}

function cityOptionsFor(form) {
  const knownCities = form.country ? (locations[form.country] || []) : [];
  if (form.city && !knownCities.includes(form.city)) {
    return [form.city, ...knownCities];
  }
  return knownCities;
}

function syncCitySelection(form) {
  const validCities = form.country ? (locations[form.country] || []) : [];
  if (!validCities.includes(form.city)) {
    form.city = '';
  }
}

async function downloadPersonalData() {
  await exportPersonalData();
}

async function deleteAccount() {
  const deleted = await deleteAccountPermanently();
  if (deleted) {
    showDeleteAccountModal.value = false;
    router.push('/');
  }
}

function openDeleteAccountModal() {
  showDeleteAccountModal.value = true;
}

function closeDeleteAccountModal() {
  if (loading.value) {
    return;
  }
  showDeleteAccountModal.value = false;
}
</script>

<template>
  <section class="stack">
    <article class="card">
      <h2>{{ t('profileTitle') }}</h2>
      <p>{{ t('predictionDone') }}: {{ completedPredictionsCount }} / {{ predictions.length }}</p>
      <section class="collection-progress" :aria-label="t('collectionProgressTitle')">
        <div class="collection-progress-head">
          <div>
            <p class="collection-progress-kicker">{{ t('collectionProgressTitle') }}</p>
            <p class="collection-progress-copy">
              {{ collectedStickerCount }} / {{ totalStickerCount }} {{ t('collectionProgressCollected') }}
            </p>
          </div>
          <strong class="collection-progress-percent">{{ collectedStickerPercentLabel }}%</strong>
        </div>
        <div class="collection-progress-track" role="progressbar" aria-valuemin="0" :aria-valuemax="totalStickerCount" :aria-valuenow="collectedStickerCount">
          <span class="collection-progress-fill" :style="{ width: `${collectedStickerPercent}%` }"></span>
        </div>
      </section>
      <form class="stack profile-form" @submit.prevent="saveProfile">
        <CountrySelect
          v-model="profileForm.country"
          :options="countryOptions"
          :placeholder="t('selectCountry')"
          @update:modelValue="syncCitySelection(profileForm)"
        />

        <select v-model="profileForm.city" :disabled="!profileForm.country">
          <option value="">{{ profileForm.country ? t('selectCity') : t('selectCountryFirst') }}</option>
          <option v-for="city in cityOptionsFor(profileForm)" :key="`profile-city-${city}`" :value="city">
            {{ city }}
          </option>
        </select>

        <details class="picker-panel">
          <summary>{{ t('collectedStickers') }} | {{ t('selectedCount') }}: {{ profileCollectedStickerCount }}</summary>
          <div class="picker-actions">
            <button type="button" class="secondary" @click="selectAllCollectedStickers">{{ t('selectAll') }}</button>
            <button type="button" class="secondary" @click="clearAllCollectedStickers">{{ t('deselectAll') }}</button>
          </div>
          <div class="sticker-grid">
            <button
              v-for="sticker in stickerNumbers"
              :key="`profile-needs-${sticker}`"
              type="button"
              class="sticker-tile"
              :class="{ selected: isProfileStickerCollected(sticker) }"
              @click="toggleProfileCollectedSticker(sticker)"
            >{{ sticker }}</button>
          </div>
        </details>

        <details class="picker-panel">
          <summary>{{ t('offeredStickers') }} | {{ t('selectedCount') }}: {{ profileForm.offers.length }}</summary>
          <div class="picker-actions">
            <button type="button" class="secondary" @click="selectAllStickers(profileForm, 'offers')">{{ t('selectAll') }}</button>
            <button type="button" class="secondary" @click="clearAllStickers(profileForm, 'offers')">{{ t('deselectAll') }}</button>
          </div>
          <div class="sticker-grid">
            <button
              v-for="sticker in stickerNumbers"
              :key="`profile-offers-${sticker}`"
              type="button"
              class="sticker-tile"
              :class="{ selected: isStickerSelected(profileForm, 'offers', sticker) }"
              @click="toggleSticker(profileForm, 'offers', sticker)"
            >{{ sticker }}</button>
          </div>
        </details>

        <div class="checkbox-row-wrap">
          <label class="checkbox-row">
            <input v-model="profileForm.postalTradeEnabled" type="checkbox" />
            <span>{{ t('postalTrade') }}</span>
          </label>
          <span class="info-tip" :data-tip="t('postalTradeHelp')" aria-label="More information">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 9v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="10" cy="6.5" r="0.9" fill="currentColor"/>
            </svg>
          </span>
        </div>

        <button type="submit" :disabled="loading" class="btn-with-spinner">
          <svg v-if="loading" class="btn-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
          </svg>
          {{ loading ? '' : t('saveProfile') }}
        </button>
      </form>
    </article>

    <article class="card">
      <div class="badges-section">
        <div>
          <div class="badges-header">
            <h2 style="margin:0">{{ t('badgesTitle') }}</h2>
            <span class="badges-earned-count">{{ t('badgesEarned', { count: earnedBadgeIds.size }) }} / {{ BADGES.length }}</span>
          </div>
          <p class="badges-subtitle">{{ t('badgesSubtitle') }}</p>
        </div>
        <div v-for="group in badgesByCategory" :key="group.key" class="badges-category">
          <p class="badges-category-label">{{ group.label }}</p>
          <div class="badges-grid">
            <div
              v-for="badge in group.badges"
              :key="badge.id"
              class="badge-card"
              :class="[earnedBadgeIds.has(badge.id) ? 'earned' : 'locked', `tier-${badge.tier}`]"
            >
              <div class="badge-icon">
                <svg v-if="group.key === 'collection'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                <svg v-else-if="group.key === 'trading'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
                <svg v-else-if="group.key === 'community'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="8" r="2.5"/><path d="M21 21v-1.5a3.5 3.5 0 0 0-2.5-3.36"/>
                </svg>
                <svg v-else-if="group.key === 'predictions'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span class="badge-name">{{ t(`badge_${badge.id}_name`) }}</span>
              <p class="badge-desc">{{ t(`badge_${badge.id}_desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </article>

    <article class="card gdpr-card">
      <h2>{{ t('gdprTitle') }}</h2>
      <p>{{ t('gdprDescription') }}</p>
      <div class="gdpr-actions">
        <button type="button" class="secondary" :disabled="loading" @click="downloadPersonalData">
          {{ t('gdprExportButton') }}
        </button>
      </div>
      <div class="gdpr-danger-zone">
        <h3>{{ t('gdprDeleteTitle') }}</h3>
        <p>{{ t('gdprDeleteDescription') }}</p>
        <button type="button" class="gdpr-delete-btn" :disabled="loading" @click="openDeleteAccountModal">
          {{ t('gdprDeleteButton') }}
        </button>
      </div>
    </article>

    <div
      v-if="showDeleteAccountModal"
      class="gdpr-modal-backdrop"
      role="presentation"
      @click.self="closeDeleteAccountModal"
    >
      <article
        class="gdpr-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'delete-account-modal-title'"
        :aria-describedby="'delete-account-modal-description'"
      >
        <p class="gdpr-modal-kicker">{{ t('gdprDeleteTitle') }}</p>
        <h3 id="delete-account-modal-title">{{ t('gdprDeleteConfirmTitle') }}</h3>
        <p id="delete-account-modal-description">{{ t('gdprDeleteConfirm') }}</p>
        <div class="gdpr-modal-actions">
          <button type="button" class="secondary" :disabled="loading" @click="closeDeleteAccountModal">
            {{ t('cancel') }}
          </button>
          <button type="button" class="gdpr-delete-btn" :disabled="loading" @click="deleteAccount">
            {{ t('gdprDeleteConfirmButton') }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

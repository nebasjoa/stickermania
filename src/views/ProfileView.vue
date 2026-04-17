<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import CountrySelect from '../components/CountrySelect.vue';
import {
  completedPredictionsCount, deleteAccountPermanently, exportPersonalData, loading, predictions, profileForm, saveProfile
} from '../store.js';

const { t } = useI18n();
const router = useRouter();
const showDeleteAccountModal = ref(false);

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

        <label class="checkbox-row">
          <input v-model="profileForm.postalTradeEnabled" type="checkbox" />
          <span>{{ t('postalTrade') }}</span>
        </label>

        <button type="submit" :disabled="loading">{{ t('saveProfile') }}</button>
      </form>
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

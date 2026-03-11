<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import CountrySelect from '../components/CountrySelect.vue';
import {
  isAuthenticated, loading, profileForm, registerForm, loginForm, verificationToken,
  completedPredictionsCount, predictions,
  handleRegister, handleVerify, handleLogin, saveProfile, setStatus
} from '../store.js';

const { t } = useI18n();
const isDev = import.meta.env.VITE_ENV === 'development';
const route = useRoute();

const stickerNumbers = Array.from({ length: 600 }, (_, i) => String(i + 1));
const registerRepeatPassword = ref('');
const totalStickerCount = stickerNumbers.length;

const countryOptions = Object.keys(locations).sort((a, b) => a.localeCompare(b));
const passwordsMatch = computed(
  () => registerForm.password !== '' && registerForm.password === registerRepeatPassword.value
);
const showPasswordFeedback = computed(
  () => registerForm.password !== '' || registerRepeatPassword.value !== ''
);
const collectedStickerCount = computed(() => totalStickerCount - profileForm.needs.length);
const collectedStickerPercent = computed(() =>
  Math.max(0, Math.min(100, (collectedStickerCount.value / totalStickerCount) * 100))
);
const collectedStickerPercentLabel = computed(() => collectedStickerPercent.value.toFixed(1));
const profileCollectedStickerCount = computed(() => totalStickerCount - profileForm.needs.length);

function toggleSticker(form, key, sticker) {
  const list = form[key];
  const idx = list.indexOf(sticker);
  if (idx >= 0) { list.splice(idx, 1); return; }
  list.push(sticker);
  list.sort((a, b) => Number(a) - Number(b));
}

function isStickerSelected(form, key, sticker) {
  return form[key].includes(sticker);
}

function selectAllStickers(form, key) {
  form[key].splice(0, form[key].length, ...stickerNumbers);
}

function clearAllStickers(form, key) {
  form[key].splice(0, form[key].length);
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

onMounted(async () => {
  const token = route.query.verify;
  if (token) {
    verificationToken.value = token;
    await handleVerify(token);
    window.history.replaceState({}, '', '/account');
  }
});

async function submitRegister() {
  if (!passwordsMatch.value) {
    setStatus('', t('passwordsDoNotMatch'));
    return;
  }

  const didRegister = await handleRegister();
  if (didRegister) {
    registerRepeatPassword.value = '';
  }
}

async function submitLogin() {
  await handleLogin();
}

async function submitVerify() {
  await handleVerify(verificationToken.value);
}
</script>

<template>
  <section v-if="!isAuthenticated" class="grid-two">
    <article class="card">
      <h2>{{ t('register') }}</h2>
      <form class="stack" @submit.prevent="submitRegister">
        <input v-model="registerForm.username" :placeholder="t('username')" required />
        <input v-model="registerForm.email" :placeholder="t('email')" type="email" required />
        <input v-model="registerForm.password" :placeholder="t('password')" type="password" required />
        <input v-model="registerRepeatPassword" :placeholder="t('repeatPassword')" type="password" required />
        <p
          v-if="showPasswordFeedback"
          :class="['form-feedback', passwordsMatch ? 'form-feedback--success' : 'form-feedback--error']"
        >
          {{ passwordsMatch ? t('passwordsMatch') : t('passwordsDoNotMatch') }}
        </p>

        <CountrySelect
          v-model="registerForm.country"
          :options="countryOptions"
          :placeholder="t('selectCountry')"
          @update:modelValue="syncCitySelection(registerForm)"
        />

        <select v-model="registerForm.city" :disabled="!registerForm.country">
          <option value="">{{ registerForm.country ? t('selectCity') : t('selectCountryFirst') }}</option>
          <option v-for="city in cityOptionsFor(registerForm)" :key="`register-city-${city}`" :value="city">
            {{ city }}
          </option>
        </select>

        <details class="picker-panel">
          <summary>{{ t('neededStickers') }} | {{ t('selectedCount') }}: {{ registerForm.needs.length }}</summary>
          <div class="picker-actions">
            <button type="button" class="secondary" @click="selectAllStickers(registerForm, 'needs')">{{ t('selectAll') }}</button>
            <button type="button" class="secondary" @click="clearAllStickers(registerForm, 'needs')">{{ t('deselectAll') }}</button>
          </div>
          <div class="sticker-grid">
            <button
              v-for="sticker in stickerNumbers"
              :key="`register-needs-${sticker}`"
              type="button"
              class="sticker-tile"
              :class="{ selected: isStickerSelected(registerForm, 'needs', sticker) }"
              @click="toggleSticker(registerForm, 'needs', sticker)"
            >{{ sticker }}</button>
          </div>
        </details>

        <details class="picker-panel">
          <summary>{{ t('offeredStickers') }} | {{ t('selectedCount') }}: {{ registerForm.offers.length }}</summary>
          <div class="picker-actions">
            <button type="button" class="secondary" @click="selectAllStickers(registerForm, 'offers')">{{ t('selectAll') }}</button>
            <button type="button" class="secondary" @click="clearAllStickers(registerForm, 'offers')">{{ t('deselectAll') }}</button>
          </div>
          <div class="sticker-grid">
            <button
              v-for="sticker in stickerNumbers"
              :key="`register-offers-${sticker}`"
              type="button"
              class="sticker-tile"
              :class="{ selected: isStickerSelected(registerForm, 'offers', sticker) }"
              @click="toggleSticker(registerForm, 'offers', sticker)"
            >{{ sticker }}</button>
          </div>
        </details>

        <label class="checkbox-row">
          <input v-model="registerForm.postalTradeEnabled" type="checkbox" />
          <span>{{ t('postalTrade') }}</span>
        </label>

        <button type="submit" :disabled="loading || !passwordsMatch">{{ t('register') }}</button>
      </form>
    </article>

    <article class="card">
      <h2>{{ t('login') }}</h2>
      <form class="stack" @submit.prevent="submitLogin">
        <input v-model="loginForm.email" :placeholder="t('email')" type="email" required />
        <input v-model="loginForm.password" :placeholder="t('password')" type="password" required />
        <button type="submit" :disabled="loading">{{ t('login') }}</button>
      </form>

      <template v-if="isDev">
        <div class="divider"></div>

        <h3>{{ t('verifyNotice') }}</h3>
        <form class="stack" @submit.prevent="submitVerify">
          <input v-model="verificationToken" placeholder="Verification token" />
          <button type="submit" class="secondary" :disabled="loading">Verify email</button>
        </form>
      </template>
    </article>
  </section>

  <section v-else class="card">
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
  </section>
</template>

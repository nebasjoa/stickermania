<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import CountrySelect from '../components/CountrySelect.vue';
import { STICKER_CODES, STICKER_GROUPS, STICKER_INDEX } from '../data/stickers.js';
import { getCountryFlagCode } from '../utils/countryFlags.js';
import {
  handleRegister, isAuthenticated, loading, registerForm, setStatus
} from '../store.js';

const { t } = useI18n();
const router = useRouter();

if (isAuthenticated.value) {
  router.replace('/profile');
}

const stickerNumbers = STICKER_CODES;
const registerRepeatPassword = ref('');
const countryOptions = Object.keys(locations).sort((a, b) => a.localeCompare(b));
const passwordsMatch = computed(
  () => registerForm.password !== '' && registerForm.password === registerRepeatPassword.value
);
const showPasswordFeedback = computed(
  () => registerForm.password !== '' || registerRepeatPassword.value !== ''
);

function toggleSticker(form, key, sticker) {
  const list = form[key];
  const idx = list.indexOf(sticker);
  if (idx >= 0) {
    list.splice(idx, 1);
    return;
  }
  list.push(sticker);
  list.sort((a, b) => (STICKER_INDEX.get(a) ?? Infinity) - (STICKER_INDEX.get(b) ?? Infinity));
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

async function submitRegister() {
  if (!passwordsMatch.value) {
    setStatus('', t('passwordsDoNotMatch'));
    return;
  }

  const didRegister = await handleRegister();
  if (didRegister) {
    registerRepeatPassword.value = '';
    router.push('/login');
  }
}
</script>

<template>
  <section class="auth-shell">
    <article class="card auth-card">
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
          <div class="sticker-groups">
            <details v-for="wcGroup in STICKER_GROUPS" :key="wcGroup.label" class="sticker-wc-group" open>
              <summary class="sticker-wc-group-summary">{{ wcGroup.label }}</summary>
              <div v-for="team in wcGroup.teams" :key="team.label" class="sticker-group">
                <p class="sticker-group-label">
                <span v-if="getCountryFlagCode(team.label)" :class="`fi fi-${getCountryFlagCode(team.label)}`" class="country-label-flag" aria-hidden="true"></span>{{ team.label }}
              </p>
                <div class="sticker-grid">
                  <button
                    v-for="sticker in team.codes"
                    :key="`register-needs-${sticker}`"
                    type="button"
                    class="sticker-tile"
                    :class="{ selected: isStickerSelected(registerForm, 'needs', sticker) }"
                    @click="toggleSticker(registerForm, 'needs', sticker)"
                  >{{ sticker }}</button>
                </div>
              </div>
            </details>
          </div>
        </details>

        <details class="picker-panel">
          <summary>{{ t('offeredStickers') }} | {{ t('selectedCount') }}: {{ registerForm.offers.length }}</summary>
          <div class="picker-actions">
            <button type="button" class="secondary" @click="selectAllStickers(registerForm, 'offers')">{{ t('selectAll') }}</button>
            <button type="button" class="secondary" @click="clearAllStickers(registerForm, 'offers')">{{ t('deselectAll') }}</button>
          </div>
          <div class="sticker-groups">
            <details v-for="wcGroup in STICKER_GROUPS" :key="wcGroup.label" class="sticker-wc-group" open>
              <summary class="sticker-wc-group-summary">{{ wcGroup.label }}</summary>
              <div v-for="team in wcGroup.teams" :key="team.label" class="sticker-group">
                <p class="sticker-group-label">
                <span v-if="getCountryFlagCode(team.label)" :class="`fi fi-${getCountryFlagCode(team.label)}`" class="country-label-flag" aria-hidden="true"></span>{{ team.label }}
              </p>
                <div class="sticker-grid">
                  <button
                    v-for="sticker in team.codes"
                    :key="`register-offers-${sticker}`"
                    type="button"
                    class="sticker-tile"
                    :class="{ selected: isStickerSelected(registerForm, 'offers', sticker) }"
                    @click="toggleSticker(registerForm, 'offers', sticker)"
                  >{{ sticker }}</button>
                </div>
              </div>
            </details>
          </div>
        </details>

        <label class="checkbox-row">
          <input v-model="registerForm.postalTradeEnabled" type="checkbox" />
          <span>{{ t('postalTrade') }}</span>
        </label>

        <button type="submit" :disabled="loading || !passwordsMatch">{{ t('register') }}</button>
      </form>

      <p class="auth-switch-copy">
        {{ t('authHaveAccount') }}
        <RouterLink to="/login" @click="setStatus()">{{ t('login') }}</RouterLink>
      </p>
    </article>
  </section>
</template>

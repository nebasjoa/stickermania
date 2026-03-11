<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  isAuthenticated, loading, profileForm, registerForm, loginForm, verificationToken,
  completedPredictionsCount, predictions,
  handleRegister, handleVerify, handleLogin, saveProfile, setStatus
} from '../store.js';

const { t } = useI18n();
const route = useRoute();

const stickerNumbers = Array.from({ length: 600 }, (_, i) => String(i + 1));

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

onMounted(async () => {
  const token = route.query.verify;
  if (token) {
    verificationToken.value = token;
    await handleVerify(token);
    window.history.replaceState({}, '', '/account');
  }
});

async function submitRegister() {
  await handleRegister();
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
        <input v-model="registerForm.country" :placeholder="t('country')" />
        <input v-model="registerForm.city" :placeholder="t('city')" />
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
        <button type="submit" :disabled="loading">{{ t('register') }}</button>
      </form>
    </article>

    <article class="card">
      <h2>{{ t('login') }}</h2>
      <form class="stack" @submit.prevent="submitLogin">
        <input v-model="loginForm.email" :placeholder="t('email')" type="email" required />
        <input v-model="loginForm.password" :placeholder="t('password')" type="password" required />
        <button type="submit" :disabled="loading">{{ t('login') }}</button>
      </form>

      <div class="divider"></div>

      <h3>{{ t('verifyNotice') }}</h3>
      <form class="stack" @submit.prevent="submitVerify">
        <input v-model="verificationToken" placeholder="Verification token" />
        <button type="submit" class="secondary" :disabled="loading">Verify email</button>
      </form>
    </article>
  </section>

  <section v-else class="card">
    <h2>{{ t('profileTitle') }}</h2>
    <p>{{ t('predictionDone') }}: {{ completedPredictionsCount }} / {{ predictions.length }}</p>
    <form class="stack" @submit.prevent="saveProfile">
      <input v-model="profileForm.country" :placeholder="t('country')" />
      <input v-model="profileForm.city" :placeholder="t('city')" />
      <details class="picker-panel">
        <summary>{{ t('neededStickers') }} | {{ t('selectedCount') }}: {{ profileForm.needs.length }}</summary>
        <div class="picker-actions">
          <button type="button" class="secondary" @click="selectAllStickers(profileForm, 'needs')">{{ t('selectAll') }}</button>
          <button type="button" class="secondary" @click="clearAllStickers(profileForm, 'needs')">{{ t('deselectAll') }}</button>
        </div>
        <div class="sticker-grid">
          <button
            v-for="sticker in stickerNumbers"
            :key="`profile-needs-${sticker}`"
            type="button"
            class="sticker-tile"
            :class="{ selected: isStickerSelected(profileForm, 'needs', sticker) }"
            @click="toggleSticker(profileForm, 'needs', sticker)"
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

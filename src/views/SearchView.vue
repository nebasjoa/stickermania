<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import CountrySelect from '../components/CountrySelect.vue';
import LocationLabel from '../components/LocationLabel.vue';
import {
  currentUser, isAuthenticated, loading, searchForm, searchResults,
  getTradeDraft, searchCollectors, sendTradeRequest, setStatus
} from '../store.js';

const { t } = useI18n();

const countryOptions = Object.keys(locations);
const searchCityOptions = computed(() => locations[searchForm.country] || []);
const currentUserNeeds = computed(() => currentUser.value?.needs || []);
const currentUserOffers = computed(() => currentUser.value?.offers || []);

function collectorNeedsLabel(user) {
  return t('tradeUserNeeds', { username: user.username });
}

function collectorOffersLabel(user) {
  return t('tradeUserOffers', { username: user.username });
}

function myNeedsLabel() {
  return t('tradeUserNeeds', { username: currentUser.value?.username || t('navAccount') });
}

function myOffersLabel() {
  return t('tradeUserOffers', { username: currentUser.value?.username || t('navAccount') });
}

watch(() => searchForm.country, (next, prev) => {
  if (next !== prev) searchForm.city = '';
});

function isStickerTradeMatch(sticker, source) {
  return source === 'request'
    ? currentUserNeeds.value.includes(sticker)
    : currentUserOffers.value.includes(sticker);
}

function requestedStickerOptions(user) {
  return user.offers.filter((sticker) => isStickerTradeMatch(sticker, 'request'));
}

function offeredStickerOptions(user) {
  return user.needs.filter((sticker) => isStickerTradeMatch(sticker, 'offer'));
}

function isTradeStickerSelected(userId, field, sticker) {
  return getTradeDraft(userId)[field].includes(sticker);
}

function isTradeDraftReady(userId) {
  const draft = getTradeDraft(userId);
  return Boolean(
    draft.requestedStickers.length &&
    draft.offeredStickers.length &&
    draft.phoneNumber.trim() &&
    (draft.tradeMethod !== 'post' || (draft.fullName.trim() && draft.postalAddress.trim()))
  );
}

function toggleTradeSticker(userId, field, sticker) {
  const draft = getTradeDraft(userId);
  const next = new Set(draft[field]);
  if (next.has(sticker)) {
    next.delete(sticker);
  } else {
    next.add(sticker);
  }
  draft[field] = [...next].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

const searchDisabledNote = computed(() => {
  if (loading.value) {
    return t('searchDisabledLoading');
  }
  if (!isAuthenticated.value) {
    return t('searchDisabledAuth');
  }
  return '';
});

async function doSearch() {
  const found = await searchCollectors();
  if (!found && !searchResults.value.length) {
    setStatus(t('noSearchResults'));
  }
}
</script>

<template>
  <section class="stack">
    <article class="card">
      <h2>{{ t('searchTitle') }}</h2>
      <form class="search-row search-row-collectors" @submit.prevent="doSearch">
        <div class="search-fields search-fields-collectors">
          <input
            v-model="searchForm.numbers"
            :placeholder="t('searchPlaceholder')"
            :disabled="!isAuthenticated"
          />
          <CountrySelect
            v-model="searchForm.country"
            :options="countryOptions"
            :placeholder="t('anyCountry')"
            :disabled="!isAuthenticated"
          />
          <select v-model="searchForm.city" :disabled="!isAuthenticated || !searchForm.country">
            <option value="">{{ t('anyCity') }}</option>
            <option v-for="city in searchCityOptions" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        <button type="submit" :disabled="loading || !isAuthenticated">{{ t('searchButton') }}</button>
      </form>
      <small v-if="searchDisabledNote" class="search-disabled-note">{{ searchDisabledNote }}</small>
      <small>{{ t('searchHelp') }}</small>
    </article>

    <div v-if="isAuthenticated" class="results-grid">
      <article v-for="user in searchResults" :key="user.id" class="card">
        <div class="card-top">
          <div>
            <h3>{{ user.username }}</h3>
            <p><LocationLabel :city="user.city" :country="user.country" /></p>
          </div>
          <span class="pill" :class="{ muted: !user.postalTradeEnabled }">
            {{ user.postalTradeEnabled ? t('byPost') : t('inPerson') }}
          </span>
        </div>

        <details class="sticker-section search-sticker-panel">
          <summary>
            <span>{{ collectorNeedsLabel(user) }}:</span>
            <span class="search-sticker-panel-count">{{ user.needs.length }}</span>
          </summary>
          <span v-if="user.needs.length" class="sticker-list">
            <span v-for="n in user.needs" :key="n" class="sticker-chip need">{{ n }}</span>
          </span>
          <span v-else class="text-muted">-</span>
        </details>
        <details class="sticker-section search-sticker-panel">
          <summary>
            <span>{{ collectorOffersLabel(user) }}:</span>
            <span class="search-sticker-panel-count">{{ user.offers.length }}</span>
          </summary>
          <span v-if="user.offers.length" class="sticker-list">
            <span v-for="n in user.offers" :key="n" class="sticker-chip offer">{{ n }}</span>
          </span>
          <span v-else class="text-muted">-</span>
        </details>

        <form class="stack compact" @submit.prevent="sendTradeRequest(user.id)">
          <div class="trade-sticker-picker">
            <strong>{{ myNeedsLabel() }}:</strong>
            <span v-if="requestedStickerOptions(user).length" class="trade-sticker-list">
              <button
                v-for="sticker in requestedStickerOptions(user)"
                :key="`trade-request-${user.id}-${sticker}`"
                type="button"
                class="trade-sticker-chip trade-sticker-chip--need is-match"
                :class="{ 'is-selected': isTradeStickerSelected(user.id, 'requestedStickers', sticker) }"
                @click="toggleTradeSticker(user.id, 'requestedStickers', sticker)"
              >{{ sticker }}</button>
            </span>
            <span v-else class="text-muted">-</span>
          </div>
          <div class="trade-sticker-picker">
            <strong>{{ myOffersLabel() }}:</strong>
            <span v-if="offeredStickerOptions(user).length" class="trade-sticker-list">
              <button
                v-for="sticker in offeredStickerOptions(user)"
                :key="`trade-offer-${user.id}-${sticker}`"
                type="button"
                class="trade-sticker-chip trade-sticker-chip--offer is-match"
                :class="{ 'is-selected': isTradeStickerSelected(user.id, 'offeredStickers', sticker) }"
                @click="toggleTradeSticker(user.id, 'offeredStickers', sticker)"
              >{{ sticker }}</button>
            </span>
            <span v-else class="text-muted">-</span>
          </div>
          <select v-model="getTradeDraft(user.id).tradeMethod">
            <option value="in_person">{{ t('inPerson') }}</option>
            <option value="post">{{ t('byPost') }}</option>
          </select>
          <input
            v-model="getTradeDraft(user.id).phoneNumber"
            :placeholder="t('phoneNumber')"
          />
          <input
            v-if="getTradeDraft(user.id).tradeMethod === 'post'"
            v-model="getTradeDraft(user.id).fullName"
            :placeholder="t('fullName')"
          />
          <input
            v-if="getTradeDraft(user.id).tradeMethod === 'post'"
            v-model="getTradeDraft(user.id).postalAddress"
            :placeholder="t('postalAddress')"
          />
          <input v-model="getTradeDraft(user.id).locationNote" :placeholder="t('locationNote')" />
          <button
            type="submit"
            :disabled="loading || !isTradeDraftReady(user.id)"
          >{{ t('sendTrade') }}</button>
        </form>
      </article>
    </div>
  </section>
</template>

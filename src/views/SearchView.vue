<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import locations from '../data/locations.json';
import {
  isAuthenticated, loading, searchForm, searchResults,
  getTradeDraft, searchCollectors, sendTradeRequest, setStatus
} from '../store.js';

const { t } = useI18n();

const countryOptions = Object.keys(locations);
const searchCityOptions = computed(() => locations[searchForm.country] || []);

watch(() => searchForm.country, (next, prev) => {
  if (next !== prev) searchForm.city = '';
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
          <select v-model="searchForm.country" :disabled="!isAuthenticated">
            <option value="">{{ t('anyCountry') }}</option>
            <option v-for="country in countryOptions" :key="country" :value="country">{{ country }}</option>
          </select>
          <select v-model="searchForm.city" :disabled="!isAuthenticated || !searchForm.country">
            <option value="">{{ t('anyCity') }}</option>
            <option v-for="city in searchCityOptions" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        <button type="submit" :disabled="loading || !isAuthenticated">{{ t('searchButton') }}</button>
      </form>
      <small>{{ t('searchHelp') }}</small>
    </article>

    <div v-if="isAuthenticated" class="results-grid">
      <article v-for="user in searchResults" :key="user.id" class="card">
        <div class="card-top">
          <div>
            <h3>{{ user.username }}</h3>
            <p>{{ user.city }}, {{ user.country }}</p>
          </div>
          <span class="pill" :class="{ muted: !user.postalTradeEnabled }">
            {{ user.postalTradeEnabled ? t('byPost') : t('inPerson') }}
          </span>
        </div>

        <p><strong>{{ t('neededStickers') }}:</strong> {{ user.needs.join(', ') || '-' }}</p>
        <p><strong>{{ t('offeredStickers') }}:</strong> {{ user.offers.join(', ') || '-' }}</p>

        <form class="stack compact" @submit.prevent="sendTradeRequest(user.id)">
          <input v-model="getTradeDraft(user.id).requestedStickers" :placeholder="t('neededStickers')" />
          <input v-model="getTradeDraft(user.id).offeredStickers" :placeholder="t('offeredStickers')" />
          <select v-model="getTradeDraft(user.id).tradeMethod">
            <option value="in_person">{{ t('inPerson') }}</option>
            <option value="post">{{ t('byPost') }}</option>
          </select>
          <input v-model="getTradeDraft(user.id).locationNote" :placeholder="t('locationNote')" />
          <button type="submit" :disabled="loading">{{ t('sendTrade') }}</button>
        </form>
      </article>
    </div>
  </section>
</template>

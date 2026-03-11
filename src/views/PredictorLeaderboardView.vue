<script setup>
import { computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import CountrySelect from '../components/CountrySelect.vue';
import LocationLabel from '../components/LocationLabel.vue';
import { fetchHomeLeaderboard, homeLeaderboard, loading } from '../store.js';

const { t } = useI18n();

const filters = reactive({
  country: '',
  sort: 'desc'
});

const countryOptions = computed(() =>
  [...new Set(homeLeaderboard.value.map((entry) => entry.country).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
);

const leaderboardEntries = computed(() => {
  const filtered = filters.country
    ? homeLeaderboard.value.filter((entry) => entry.country === filters.country)
    : [...homeLeaderboard.value];

  filtered.sort((a, b) => {
    const pointsDelta = filters.sort === 'asc' ? a.points - b.points : b.points - a.points;
    if (pointsDelta !== 0) return pointsDelta;
    return a.username.localeCompare(b.username);
  });

  return filtered;
});

onMounted(async () => {
  await fetchHomeLeaderboard();
});
</script>

<template>
  <section class="stack">
    <article class="card">
      <div class="card-top">
        <div>
          <p class="eyebrow">Predictions</p>
          <h2>All Predictors</h2>
        </div>
      </div>

      <form class="search-row search-row-collectors predictor-filter-row" @submit.prevent>
        <div class="search-fields search-fields-collectors predictor-filter-fields">
          <CountrySelect
            v-model="filters.country"
            :options="countryOptions"
            :placeholder="t('anyCountry')"
          />

          <select v-model="filters.sort">
            <option value="desc">Points: high to low</option>
            <option value="asc">Points: low to high</option>
          </select>
        </div>
      </form>
    </article>

    <article v-if="!loading && !leaderboardEntries.length" class="card">
      <p>No predictors found for the selected filter.</p>
    </article>

    <article v-else class="card predictor-table-card">
      <div class="predictor-table-wrap">
        <table class="predictor-table">
          <thead>
            <tr>
              <th class="predictor-col-rank">#</th>
              <th>User</th>
              <th>Location</th>
              <th class="predictor-col-points">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in leaderboardEntries" :key="`predictor-${entry.username}-${entry.country}`">
              <td class="predictor-col-rank">{{ index + 1 }}</td>
              <td class="predictor-col-user">{{ entry.username }}</td>
              <td><LocationLabel :city="entry.city" :country="entry.country" /></td>
              <td class="predictor-col-points">{{ entry.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { STICKER_CODES, STICKER_GROUPS } from '../data/stickers.js';
import LocationLabel from '../components/LocationLabel.vue';
import api from '../api.js';

const { t } = useI18n();
const route = useRoute();

const user = ref(null);
const notFound = ref(false);
const pageLoading = ref(true);

const totalCount = STICKER_CODES.length;
const needsSet = computed(() => new Set(user.value?.needs || []));

const collectedCount = computed(() =>
  user.value ? totalCount - (user.value.needs?.length ?? totalCount) : 0
);
const collectedPercent = computed(() =>
  Math.max(0, Math.min(100, (collectedCount.value / totalCount) * 100))
);
const collectedPercentLabel = computed(() => collectedPercent.value.toFixed(1));

const groupRows = computed(() =>
  STICKER_GROUPS.map((g) => ({
    label: g.label,
    total: g.codes.length,
    collected: g.codes.filter((c) => !needsSet.value.has(c)),
  }))
);

onMounted(async () => {
  try {
    const { data } = await api.get(`/users/profile/${encodeURIComponent(route.params.username)}`);
    user.value = data.user;
  } catch (err) {
    notFound.value = true;
  } finally {
    pageLoading.value = false;
  }
});
</script>

<template>
  <section class="stack">
    <div v-if="pageLoading" class="public-profile-loading">Loading…</div>

    <template v-else-if="notFound">
      <article class="card">
        <p>{{ t('meetupNotFound') }}</p>
      </article>
    </template>

    <template v-else-if="user">
      <article class="card public-profile-header">
        <div class="public-profile-top">
          <div>
            <h2 class="public-profile-username">{{ user.username }}</h2>
            <p class="public-profile-location">
              <LocationLabel :city="user.city" :country="user.country" />
            </p>
          </div>
          <span v-if="user.postalTradeEnabled" class="pill">{{ t('byPost') }}</span>
        </div>

        <section class="collection-progress" :aria-label="t('collectionProgressTitle')">
          <div class="collection-progress-head">
            <div>
              <p class="collection-progress-kicker">{{ t('collectionProgressTitle') }}</p>
              <p class="collection-progress-copy">
                {{ collectedCount }} / {{ totalCount }} {{ t('collectionProgressCollected') }}
              </p>
            </div>
            <strong class="collection-progress-percent">{{ collectedPercentLabel }}%</strong>
          </div>
          <div class="collection-progress-track" role="progressbar" aria-valuemin="0" :aria-valuemax="totalCount" :aria-valuenow="collectedCount">
            <span class="collection-progress-fill" :style="{ width: `${collectedPercent}%` }"></span>
          </div>
        </section>
      </article>

      <article class="card">
        <h3 class="public-profile-section-title">{{ t('collectedStickers') }} ({{ collectedCount }})</h3>
        <div v-if="collectedCount === 0" class="text-muted">—</div>
        <table v-else class="public-profile-table">
          <thead>
            <tr>
              <th>{{ t('standingsGroupLabel', { group: '' }).trim() || 'Group' }}</th>
              <th>{{ t('collectionProgressCollected') }}</th>
              <th>Stickers</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in groupRows" :key="row.label" :class="{ 'pub-row-empty': row.collected.length === 0 }">
              <td class="pub-col-label">{{ row.label }}</td>
              <td class="pub-col-count">{{ row.collected.length }}&thinsp;/&thinsp;{{ row.total }}</td>
              <td class="pub-col-stickers">
                <span v-if="row.collected.length === 0" class="text-muted">—</span>
                <span v-else class="sticker-list">
                  <span v-for="s in row.collected" :key="s" class="sticker-chip pub-chip">{{ s }}</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <article v-if="user.offers?.length" class="card">
        <h3 class="public-profile-section-title">{{ t('offeredStickers') }} ({{ user.offers.length }})</h3>
        <span class="sticker-list">
          <span v-for="s in user.offers" :key="s" class="sticker-chip offer">{{ s }}</span>
        </span>
      </article>
    </template>
  </section>
</template>

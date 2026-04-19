<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { articles, NEWS_CATEGORIES } from '../data/news.js';

const { t } = useI18n();

const selectedCategory = ref('');
const sortOrder = ref('newest');

const filteredArticles = computed(() => {
  let list = selectedCategory.value
    ? articles.filter(a => a.category === selectedCategory.value)
    : [...articles];

  if (sortOrder.value === 'newest') {
    list.sort((a, b) => b.date.localeCompare(a.date));
  } else {
    list.sort((a, b) => a.date.localeCompare(b.date));
  }
  return list;
});

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <section class="stack">
    <div class="card news-header">
      <div>
        <p class="eyebrow">{{ t('newsEyebrow') }}</p>
        <h1>{{ t('newsTitle') }}</h1>
        <p>{{ t('newsSubtitle') }}</p>
      </div>
    </div>

    <div class="news-toolbar card">
      <div class="news-filter-group">
        <span class="news-filter-label">{{ t('newsFilterCategory') }}</span>
        <div class="news-category-pills">
          <button
            type="button"
            :class="['news-pill', { active: selectedCategory === '' }]"
            @click="selectedCategory = ''"
          >{{ t('newsAll') }}</button>
          <button
            v-for="(label, key) in NEWS_CATEGORIES"
            :key="key"
            type="button"
            :class="['news-pill', { active: selectedCategory === key }]"
            @click="selectedCategory = key"
          >{{ label }}</button>
        </div>
      </div>

      <div class="news-sort-group">
        <span class="news-filter-label">{{ t('newsSort') }}</span>
        <select v-model="sortOrder" class="news-sort-select">
          <option value="newest">{{ t('newsSortNewest') }}</option>
          <option value="oldest">{{ t('newsSortOldest') }}</option>
        </select>
      </div>
    </div>

    <p v-if="!filteredArticles.length" class="card news-empty">{{ t('newsEmpty') }}</p>

    <div class="news-grid">
      <RouterLink
        v-for="article in filteredArticles"
        :key="article.id"
        :to="`/news/${article.slug}`"
        class="news-card card"
      >
        <div class="news-card-meta">
          <span class="news-category-badge">{{ NEWS_CATEGORIES[article.category] }}</span>
          <span class="news-date">{{ formatDate(article.date) }}</span>
        </div>
        <h2 class="news-card-title">{{ article.title }}</h2>
        <p class="news-card-summary">{{ article.summary }}</p>
        <span class="news-read-more">{{ t('newsReadMore') }} →</span>
      </RouterLink>
    </div>
  </section>
</template>

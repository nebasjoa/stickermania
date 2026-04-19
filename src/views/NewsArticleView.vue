<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { articles, NEWS_CATEGORIES } from '../data/news.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const article = computed(() => articles.find(a => a.slug === route.params.slug) ?? null);

const relatedArticles = computed(() => {
  if (!article.value) return [];
  return articles
    .filter(a => a.id !== article.value.id && a.category === article.value.category)
    .slice(0, 3);
});

if (!article.value) {
  router.replace('/news');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <section v-if="article" class="stack">
    <div class="card news-article-header">
      <RouterLink to="/news" class="news-back-link">← {{ t('newsBackToList') }}</RouterLink>
      <div class="news-article-meta">
        <span class="news-category-badge">{{ NEWS_CATEGORIES[article.category] }}</span>
        <span class="news-date">{{ formatDate(article.date) }}</span>
      </div>
      <h1 class="news-article-title">{{ article.title }}</h1>
      <p class="news-article-summary">{{ article.summary }}</p>
    </div>

    <article class="card news-article-body">
      <p v-for="(paragraph, i) in article.content" :key="i" class="news-paragraph">{{ paragraph }}</p>
    </article>

    <div v-if="relatedArticles.length" class="card stack">
      <h2 class="news-related-title">{{ t('newsRelated') }}</h2>
      <div class="news-related-grid">
        <RouterLink
          v-for="related in relatedArticles"
          :key="related.id"
          :to="`/news/${related.slug}`"
          class="news-related-card"
        >
          <span class="news-category-badge">{{ NEWS_CATEGORIES[related.category] }}</span>
          <strong>{{ related.title }}</strong>
          <span class="news-date">{{ formatDate(related.date) }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

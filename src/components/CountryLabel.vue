<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCountryFlagCode } from '../utils/countryFlags.js';

const props = defineProps({
  country: {
    type: String,
    default: ''
  },
  fallback: {
    type: String,
    default: ''
  }
});

const { t, te } = useI18n();

const text = computed(() => {
  const country = String(props.country || '').trim();
  if (country && te(`countries.${country}`)) {
    return t(`countries.${country}`);
  }
  return country || props.fallback;
});
const flagCode = computed(() => getCountryFlagCode(props.country));
</script>

<template>
  <span class="country-label">
    <span v-if="flagCode" :class="`fi fi-${flagCode}`" class="country-label-flag" aria-hidden="true"></span>
    <span>{{ text }}</span>
  </span>
</template>

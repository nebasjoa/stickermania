<script setup>
import { computed } from 'vue';
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

const text = computed(() => props.country || props.fallback);
const flagCode = computed(() => getCountryFlagCode(props.country));
</script>

<template>
  <span class="country-label">
    <span v-if="flagCode" :class="`fi fi-${flagCode}`" class="country-label-flag" aria-hidden="true"></span>
    <span>{{ text }}</span>
  </span>
</template>

<script setup>
import CountryLabel from './CountryLabel.vue';

defineProps({
  city: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  fallback: {
    type: String,
    default: '-'
  }
});
</script>

<template>
  <span v-if="city || country" class="location-label">
    <CountryLabel v-if="country" :country="country" />
    <span v-if="city && country" class="location-label-sep">({{ city }})</span>
    <span v-else-if="city">{{ city }}</span>
  </span>
  <span v-else>{{ fallback }}</span>
</template>

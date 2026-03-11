<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import CountryLabel from './CountryLabel.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select country'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const rootEl = ref(null);

const selectedCountry = computed(() =>
  props.options.find((option) => option === props.modelValue) || ''
);

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
}

function selectCountry(country) {
  emit('update:modelValue', country);
  isOpen.value = false;
}

function onClickOutside(event) {
  if (!rootEl.value?.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>

<template>
  <div ref="rootEl" class="country-select" :class="{ open: isOpen, disabled }">
    <button
      type="button"
      class="country-select-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <CountryLabel v-if="selectedCountry" :country="selectedCountry" />
      <span v-else class="country-select-placeholder">{{ placeholder }}</span>
      <svg class="country-select-caret" viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div v-if="isOpen" class="country-select-menu">
      <button
        type="button"
        class="country-select-option"
        :class="{ selected: modelValue === '' }"
        @click="selectCountry('')"
      >
        <span>{{ placeholder }}</span>
      </button>
      <button
        v-for="country in options"
        :key="country"
        type="button"
        class="country-select-option"
        :class="{ selected: modelValue === country }"
        @click="selectCountry(country)"
      >
        <CountryLabel :country="country" />
      </button>
    </div>
  </div>
</template>

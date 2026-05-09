<script setup lang="ts">
defineProps<{
  name: 'building' | 'list' | 'pie' | 'truck' | 'bars' | 'bulb'
}>()
</script>

<template>
  <span class="nav-icon-wrap" aria-hidden="true">
    <svg v-if="name === 'building'" class="nav-svg" viewBox="0 0 24 24" fill="none">
      <path d="M4 21V10l8-5 8 5v11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 21v-7h6v7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4 21h16" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'list'" class="nav-svg" viewBox="0 0 24 24" fill="none">
      <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      <path d="M5 6h.01M5 12h.01M5 18h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'pie'" class="nav-svg" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12V3a9 9 0 109 9h-9z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <path
        d="M12 12L3.5 12A8.5 8.5 0 0112 3.5V12z"
        fill="currentColor"
        opacity="0.2"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
    </svg>
    <svg v-else-if="name === 'truck'" class="nav-svg" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 18V8H4v10M14 18h4l3-4v-4h-4M14 18H4M8 18a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <svg v-else-if="name === 'bars'" class="nav-svg" viewBox="0 0 24 24" fill="none">
      <path d="M5 20V12M12 20V4M19 20v-8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      <path d="M3 20h18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </svg>
    <svg v-else class="nav-svg" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18h6M10 22h4M12 3a5 5 0 015 5c0 2-1.5 3.5-2.5 4.5L14 14h-4l-.5-1.5C8.5 11.5 7 10 7 8a5 5 0 015-5z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.nav-icon-wrap {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--db-primary);
}

.nav-svg {
  width: 18px;
  height: 18px;
}
</style>

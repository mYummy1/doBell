<script setup lang="ts">
defineProps<{
  kind: number
}>()
</script>

<template>
  <svg class="industry-mini-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <template v-if="kind % 6 === 0">
      <path
        d="M8 4h8l2 4v12H6V8l2-4zM9 9h6M9 13h4"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
    <template v-else-if="kind % 6 === 1">
      <path
        d="M12 3v18M7 8l5-3 5 3M7 16l5 3 5-3"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
    <template v-else-if="kind % 6 === 2">
      <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.65" />
      <path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" />
    </template>
    <template v-else-if="kind % 6 === 3">
      <path
        d="M4 19h16M7 16l3-9 4 6 3-11 3 14"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
    <template v-else-if="kind % 6 === 4">
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
    <template v-else>
      <path
        d="M6 9h12v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9zM9 9V7a3 3 0 016 0v2"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
  </svg>
</template>

<style scoped>
.industry-mini-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}
</style>

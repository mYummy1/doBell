<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <h2 class="section-heading">
    <span class="section-heading-bar" aria-hidden="true" />
    <span class="section-heading-ico">
      <slot />
    </span>
    <span class="section-heading-text">{{ title }}</span>
  </h2>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: var(--db-text);
}

.section-heading-bar {
  width: 3px;
  height: 18px;
  border-radius: 2px;
  background: var(--db-primary);
  flex-shrink: 0;
}

.section-heading-ico {
  display: inline-flex;
  flex-shrink: 0;
  color: #64748b;
}

.section-heading-ico :deep(svg) {
  width: 20px;
  height: 20px;
}

.section-heading-text {
  line-height: 1.3;
}
</style>

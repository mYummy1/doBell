<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { userDisplayName, logout: authLogout } = useAuth()

const router = useRouter()
const root = ref<HTMLElement | null>(null)
const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onDocPointerDown(ev: PointerEvent) {
  if (!open.value || !root.value) return
  const t = ev.target as Node | null
  if (t && !root.value.contains(t)) close()
}

function onLogout() {
  close()
  authLogout()
  router.push({ name: 'home' })
}

function goProfile() {
  close()
  router.push({ name: 'profile' })
}

onMounted(() => document.addEventListener('pointerdown', onDocPointerDown, true))
onUnmounted(() => document.removeEventListener('pointerdown', onDocPointerDown, true))
</script>

<template>
  <div ref="root" class="user-menu" :class="{ 'user-menu--open': open }">
    <button
      type="button"
      class="user-trigger"
      :aria-expanded="open"
      aria-haspopup="true"
      aria-controls="user-menu-panel"
      @click.stop="toggle"
    >
      <span class="avatar" aria-hidden="true">{{ userDisplayName.slice(0, 1) }}</span>
      <span class="user-name">{{ userDisplayName }}</span>
      <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      id="user-menu-panel"
      class="user-dropdown"
      role="menu"
      :hidden="!open"
      @keydown.escape.prevent="close"
    >
      <button type="button" class="user-dropdown-item" role="menuitem" @click="goProfile">个人中心</button>
      <button type="button" class="user-dropdown-item user-dropdown-item--danger" role="menuitem" @click="onLogout">
        退出登录
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
  flex-shrink: 0;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  border: 1px solid var(--db-border);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font: inherit;
  color: var(--db-text);
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.user-trigger:hover,
.user-menu--open .user-trigger {
  border-color: #cfd9dc;
  box-shadow: 0 2px 8px rgba(15, 45, 56, 0.06);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(145deg, #145a48, var(--db-primary));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.chevron {
  color: var(--db-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user-menu--open .chevron {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 160px;
  padding: 6px;
  margin: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e4e9f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 45, 56, 0.12);
  z-index: 200;
}

.user-dropdown[hidden] {
  display: none;
}

.user-dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--db-text);
  cursor: pointer;
}

.user-dropdown-item:hover {
  background: #f0f4f7;
}

.user-dropdown-item--danger {
  color: #b91c1c;
}

.user-dropdown-item--danger:hover {
  background: #fef2f2;
}
</style>

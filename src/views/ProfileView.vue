<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'

const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`
const router = useRouter()
const { isLoggedIn } = useAuth()

watch(
  isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) router.replace({ name: 'home' })
  },
  { immediate: true }
)
</script>

<template>
  <div class="page">
    <header class="header">
      <RouterLink to="/" class="brand">
        <img
          class="brand-logo"
          :src="faviconUrl"
          alt=""
          width="40"
          height="40"
        />
        <span class="brand-title">企业 AI 智能体数据平台</span>
      </RouterLink>
      <AuthGuestBar v-if="!isLoggedIn" />
      <UserMenuDropdown v-else />
    </header>

    <main class="main">
      <h1 class="title">个人中心</h1>
      <p class="hint">在此管理账户信息与系统偏好。</p>
      <RouterLink to="/" class="back-link">返回首页</RouterLink>
    </main>
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  gap: 24px;
  border-bottom: 1px solid #e8eaed;
}

@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .brand-title {
    font-size: 13px;
    max-width: min(55vw, 220px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.brand-logo {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: block;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--db-brand);
  letter-spacing: 0.02em;
}

.main {
  flex: 1;
  padding: 40px 40px 80px;
  max-width: 720px;
}

.title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--db-text);
}

.hint {
  margin: 0 0 24px;
  font-size: 15px;
  color: var(--db-muted);
  line-height: 1.6;
}

.back-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--db-primary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

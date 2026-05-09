<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { login } = useAuth()

function onRegister() {
  login()
}
</script>

<template>
  <div class="auth-guest-bar" role="group" aria-label="未登录操作">
    <button type="button" class="auth-btn auth-btn--ghost" @click="login">登录</button>
    <button type="button" class="auth-btn auth-btn--solid" @click="onRegister">注册</button>
  </div>
</template>

<style scoped>
.auth-guest-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font: inherit;
  transition:
    background 0.2s,
    box-shadow 0.2s,
    border-color 0.2s,
    transform 0.15s;
}

.auth-btn:active {
  transform: scale(0.98);
}

.auth-btn--ghost {
  border: 1px solid var(--db-primary);
  background: #fff;
  color: var(--db-primary);
}

.auth-btn--ghost:hover {
  background: rgba(0, 108, 77, 0.06);
  box-shadow: 0 2px 10px rgba(0, 108, 77, 0.1);
}

.auth-btn--solid {
  border: 1px solid transparent;
  background: linear-gradient(135deg, var(--db-brand) 0%, var(--db-primary) 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(26, 62, 76, 0.25);
}

.auth-btn--solid:hover {
  box-shadow: 0 6px 20px rgba(0, 108, 77, 0.35);
  filter: brightness(1.05);
}
</style>

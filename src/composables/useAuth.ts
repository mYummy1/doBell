import { ref } from 'vue'

/** 存在且为 `1` 表示用户已主动退出，展示访客登录/注册；缺省为已登录 */
const STORAGE_GUEST_KEY = 'db-auth-guest'

export const USER_DISPLAY_NAME = '王小满'

function readStored(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_GUEST_KEY) !== '1'
  } catch {
    return true
  }
}

const isLoggedIn = ref(readStored())

export function useAuth() {
  function login() {
    isLoggedIn.value = true
    try {
      sessionStorage.removeItem(STORAGE_GUEST_KEY)
    } catch {
      /* ignore */
    }
  }

  function logout() {
    isLoggedIn.value = false
    try {
      sessionStorage.setItem(STORAGE_GUEST_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return {
    isLoggedIn,
    login,
    logout,
    userDisplayName: USER_DISPLAY_NAME,
  }
}

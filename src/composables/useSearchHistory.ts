import { ref } from 'vue'

const STORAGE_KEY = 'db-search-company-history'
const MAX_ITEMS = 40

/** 与输入框 datalist 共用的 id */
export const SEARCH_HISTORY_DATALIST_ID = 'db-company-search-history'

function readStorage(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function persist(list: string[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)))
  } catch {
    /* quota / private mode */
  }
}

const history = ref<string[]>(readStorage())

export function useSearchHistory() {
  function refresh() {
    history.value = readStorage()
  }

  /** 将一次有效查询记为最近使用（去重、置顶、截断） */
  function rememberQuery(raw: string) {
    const q = raw.trim()
    if (!q) return
    const prev = readStorage()
    const next = [q, ...prev.filter((x) => x !== q)].slice(0, MAX_ITEMS)
    persist(next)
    history.value = next
  }

  return { history, rememberQuery, refresh }
}

<script setup lang="ts">
import { ref } from 'vue'

/** 演示：联想下拉固定唯一企业（不受输入内容影响） */
const FIXED_SEARCH_SUGGEST_COMPANY = '安徽安大笃北信息科技有限责任公司'

withDefaults(
  defineProps<{
    modelValue: string
    variant?: 'hero' | 'header'
    placeholder?: string
    inputId?: string
  }>(),
  {
    variant: 'hero',
    placeholder: '企业名称/统一社会信用代码/股东姓名',
    inputId: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const wrapRef = ref<HTMLElement | null>(null)
const panelOpen = ref(false)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function openPanel() {
  panelOpen.value = true
}

function closePanelIfOutside() {
  requestAnimationFrame(() => {
    const el = wrapRef.value
    const ae = document.activeElement
    if (el && ae && el.contains(ae)) return
    panelOpen.value = false
  })
}

function pickSuggest() {
  emit('update:modelValue', FIXED_SEARCH_SUGGEST_COMPANY)
  panelOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') panelOpen.value = false
}
</script>

<template>
  <div
    ref="wrapRef"
    class="company-search-input"
    :class="`company-search-input--${variant}`"
    @focusin.capture="openPanel"
    @focusout.capture="closePanelIfOutside"
  >
    <input
      :id="inputId"
      :value="modelValue"
      type="search"
      class="company-search-input__field"
      :placeholder="placeholder"
      autocomplete="off"
      enterkeyhint="search"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="panelOpen"
      aria-haspopup="listbox"
      @input="onInput"
      @keydown="onKeydown"
    />
    <ul
      v-show="panelOpen"
      class="company-search-input__panel"
      role="listbox"
      aria-label="企业联想"
    >
      <li role="none">
        <button
          type="button"
          class="company-search-input__option"
          role="option"
          @mousedown.prevent
          @click="pickSuggest"
        >
          {{ FIXED_SEARCH_SUGGEST_COMPANY }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.company-search-input {
  position: relative;
  flex: 1;
  min-width: 0;
}

.company-search-input__field {
  display: block;
  width: 100%;
  box-sizing: border-box;
  border: none;
  background: transparent;
  outline: none;
  color: var(--db-text);
}

.company-search-input--hero .company-search-input__field {
  font-size: 15px;
  padding: 12px 0;
  user-select: text;
  -webkit-user-select: text;
}

.company-search-input--hero .company-search-input__field::placeholder {
  color: var(--db-placeholder);
}

.company-search-input--header .company-search-input__field {
  font-size: 14px;
  padding: 8px 0;
}

.company-search-input__panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 80;
  margin: 0;
  padding: 6px 0;
  list-style: none;
  background: #fff;
  border: 1px solid rgba(26, 62, 76, 0.12);
  border-radius: 12px;
  box-shadow:
    0 14px 40px rgba(15, 45, 56, 0.12),
    0 4px 12px rgba(15, 45, 56, 0.06);
}

.company-search-input__option {
  display: block;
  width: 100%;
  margin: 0;
  padding: 11px 14px;
  border: none;
  font: inherit;
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
  color: var(--db-text);
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    font-weight 0.1s;
}

.company-search-input__option:hover {
  font-weight: 600;
  background: rgba(0, 108, 77, 0.07);
}

.company-search-input__option:focus-visible {
  outline: 2px solid rgba(0, 108, 77, 0.35);
  outline-offset: -2px;
}
</style>

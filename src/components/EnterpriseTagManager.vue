<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const TAG_CATEGORIES = [
  { id: 'qualification', label: '资质认定', presets: ['高新技术企业', '专精特新小巨人', '科技型中小企业'] },
  { id: 'industry', label: '行业分类', presets: ['人工智能', '软件和信息技术服务业', '集成电路'] },
  { id: 'capital', label: '资本背景', presets: ['上市公司', '国资参股', '外资背景'] },
  { id: 'custom', label: '自定义', presets: [] },
] as const

const props = defineProps<{
  initialTags: string[]
}>()

const managedTags = ref<string[]>([...props.initialTags])
const newTagInput = ref('')
const activeCategory = ref<(typeof TAG_CATEGORIES)[number]['id']>('qualification')
const saveHint = ref('')

watch(
  () => props.initialTags,
  (tags) => {
    managedTags.value = [...tags]
  }
)

const activePresets = computed(() => {
  const cat = TAG_CATEGORIES.find((c) => c.id === activeCategory.value)
  return cat?.presets ?? []
})

function addTag(label: string) {
  const trimmed = label.trim()
  if (!trimmed || managedTags.value.includes(trimmed)) return
  managedTags.value = [...managedTags.value, trimmed]
}

function removeTag(index: number) {
  managedTags.value = managedTags.value.filter((_, i) => i !== index)
}

function onAddCustom() {
  addTag(newTagInput.value)
  newTagInput.value = ''
}

function onSave() {
  saveHint.value = `已保存 ${managedTags.value.length} 个标签（演示）`
  setTimeout(() => {
    saveHint.value = ''
  }, 2500)
}

function onReset() {
  managedTags.value = [...props.initialTags]
  saveHint.value = ''
}
</script>

<template>
  <div class="etm">
    <div class="etm-toolbar" role="toolbar" aria-label="企业标签管理">
      <p class="etm-lead">
        维护企业多维标签体系，支持按资质认定、行业分类、资本背景等维度打标与检索。
      </p>
      <div class="etm-actions">
        <button type="button" class="etm-btn etm-btn--ghost" @click="onReset">重置</button>
        <button type="button" class="etm-btn etm-btn--primary" @click="onSave">保存标签</button>
      </div>
    </div>
    <p v-if="saveHint" class="etm-save-hint" role="status">{{ saveHint }}</p>

    <section class="etm-section" aria-labelledby="etm-current-title">
      <h3 id="etm-current-title" class="etm-section-title">当前标签（{{ managedTags.length }}）</h3>
      <div v-if="managedTags.length" class="tag-row">
        <span
          v-for="(label, i) in managedTags"
          :key="`${i}-${label}`"
          class="pill pill--managed"
          :class="`pill--${i % 6}`"
        >
          {{ label }}
          <button
            type="button"
            class="pill-remove"
            :aria-label="`移除标签 ${label}`"
            @click="removeTag(i)"
          >
            ×
          </button>
        </span>
      </div>
      <p v-else class="etm-empty">暂无标签，请从下方标签库添加或自定义录入。</p>
    </section>

    <section class="etm-section" aria-labelledby="etm-add-title">
      <h3 id="etm-add-title" class="etm-section-title">标签库</h3>
      <nav class="etm-cats" aria-label="标签分类">
        <button
          v-for="cat in TAG_CATEGORIES"
          :key="cat.id"
          type="button"
          class="etm-cat"
          :class="{ 'etm-cat--on': activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </nav>

      <div v-if="activeCategory !== 'custom'" class="etm-presets">
        <button
          v-for="preset in activePresets"
          :key="preset"
          type="button"
          class="etm-preset"
          :disabled="managedTags.includes(preset)"
          @click="addTag(preset)"
        >
          + {{ preset }}
        </button>
      </div>

      <div v-else class="etm-custom">
        <input
          v-model="newTagInput"
          type="text"
          class="etm-input"
          placeholder="输入自定义标签名称"
          aria-label="自定义标签名称"
          @keyup.enter="onAddCustom"
        />
        <button type="button" class="etm-btn etm-btn--primary" @click="onAddCustom">添加</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.etm-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.etm-lead {
  margin: 0;
  max-width: 520px;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.55;
}

.etm-actions {
  display: flex;
  gap: 8px;
}

.etm-btn {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.etm-btn--ghost {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #475569;
}

.etm-btn--primary {
  border: 1px solid #006c4d;
  background: #006c4d;
  color: #fff;
}

.etm-save-hint {
  margin: -8px 0 12px;
  font-size: 0.8125rem;
  color: #006c4d;
}

.etm-section {
  margin-bottom: 20px;
}

.etm-section-title {
  margin: 0 0 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.pill--managed {
  padding-right: 6px;
}

.pill--0 { background: #dbeafe; color: #1d4ed8; }
.pill--1 { background: #dcfce7; color: #15803d; }
.pill--2 { background: #fef3c7; color: #b45309; }
.pill--3 { background: #ede9fe; color: #6d28d9; }
.pill--4 { background: #fce7f3; color: #be185d; }
.pill--5 { background: #e0f2fe; color: #0369a1; }

.pill-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  font-size: 0.875rem;
  line-height: 1;
  color: inherit;
  cursor: pointer;
}

.etm-empty {
  margin: 0;
  font-size: 0.875rem;
  color: #94a3b8;
}

.etm-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.etm-cat {
  padding: 5px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  font-size: 0.8125rem;
  color: #475569;
  cursor: pointer;
}

.etm-cat--on {
  border-color: #006c4d;
  background: #006c4d;
  color: #fff;
}

.etm-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.etm-preset {
  padding: 6px 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 0.8125rem;
  color: #334155;
  cursor: pointer;
}

.etm-preset:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.etm-custom {
  display: flex;
  gap: 8px;
  max-width: 420px;
}

.etm-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}
</style>

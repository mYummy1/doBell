<script setup lang="ts">
import type { SentimentNewsRow } from '../data/companyDetail'

const DEFAULT_SOCIAL_SUMMARY = '近30天提及量上升32%，正面舆情占比87%'

const props = withDefaults(
  defineProps<{
    /** 保留与详情页联动签名，便于日后按需懒加载 */
    visible?: boolean
    newsRows?: SentimentNewsRow[]
    socialSummary?: string
  }>(),
  { visible: true }
)

const socialLine = () => props.socialSummary?.trim() || DEFAULT_SOCIAL_SUMMARY
</script>

<template>
  <div class="sentiment-three">
    <section class="sentiment-dim" aria-labelledby="sentiment-news-title">
      <div class="sentiment-dim__head">
        <span class="sentiment-dim__bar" aria-hidden="true" />
        <div class="sentiment-dim__titles">
          <h3 id="sentiment-news-title" class="sentiment-dim__title">新闻动态</h3>
        </div>
      </div>
      <div v-if="newsRows?.length" class="sentiment-dim__body">
        <div class="tbl-scroll sentiment-news-scroll">
          <table class="plain-table sentiment-news-table">
            <thead>
              <tr>
                <th class="sentiment-news-th-time">时间</th>
                <th class="sentiment-news-th-event">事件</th>
                <th>备注 / 进展</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in newsRows" :key="`${row.time}-${i}`">
                <td class="sentiment-news-td-time">{{ row.time }}</td>
                <td class="sentiment-news-td-event">{{ row.event }}</td>
                <td class="sentiment-news-td-remark">{{ row.remark }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p v-else class="sentiment-dim__empty">暂无新闻动态</p>
    </section>

    <section class="sentiment-dim" aria-labelledby="sentiment-social-title">
      <div class="sentiment-dim__head">
        <span class="sentiment-dim__bar" aria-hidden="true" />
        <div class="sentiment-dim__titles">
          <h3 id="sentiment-social-title" class="sentiment-dim__title">社交媒体声量</h3>
          <p class="sentiment-dim__sub">{{ socialLine() }}</p>
        </div>
      </div>
    </section>

    <section class="sentiment-dim" aria-labelledby="sentiment-reg-title">
      <div class="sentiment-dim__head">
        <span class="sentiment-dim__bar" aria-hidden="true" />
        <div class="sentiment-dim__titles">
          <h3 id="sentiment-reg-title" class="sentiment-dim__title">监管问询记录</h3>
          <p class="sentiment-dim__sub sentiment-dim__sub--muted">暂无相关记录</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sentiment-three {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 0;
}

.sentiment-dim__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.sentiment-dim__bar {
  width: 3px;
  min-height: 44px;
  margin-top: 2px;
  flex-shrink: 0;
  border-radius: 2px;
  background: #006c4d;
  box-shadow: 0 0 0 1px rgba(0, 108, 77, 0.12);
}

.sentiment-dim__titles {
  min-width: 0;
  flex: 1;
}

.sentiment-dim__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.sentiment-dim__sub {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

.sentiment-dim__sub--muted {
  color: #94a3b8;
}

.sentiment-dim__body {
  margin: 0;
}

.sentiment-dim__empty {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.sentiment-news-scroll {
  margin: 0 -4px;
}

.sentiment-news-table {
  min-width: 640px;
  font-size: 13px;
}

.sentiment-news-table thead th {
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 12px;
  text-align: left;
  white-space: nowrap;
}

.sentiment-news-table tbody td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
  line-height: 1.5;
  color: #334155;
}

.sentiment-news-table tbody tr:last-child td {
  border-bottom: none;
}

.sentiment-news-th-time,
.sentiment-news-td-time {
  width: 7.5rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: #475569;
}

.sentiment-news-th-event,
.sentiment-news-td-event {
  min-width: 12rem;
  font-weight: 600;
  color: #0f172a;
}

.sentiment-news-td-remark {
  white-space: pre-line;
  color: #475569;
}
</style>

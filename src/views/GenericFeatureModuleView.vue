<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'

const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`
const { isLoggedIn } = useAuth()
const route = useRoute()

type ModuleCopy = {
  kicker: string
  title: string
  lead: string
  points: readonly string[]
}

const MODULE_COPY: Record<string, ModuleCopy> = {
  'related-party-screening': {
    kicker: '关系网络',
    title: '关联方排查',
    lead:
      '围绕股权穿透、关键人员交叉任职与历史对外投资，梳理显性与隐性关联路径，为尽调与集中度复核提供结构化线索。',
    points: [
      '聚合多主体标识与曾用名，降低「同名不同主体」带来的误判。',
      '支持按层级与时间切片观察，便于对照重大交易或舆情节点。',
      '结论以公开可核验信息为边界，需与合同、资金流水等内控材料交叉确认。',
    ],
  },
  'business-anomaly-alert': {
    kicker: '风险监测',
    title: '经营异常预警',
    lead:
      '对经营异常名录、严重违法失信、行政处罚与司法公示等信号做归一与去重，按时间线与影响面呈现，便于优先处置高敏事项。',
    points: [
      '区分「程序性公示」与「实质性限制」，减少误报对业务节奏的干扰。',
      '可与供应链与客户集中度信息联动，评估风险是否向上下游传导。',
      '预警为概率性提示，最终以主管机关与司法机关的权威文书为准。',
    ],
  },
  'historical-change-trace': {
    kicker: '沿革还原',
    title: '历史变更追溯',
    lead:
      '按时间轴还原注册资本、股东结构、法定代表人、经营范围与注册地址等变更，辅助判断战略调整节奏与合规连续性。',
    points: [
      '对齐多数据源的时间戳与文号，减少重复记录对阅读的负担。',
      '支持导出关键节点摘要，便于投委会材料与内部复盘引用。',
      '早期纸质档案或未数字化信息可能缺失，结论需标注覆盖范围。',
    ],
  },
  'financing-event-track': {
    kicker: '资本脉络',
    title: '融资事件追踪',
    lead:
      '汇总股权融资、可转债、并购对价披露与债券发行等公开事件，刻画轮次、金额区间与主要投资方，用于资本结构对比与条款谈判参照。',
    points: [
      '对未披露金额采用区间或「未披露」标注，避免过度精确化。',
      '可与行业同赛道融资节奏对照，观察窗口期与估值环境变化。',
      '部分非上市主体披露颗粒度较粗，分析需结合研报与新闻交叉验证。',
    ],
  },
  'enterprise-graph': {
    kicker: '关系可视化',
    title: '企业图谱',
    lead:
      '以图谱方式呈现投资、任职、招投标与合同披露等多维关系边，支持按主体、时间窗与关系类型过滤，帮助快速定位关键节点与潜在路径。',
    points: [
      '节点合并与去重规则可配置，降低「壳主体」与历史注销主体对读图的干扰。',
      '支持从单点企业展开或从集团/园区视角收敛，适配投前与投后两种工作流。',
      '图谱为公开信息的结构化表达，不构成对实际控制或利益输送的法律结论。',
    ],
  },
  'park-map': {
    kicker: '空间布局',
    title: '园区地图',
    lead:
      '将园区边界、地块与入驻企业在地图上对齐展示，叠加产业标签与能耗、交通等公开图层，辅助招商匹配与空间承载力评估。',
    points: [
      '支持按主导产业、企业规模与资质类型做热力与聚类，便于对比相邻片区。',
      '可与供应链半径、物流时效等参数联动，粗估区位与配套匹配度。',
      '边界与规划信息以主管部门公示为准，地图底图存在更新滞后需标注时点。',
    ],
  },
}

const copy = computed((): ModuleCopy | null => {
  const name = typeof route.name === 'string' ? route.name : ''
  return MODULE_COPY[name] ?? null
})
</script>

<template>
  <div class="feature-page">
    <header class="feature-header">
      <RouterLink to="/" class="brand">
        <img class="brand-logo" :src="faviconUrl" alt="" width="40" height="40" />
        <span class="brand-title">灵枢数据一体化平台</span>
      </RouterLink>
      <AuthGuestBar v-if="!isLoggedIn" />
      <UserMenuDropdown v-else />
    </header>

    <main v-if="copy" class="feature-main">
      <p class="feature-kicker">{{ copy.kicker }}</p>
      <h1 class="feature-title">{{ copy.title }}</h1>
      <p class="feature-lead">{{ copy.lead }}</p>
      <ul class="feature-ul">
        <li v-for="(line, i) in copy.points" :key="i">{{ line }}</li>
      </ul>
      <RouterLink to="/" class="back-home">返回首页</RouterLink>
    </main>

    <main v-else class="feature-main">
      <h1 class="feature-title">页面未找到</h1>
      <RouterLink to="/" class="back-home">返回首页</RouterLink>
    </main>
  </div>
</template>

<style scoped>
.feature-page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  color: var(--db-text);
}

.feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  gap: 16px;
  background: #fff;
  border-bottom: 1px solid #e8eaed;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
  border-radius: 12px;
  padding: 4px 8px 4px 4px;
  margin: -4px -8px -4px -4px;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.brand:hover {
  background: rgba(0, 108, 77, 0.06);
  box-shadow: 0 0 0 1px rgba(0, 108, 77, 0.08);
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--db-brand);
}

.feature-main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 36px 24px 64px;
}

.feature-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--db-primary);
}

.feature-title {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 800;
  color: #1a3e4c;
}

.feature-lead {
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--db-muted);
}

.feature-ul {
  margin: 0 0 28px;
  padding-left: 1.2rem;
  font-size: 14px;
  line-height: 1.65;
  color: var(--db-text);
}

.feature-ul li + li {
  margin-top: 10px;
}

.back-home {
  display: inline-block;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--db-primary);
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.back-home:hover {
  background: rgba(0, 108, 77, 0.1);
  border-color: rgba(0, 108, 77, 0.2);
  color: var(--db-brand);
}
</style>

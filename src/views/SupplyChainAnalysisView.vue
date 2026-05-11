<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'

const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`
const { isLoggedIn } = useAuth()

/** 分析维度说明（方法论与能力边界，不含个案数值） */
const analysisDimensions = [
  {
    title: '上游结构与集中度',
    body:
      '围绕核心物料、关键零部件与外包环节，梳理供应商层级与采购份额结构。可结合 CRn、HHI 等集中度指标评估议价空间与单一来源风险，并标注关键节点的替代可行性。',
  },
  {
    title: '下游客户与行业分布',
    body:
      '从公开合同与客户披露中归纳主要交付对象、行业与项目类型，观察收入或订单的行业集中度与季节性，为回款节奏与需求波动提供参照。',
  },
  {
    title: '地理与区域布局',
    body:
      '映射产能、仓储、采购与交付的地理分布，评估区域政策、物流成本与突发事件对链路的影响，用于「区域韧性」与备份方案讨论。',
  },
  {
    title: '合同履约与里程碑',
    body:
      '抽取公告与年报中的工期、验收、延期与变更条款，形成履约时间线，便于与经营动态、司法与舆情信息交叉核对，识别异常波动。',
  },
  {
    title: '二供与替代池',
    body:
      '在同类物料与可替代技术路线维度，构建潜在供应商与合作伙伴池，用于采购策略、招投标与供应链安全预案，而非静态「黑名单/白名单」结论。',
  },
  {
    title: '合规与经营关联',
    body:
      '将环保处罚、质量抽检、海关与进出口信用等公开记录映射到相关主体与环节，辅助判断合规压力是否向上下游传导。',
  },
] as const

const indicatorNotes = [
  {
    term: 'CRn（前 n 家集中度）',
    desc: '前 n 家供应商（或客户）在同类口径下的合计占比，用于快速判断头部集中程度；n 常取 3、5、10，需与样本范围一并说明。',
  },
  {
    term: 'HHI（赫芬达尔指数）',
    desc: '基于各主体份额平方和构造的集中度指数，对头部垄断更敏感；适合与 CRn 对照阅读，避免单一指标误判。',
  },
  {
    term: '链路深度与跨层依赖',
    desc: '不仅看直接交易对手，也关注二级、三级物料与技术服务依赖，识别「隐形瓶颈」与跨行业传导路径。',
  },
] as const

const dataSources = [
  '依法公开的招投标与政府采购公告、上市公司年报与临时公告、海关与进出口信用公示、企业自主披露的新闻稿与社会责任报告等。',
  '不同来源的颗粒度与更新频率不一致，同一关系边需在多源之间做去重、对齐时间戳与主体标识后再入库。',
] as const

const useCases = [
  '投前尽调：在缺少内部采购台账时，用公开线索还原主要上下游与集中度轮廓。',
  '行业研究：对比同赛道企业的客户结构、区域布局与关键器件依赖差异。',
  '风险预警：当司法、舆情或处罚信息与特定供应商/客户节点重合时，提示复核履约与替代方案。',
] as const
</script>

<template>
  <div class="feature-page">
    <header class="feature-header">
      <RouterLink to="/" class="brand">
        <img class="brand-logo" :src="faviconUrl" alt="" width="40" height="40" />
        <span class="brand-title">企业 AI 智能体数据平台</span>
      </RouterLink>
      <AuthGuestBar v-if="!isLoggedIn" />
      <UserMenuDropdown v-else />
    </header>

    <main class="feature-main">
      <p class="feature-kicker">全链路视角</p>
      <h1 class="feature-title">供应链洞察</h1>

      <section class="feature-section" aria-labelledby="sc-dim-heading">
        <h2 id="sc-dim-heading" class="feature-section-title">分析维度</h2>
        <div class="feature-grid">
          <article v-for="dim in analysisDimensions" :key="dim.title" class="feature-card">
            <span class="feature-card-accent" aria-hidden="true" />
            <h3 class="feature-card-title">{{ dim.title }}</h3>
            <p class="feature-card-text">{{ dim.body }}</p>
          </article>
        </div>
      </section>

      <section class="feature-section feature-section--split" aria-labelledby="sc-ind-heading">
        <div class="feature-panel">
          <h2 id="sc-ind-heading" class="feature-section-title">常用指标怎么读</h2>
          <dl class="feature-dl">
            <div v-for="row in indicatorNotes" :key="row.term" class="feature-dl-group">
              <dt>{{ row.term }}</dt>
              <dd>{{ row.desc }}</dd>
            </div>
          </dl>
        </div>
        <div class="feature-panel">
          <h2 class="feature-section-title">数据来源与处理</h2>
          <ul class="feature-ul feature-ul--rows">
            <li v-for="(line, i) in dataSources" :key="i" class="feature-list-row">{{ line }}</li>
          </ul>
          <p class="feature-note">
            公开数据无法覆盖未披露的商业秘密；分析结论均为概率性提示，需结合企业内控与一线业务确认。
          </p>
        </div>
      </section>

      <section class="feature-section" aria-labelledby="sc-use-heading">
        <h2 id="sc-use-heading" class="feature-section-title">适用场景</h2>
        <ul class="feature-ul feature-ul--tight feature-ul--rows">
          <li v-for="(uc, i) in useCases" :key="i" class="feature-list-row">{{ uc }}</li>
        </ul>
      </section>

      <RouterLink to="/" class="back-home">返回首页检索企业</RouterLink>
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
  transition: transform 0.22s ease;
}

.brand:hover .brand-logo {
  transform: scale(1.04);
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--db-brand);
  transition: color 0.2s ease;
}

.brand:hover .brand-title {
  color: var(--db-primary);
}

.feature-main {
  flex: 1;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 36px 24px 64px;
}

.feature-kicker {
  margin: 0 0 8px;
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--db-primary);
  transition: letter-spacing 0.22s ease, color 0.2s ease;
}

.feature-kicker:hover {
  letter-spacing: 0.11em;
  color: var(--db-brand);
}

.feature-title {
  margin: 0 0 28px;
  font-size: 28px;
  font-weight: 800;
  color: #1a3e4c;
}

.feature-section {
  margin-bottom: 28px;
}

.feature-section-title {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  color: #1a3e4c;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
}

.feature-section:hover .feature-section-title {
  color: var(--db-brand);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.feature-card {
  position: relative;
  overflow: hidden;
  padding: 18px 18px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 10px rgba(15, 45, 56, 0.05);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.feature-card-accent {
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--db-primary) 0%, var(--db-brand) 100%);
  opacity: 0;
  transform: scaleY(0.65);
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 108, 77, 0.2);
  box-shadow:
    0 12px 32px rgba(0, 82, 57, 0.1),
    0 2px 8px rgba(15, 45, 56, 0.06);
  background: linear-gradient(165deg, #fff 0%, #fafdfb 100%);
}

.feature-card:hover .feature-card-accent {
  opacity: 1;
  transform: scaleY(1);
}

.feature-card-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--db-text);
  transition: color 0.2s ease;
}

.feature-card:hover .feature-card-title {
  color: var(--db-brand);
}

.feature-card-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--db-muted);
  transition: color 0.2s ease;
}

.feature-card:hover .feature-card-text {
  color: rgba(26, 62, 76, 0.78);
}

.feature-section--split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
}

.feature-panel {
  padding: 18px 18px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 10px rgba(15, 45, 56, 0.05);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.feature-panel:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 108, 77, 0.16);
  box-shadow: 0 10px 28px rgba(15, 45, 56, 0.08);
}

.feature-dl {
  margin: 0;
  display: grid;
  gap: 6px 0;
}

.feature-dl-group {
  padding: 10px 12px;
  margin: 0 -6px;
  border-radius: 10px;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-dl-group:hover {
  background: rgba(0, 108, 77, 0.06);
  box-shadow: 0 0 0 1px rgba(0, 108, 77, 0.07);
}

.feature-dl dt {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--db-brand);
  transition: color 0.2s ease;
}

.feature-dl-group:hover dt {
  color: var(--db-primary);
}

.feature-dl dd {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--db-muted);
}

.feature-ul {
  margin: 0 0 12px;
  padding-left: 1.15rem;
  font-size: 13px;
  line-height: 1.65;
  color: var(--db-muted);
}

.feature-ul li + li {
  margin-top: 6px;
}

.feature-ul--tight {
  margin-bottom: 0;
}

.feature-ul--rows {
  padding-left: 0;
}

.feature-list-row {
  position: relative;
  list-style: none;
  margin-left: -0.35rem;
  padding: 10px 12px 10px 1.35rem;
  border-radius: 10px;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-list-row::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  width: 5px;
  height: 5px;
  margin-top: -2.5px;
  border-radius: 50%;
  background: rgba(0, 108, 77, 0.35);
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.feature-list-row:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 1px rgba(0, 108, 77, 0.1);
  transform: translateX(4px);
}

.feature-list-row:hover::before {
  background: var(--db-primary);
  transform: scale(1.25);
}

.feature-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(26, 62, 76, 0.55);
  padding: 10px 12px;
  border-radius: 8px;
  background: #f0f4f5;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-panel:hover .feature-note {
  background: #e8f2ee;
  border-color: rgba(0, 108, 77, 0.12);
  box-shadow: 0 2px 8px rgba(0, 82, 57, 0.06);
}

.back-home {
  display: inline-block;
  margin-top: 28px;
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
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.back-home:hover {
  background: rgba(0, 108, 77, 0.1);
  border-color: rgba(0, 108, 77, 0.2);
  color: var(--db-brand);
  box-shadow: 0 4px 14px rgba(0, 82, 57, 0.12);
  transform: translateY(-1px);
  text-decoration: none;
}

.back-home:active {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .brand-logo,
  .brand-title,
  .feature-kicker,
  .feature-section-title,
  .feature-card,
  .feature-card-accent,
  .feature-card-title,
  .feature-card-text,
  .feature-panel,
  .feature-dl-group,
  .feature-dl dt,
  .feature-list-row,
  .feature-list-row::before,
  .feature-note,
  .back-home {
    transition: none;
  }

  .feature-card:hover,
  .feature-panel:hover,
  .feature-list-row:hover,
  .back-home:hover {
    transform: none;
  }

  .brand:hover .brand-logo {
    transform: none;
  }

  .feature-list-row:hover::before {
    transform: none;
  }
}
</style>

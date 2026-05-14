import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompanyDetailView from '../views/CompanyDetailView.vue'
import ProfileView from '../views/ProfileView.vue'
import GenericFeatureModuleView from '../views/GenericFeatureModuleView.vue'
import IndustryAnalysisView from '../views/IndustryAnalysisView.vue'
import SupplyChainAnalysisView from '../views/SupplyChainAnalysisView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/company', name: 'company-detail', component: CompanyDetailView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/industry-analysis', name: 'industry-analysis', component: IndustryAnalysisView },
    { path: '/supply-chain-analysis', name: 'supply-chain-analysis', component: SupplyChainAnalysisView },
    {
      path: '/related-party-screening',
      name: 'related-party-screening',
      component: GenericFeatureModuleView,
    },
    {
      path: '/business-anomaly-alert',
      name: 'business-anomaly-alert',
      component: GenericFeatureModuleView,
    },
    {
      path: '/historical-change-trace',
      name: 'historical-change-trace',
      component: GenericFeatureModuleView,
    },
    {
      path: '/financing-event-track',
      name: 'financing-event-track',
      component: GenericFeatureModuleView,
    },
    {
      path: '/enterprise-graph',
      name: 'enterprise-graph',
      component: GenericFeatureModuleView,
    },
    {
      path: '/park-map',
      name: 'park-map',
      component: GenericFeatureModuleView,
    },
  ],
  scrollBehavior(_to, _from, saved) {
    if (saved) return saved
    return { top: 0 }
  },
})

<template>
  <div class="dashboard-page">
    <section class="dashboard-hero">
      <article class="hero-surface dashboard-hero-main">
        <div class="hero-kicker-pill">运营总览</div>
        <h1 class="hero-main-title">把内容审核、活动位和创作者激励放进同一块编辑式看板里。</h1>
        <p class="hero-copy">
          管理端已经按你 app 当前的 editorial 视觉重新收拢了内容、公告、活动和结算链路，方便运营与财务在同一个入口里快速定位当天重点。
        </p>
        <div class="hero-badge-list">
          <span>待审核 {{ summary.pendingAudits }}</span>
          <span>活动位 {{ summary.activeCampaigns }}</span>
          <span>点击 {{ formatCompactNumber(summary.productClicks) }}</span>
          <span>激励 {{ formatCurrency(summary.estimatedCommission) }}</span>
        </div>
      </article>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card sky">
        <div class="kpi-label">今日新增用户</div>
        <div class="kpi-value">{{ summary.todayUsers }}</div>
        <div class="kpi-copy">新的校园用户仍在持续进入内容流与互动链路。</div>
      </article>
      <article class="kpi-card mint">
        <div class="kpi-label">待审核内容</div>
        <div class="kpi-value">{{ summary.pendingAudits }}</div>
        <div class="kpi-copy">需要优先处理的内容积压，会直接影响前台 feed 质量。</div>
      </article>
      <article class="kpi-card warm">
        <div class="kpi-label">导购点击量</div>
        <div class="kpi-value">{{ formatCompactNumber(summary.productClicks) }}</div>
        <div class="kpi-copy">内容导购带来的当前点击热度，和 app 的商品跳转链路一致。</div>
      </article>
      <article class="kpi-card ice">
        <div class="kpi-label">待结算激励</div>
        <div class="kpi-value">{{ formatCurrency(summary.estimatedCommission) }}</div>
        <div class="kpi-copy">待财务确认的推广激励金额，会继续流向创作者激励中心。</div>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="table-shell section-card">
        <div class="table-toolbar">
          <div>
            <div class="table-title">内容审核概览</div>
            <div class="table-subtitle">直接查看当前待处理内容、商品链路状态和审核结果，减少无效内容进入前台。</div>
          </div>
        </div>

        <el-card shadow="never" v-loading="loading" class="manage-card">
          <el-table :data="audits" stripe>
            <el-table-column prop="title" label="内容标题" min-width="220" />
            <el-table-column prop="author" label="发布者" width="120" />
            <el-table-column prop="scene" label="场景" width="120" />
            <el-table-column prop="productStatus" label="商品链路" width="130">
              <template #default="{ row }">
                <el-tag :type="resolveProductStatusType(row.productStatus)">{{ row.productStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="审核状态" width="120">
              <template #default="{ row }">
                <el-tag :type="auditTagType(row.auditStatusCode)">{{ row.auditStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="170" />
          </el-table>
        </el-card>
      </article>

      <article class="timeline-shell section-card">
        <div class="table-toolbar">
          <div>
            <div class="table-title">近期结算记录</div>
            <div class="table-subtitle">快速确认最新一批推广激励与结算状态，保证激励链路回写到 app 端时是干净的。</div>
          </div>
        </div>
        <el-card shadow="never" v-loading="loading" class="manage-card">
          <el-timeline>
            <el-timeline-item v-for="item in settlements" :key="item.recordId" :timestamp="item.createdAt">
              <div class="timeline-title">{{ item.creator }} / {{ item.type }}</div>
              <div class="timeline-copy">{{ formatCurrency(item.amount) }} / {{ item.status }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </article>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAdminContentAudit, getDashboardSummary, getAdminSettlements } from "../api/admin";
import { formatCompactNumber, formatCurrency, resolveProductStatusType } from "../utils/adminUi";

const loading = ref(false);
const summary = ref({
  todayUsers: 0,
  pendingAudits: 0,
  productClicks: 0,
  estimatedCommission: 0,
  activeCampaigns: 0
});
const audits = ref([]);
const settlements = ref([]);

function auditTagType(statusCode) {
  if (statusCode === 1) return "success";
  if (statusCode === 2) return "danger";
  return "warning";
}

async function loadData() {
  loading.value = true;
  try {
    const [summaryData, auditData, settlementData] = await Promise.all([
      getDashboardSummary(),
      getAdminContentAudit(),
      getAdminSettlements()
    ]);
    summary.value = summaryData || summary.value;
    audits.value = (auditData || []).slice(0, 4);
    settlements.value = (settlementData || []).slice(0, 4);
  } catch (error) {
    ElMessage.error(error.message || "加载数据看板失败");
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
  gap: 18px;
}

@media (max-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>

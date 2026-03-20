<template>
  <div class="dashboard-page">
    <section class="dashboard-hero">
      <article class="hero-surface dashboard-hero-main">
        <div class="hero-kicker-pill">运营总览</div>
        <h1 class="hero-main-title">校园穿搭平台的审核、导购与收益脉搏</h1>
        <p class="hero-copy">
          把内容审核节奏、导购互动强度和结算状态集中放在一个轻盈的运营面板里，方便演示时快速串起整条业务闭环。
        </p>
        <div class="hero-badge-list">
          <span>内容审核</span>
          <span>导购转化</span>
          <span>收益结算</span>
          <span>活动运营</span>
        </div>
      </article>

      <aside class="hero-side-stack">
        <article class="info-card">
          <div class="info-card-title">后端同步状态</div>
          <p class="muted-copy">{{ statusText }}</p>
        </article>
        <article class="info-card">
          <div class="info-card-title">看板解读</div>
          <ul class="bullet-list">
            <li>待审核内容适合在答辩中展示社区治理能力</li>
            <li>导购互动量能直观体现电商导流价值</li>
            <li>待结算佣金能支撑盈利模式与创作者激励逻辑</li>
          </ul>
        </article>
      </aside>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card sky">
        <div class="kpi-label">今日新增用户</div>
        <div class="kpi-value">{{ summary.todayUsers }}</div>
        <div class="kpi-copy">校园内容社区仍在持续扩张</div>
      </article>
      <article class="kpi-card mint">
        <div class="kpi-label">待审核内容</div>
        <div class="kpi-value">{{ summary.pendingAudits }}</div>
        <div class="kpi-copy">需要运营优先处理的内容积压</div>
      </article>
      <article class="kpi-card warm">
        <div class="kpi-label">导购互动量</div>
        <div class="kpi-value">{{ summary.productClicks }}</div>
        <div class="kpi-copy">穿搭内容带来的商品点击热度</div>
      </article>
      <article class="kpi-card ice">
        <div class="kpi-label">待结算佣金</div>
        <div class="kpi-value">￥{{ summary.estimatedCommission }}</div>
        <div class="kpi-copy">平台侧仍待财务确认的收益</div>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="table-shell section-card">
        <div class="table-toolbar">
          <div>
            <div class="table-title">内容审核概览</div>
            <div class="table-subtitle">挑出待审核内容、检查商品链接状态，并快速预判处理优先级。</div>
          </div>
          <el-tag type="warning">优先关注未校验链接</el-tag>
        </div>

        <el-card shadow="never" v-loading="loading" class="manage-card">
          <el-table :data="audits" stripe>
            <el-table-column prop="title" label="内容标题" min-width="220" />
            <el-table-column prop="author" label="发布者" width="100" />
            <el-table-column prop="scene" label="场景" width="110" />
            <el-table-column prop="productStatus" label="商品链接" width="120">
              <template #default="{ row }">
                <el-tag :type="row.productStatus === '已校验' ? 'success' : 'warning'">{{ row.productStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="审核状态" width="120">
              <template #default="{ row }">
                <el-tag :type="auditTagType(row.auditStatusCode)">{{ row.auditStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="160" />
          </el-table>
        </el-card>
      </article>

      <div class="dashboard-side-column">
        <article class="timeline-shell section-card">
          <div class="table-toolbar">
            <div>
              <div class="table-title">近期结算动态</div>
              <div class="table-subtitle">快速查看最近的收益类型与结算状态。</div>
            </div>
            <el-tag type="success">财务视角</el-tag>
          </div>
          <el-card shadow="never" v-loading="loading" class="manage-card">
            <el-timeline>
              <el-timeline-item v-for="item in settlements" :key="item.recordId" :timestamp="item.createdAt">
                <div class="timeline-title">{{ item.creator }} / {{ item.type }}</div>
                <div class="timeline-copy">￥{{ item.amount }} / {{ item.status }}</div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </article>

        <article class="insight-card section-card">
          <div class="insight-title">演示提示</div>
          <ul class="bullet-list">
            <li>先讲看板数字，再进入审核与结算页面，逻辑最顺</li>
            <li>活动管理页可作为前端运营能力补充模块展示</li>
            <li>移动端的消息、活动、发布链路可以与这里形成呼应</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAdminContentAudit, getDashboardSummary, getAdminSettlements } from "../api/admin";
import { API_BASE_URL } from "../api/http";

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
const statusText = ref("正在同步看板数据...");

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
    summary.value = summaryData;
    audits.value = (auditData || []).slice(0, 4);
    settlements.value = (settlementData || []).slice(0, 4);
    statusText.value = `已连接后端：${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `数据看板请求失败：${error.message}`;
    ElMessage.error(error.message || "加载数据看板失败");
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.9fr);
  gap: 18px;
}

.dashboard-hero-main,
.section-card,
.kpi-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(109, 160, 196, 0.14);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  box-shadow: 0 22px 48px rgba(73, 122, 156, 0.1);
}

.dashboard-hero-main::after,
.section-card::after,
.kpi-card::after {
  content: "";
  position: absolute;
  inset: auto -34px -40px auto;
  width: 140px;
  height: 140px;
  border-radius: 34px;
  background: linear-gradient(135deg, rgba(86, 194, 241, 0.12), rgba(90, 220, 178, 0.12));
  transform: rotate(18deg);
}

.dashboard-hero-main,
.section-card {
  padding: 24px 26px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  min-height: 176px;
  padding: 20px 22px;
}

.kpi-label {
  position: relative;
  z-index: 1;
  color: #6d8496;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.kpi-value {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #1b3143;
}

.kpi-copy {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  color: #607789;
  line-height: 1.7;
}

.sky { background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(233,246,255,0.95)); }
.mint { background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(233,252,245,0.95)); }
.warm { background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,246,233,0.95)); }
.ice { background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(242,248,255,0.95)); }

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
  gap: 18px;
}

.dashboard-side-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.timeline-title {
  color: #203244;
  font-weight: 700;
}

.timeline-copy {
  margin-top: 4px;
  color: #6d8191;
}

.insight-title {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 700;
  color: #203244;
}

@media (max-width: 1280px) {
  .dashboard-hero,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-hero-main,
  .section-card {
    padding: 20px;
  }
}
</style>

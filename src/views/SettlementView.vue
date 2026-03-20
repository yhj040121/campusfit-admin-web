<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">佣金结算</div>
        <h1 class="hero-main-title">导购收益、合作收入与待结算记录跟踪</h1>
        <p class="hero-copy">把创作者导购收益、合作分成和结算状态集中展示，方便财务与运营在一个面板里确认待结算金额与历史记录。</p>
        <div class="hero-badge-list">
          <span>待结算</span>
          <span>收益类型</span>
          <span>财务确认</span>
        </div>
      </article>

      <div class="hero-side-stack">
        <article class="info-card">
          <div class="info-card-title">当前同步状态</div>
          <p class="muted-copy">{{ statusText }}</p>
        </article>
        <article class="info-card">
          <div class="info-card-title">财务提示</div>
          <ul class="bullet-list">
            <li>优先处理待结算金额高的创作者记录</li>
            <li>确认结算后应同步回传状态给运营侧</li>
            <li>收益类型可继续细分导购与品牌合作</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">结算记录</div>
        <div class="overview-value">{{ settlements.length }}</div>
        <div class="overview-copy">当前可查看的结算记录总量</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">待结算</div>
        <div class="overview-value">{{ settlements.filter((item) => item.statusCode === 0).length }}</div>
        <div class="overview-copy">还需财务确认的创作者记录</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">待结算金额</div>
        <div class="overview-value">￥{{ settlements.filter((item) => item.statusCode === 0).reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2) }}</div>
        <div class="overview-copy">当前尚未完成打款的累计金额</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">结算列表</div>
          <div class="table-subtitle">确认结算后会立即刷新记录状态。</div>
        </div>
        <el-tag type="warning">财务角色可执行确认结算</el-tag>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="settlements" stripe>
          <el-table-column prop="recordId" label="记录 ID" width="100" />
          <el-table-column prop="creator" label="创作者" width="120" />
          <el-table-column prop="type" label="收益类型" min-width="160" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">￥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="status" label="结算状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.statusCode)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.statusCode === 0"
                size="small"
                type="primary"
                :loading="actionKey === `settle-${row.recordId}`"
                @click="handleSettle(row)"
              >
                确认结算
              </el-button>
              <el-tag v-else type="success">已完成</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { confirmAdminSettlement, getAdminSettlements } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const settlements = ref([]);
const statusText = ref("正在同步结算记录...");
const actionKey = ref("");

async function loadSettlements() {
  loading.value = true;
  try {
    settlements.value = await getAdminSettlements();
    statusText.value = `已连接后端：${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `结算记录请求失败：${error.message}`;
    ElMessage.error(error.message || "加载结算记录失败");
  } finally {
    loading.value = false;
  }
}

function statusType(statusCode) {
  return statusCode === 1 ? "success" : "warning";
}

async function handleSettle(row) {
  try {
    await ElMessageBox.confirm(`确认结算创作者“${row.creator}”的这笔佣金吗？`, "结算确认", {
      type: "warning",
      confirmButtonText: "确认结算",
      cancelButtonText: "取消"
    });
    actionKey.value = `settle-${row.recordId}`;
    await confirmAdminSettlement(row.recordId);
    ElMessage.success(`已完成“${row.creator}”的佣金结算`);
    await loadSettlements();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "结算操作失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadSettlements);
</script>

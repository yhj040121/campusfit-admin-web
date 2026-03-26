<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">提现申请</div>
        <h1 class="hero-main-title">让创作者提现审核、打款确认和消息回写保持在同一条线上。</h1>
        <p class="hero-copy">提现通过或驳回后会继续影响 app 里的激励中心和消息通知，所以这里的状态展示和金额累计都按当前后端字段做了更稳的适配。</p>
        <div class="hero-badge-list">
          <span>审核中 {{ pendingCount }}</span>
          <span>待处理金额 {{ pendingAmount }}</span>
          <span>总申请 {{ requests.length }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">申请总数</div>
        <div class="overview-value">{{ requests.length }}</div>
        <div class="overview-copy">当前进入后台的提现申请总量。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">审核中</div>
        <div class="overview-value">{{ pendingCount }}</div>
        <div class="overview-copy">仍待财务确认与打款的申请。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">待处理金额</div>
        <div class="overview-value">{{ pendingAmount }}</div>
        <div class="overview-copy">当前待处理提现申请的累计金额。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">已处理</div>
        <div class="overview-value">{{ processedCount }}</div>
        <div class="overview-copy">已完成打款或驳回的申请数量。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">提现申请列表</div>
          <div class="table-subtitle">审核通过后会更新为已打款，驳回后也会同步给创作者消息入口。</div>
        </div>
        <div class="toolbar-actions">
          <el-button plain @click="goSettlements">查看结算记录</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="requests" stripe>
          <el-table-column prop="requestId" label="申请 ID" width="100" />
          <el-table-column prop="creator" label="创作者" width="120" />
          <el-table-column prop="amount" label="提现金额" width="120">
            <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="审核状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.statusCode)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="申请时间" width="170" />
          <el-table-column prop="processedAt" label="处理时间" width="170" />
          <el-table-column prop="remark" label="处理备注" min-width="220" show-overflow-tooltip />
          <el-table-column label="操作" width="210" fixed="right">
            <template #default="{ row }">
              <div v-if="row.statusCode === 0" class="action-group">
                <el-button
                  size="small"
                  type="primary"
                  :loading="actionKey === `approve-${row.requestId}`"
                  @click="handleApprove(row)"
                >
                  通过打款
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  :loading="actionKey === `reject-${row.requestId}`"
                  @click="handleReject(row)"
                >
                  驳回
                </el-button>
              </div>
              <el-tag v-else-if="row.statusCode === 1" type="success">已打款</el-tag>
              <el-tag v-else type="danger">已驳回</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {
  approveAdminWithdrawRequest,
  getAdminWithdrawRequests,
  rejectAdminWithdrawRequest
} from "../api/admin";
import { formatCurrency, toNumber } from "../utils/adminUi";

const router = useRouter();
const loading = ref(false);
const requests = ref([]);
const actionKey = ref("");

const pendingCount = computed(() => requests.value.filter((item) => item.statusCode === 0).length);
const processedCount = computed(() => requests.value.filter((item) => item.statusCode !== 0).length);
const pendingAmount = computed(() => formatCurrency(requests.value
  .filter((item) => item.statusCode === 0)
  .reduce((sum, item) => sum + toNumber(item.amount), 0)));

async function loadRequests() {
  loading.value = true;
  try {
    requests.value = await getAdminWithdrawRequests();
  } catch (error) {
    ElMessage.error(error.message || "加载提现申请失败");
  } finally {
    loading.value = false;
  }
}

function statusType(statusCode) {
  if (statusCode === 1) return "success";
  if (statusCode === 2) return "danger";
  return "warning";
}

function goSettlements() {
  router.push("/settlements");
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(`确认将“${row.creator}”的提现申请标记为已打款吗？`, "打款确认", {
      type: "warning",
      confirmButtonText: "确认打款",
      cancelButtonText: "取消"
    });
    actionKey.value = `approve-${row.requestId}`;
    await approveAdminWithdrawRequest(row.requestId);
    ElMessage.success(`已将“${row.creator}”的提现申请更新为已打款`);
    await loadRequests();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "打款操作失败");
    }
  } finally {
    actionKey.value = "";
  }
}

async function handleReject(row) {
  try {
    await ElMessageBox.confirm(`确认驳回“${row.creator}”的提现申请吗？`, "驳回确认", {
      type: "warning",
      confirmButtonText: "确认驳回",
      cancelButtonText: "取消"
    });
    actionKey.value = `reject-${row.requestId}`;
    await rejectAdminWithdrawRequest(row.requestId);
    ElMessage.success(`已驳回“${row.creator}”的提现申请`);
    await loadRequests();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "驳回操作失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadRequests);
</script>

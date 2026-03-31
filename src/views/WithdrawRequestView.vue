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
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索创作者 / 备注 / 申请 ID"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="审核中" value="pending" />
            <el-option label="已打款" value="paid" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
          <el-button plain @click="goSettlements">查看结算记录</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card ops-list-panel">
        <div v-if="filteredRequests.length" class="ops-card-list">
          <article
            v-for="row in filteredRequests"
            :key="row.requestId"
            class="ops-card ops-card--split withdraw-card"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("WDR", row.requestId) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.creator || "未知创作者" }}</div>
                <span class="ops-pill" :class="`ops-pill--${statusTone(row.statusCode)}`">
                  {{ row.status || "审核中" }}
                </span>
              </div>
              <div class="ops-card-summary">{{ row.remark || "等待财务确认并回写创作者消息通知。" }}</div>
              <div class="ops-meta-row">
                <span class="ops-meta-block">
                  <span class="ops-meta-label">申请时间</span>
                  <span class="ops-meta-value">{{ row.createdAt || "-" }}</span>
                </span>
                <span class="ops-meta-sep" />
                <span class="ops-meta-block">
                  <span class="ops-meta-label">处理时间</span>
                  <span class="ops-meta-value">{{ row.processedAt || "-" }}</span>
                </span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">提现金额</div>
              <div class="ops-amount">{{ formatCurrency(row.amount) }}</div>
              <div class="ops-note">
                {{ row.statusCode === 0 ? "待财务确认打款" : (row.statusCode === 1 ? "已完成打款回写" : "已驳回并同步通知创作者") }}
              </div>
            </div>

            <div class="ops-card-side">
              <div v-if="row.statusCode === 0" class="ops-card-actions">
                <el-button
                  type="primary"
                  :loading="actionKey === `approve-${row.requestId}`"
                  @click="handleApprove(row)"
                >
                  通过打款
                </el-button>
                <el-button
                  type="danger"
                  plain
                  :loading="actionKey === `reject-${row.requestId}`"
                  @click="handleReject(row)"
                >
                  驳回
                </el-button>
              </div>
              <div v-else class="ops-card-actions">
                <span
                  class="ops-pill"
                  :class="row.statusCode === 1 ? 'ops-pill--success' : 'ops-pill--danger'"
                >
                  {{ row.statusCode === 1 ? "已打款" : "已驳回" }}
                </span>
              </div>
              <div class="ops-card-caption">
                {{ row.statusCode === 0 ? "确认后会同步更新提现入口状态。" : "处理结果已经回写到创作者端。" }}
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有符合筛选条件的提现申请" />
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
import { formatAdminCode, formatCurrency, matchesKeyword, toNumber } from "../utils/adminUi";

const router = useRouter();
const loading = ref(false);
const requests = ref([]);
const actionKey = ref("");
const keyword = ref("");
const statusFilter = ref("all");

const pendingCount = computed(() => requests.value.filter((item) => item.statusCode === 0).length);
const processedCount = computed(() => requests.value.filter((item) => item.statusCode !== 0).length);
const pendingAmount = computed(() => formatCurrency(requests.value
  .filter((item) => item.statusCode === 0)
  .reduce((sum, item) => sum + toNumber(item.amount), 0)));
const filteredRequests = computed(() => requests.value.filter((item) => {
  const matchesText = matchesKeyword(keyword.value, [
    item.requestId,
    item.creator,
    item.status,
    item.remark,
    item.createdAt,
    item.processedAt
  ]);
  const matchesStatus = statusFilter.value === "all"
    || (statusFilter.value === "pending" && item.statusCode === 0)
    || (statusFilter.value === "paid" && item.statusCode === 1)
    || (statusFilter.value === "rejected" && item.statusCode === 2);
  return matchesText && matchesStatus;
}));

function statusTone(statusCode) {
  if (statusCode === 1) return "success";
  if (statusCode === 2) return "danger";
  return "warning";
}

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

<style scoped>
.withdraw-card {
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr) auto;
}

@media (max-width: 1180px) {
  .withdraw-card {
    grid-template-columns: 1fr;
  }
}
</style>

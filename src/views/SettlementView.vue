<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">结算记录</div>
        <h1 class="hero-main-title">把推广激励和结算回写放到同一条创作者激励链路里。</h1>
        <p class="hero-copy">这里确认的每一笔结算都会继续影响 app 里的激励中心和提现入口，所以金额展示和状态判断都改成了更稳妥的格式化逻辑。</p>
        <div class="hero-badge-list">
          <span>待结算 {{ pendingCount }}</span>
          <span>已完成 {{ completedCount }}</span>
          <span>待结算金额 {{ pendingAmount }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">结算记录</div>
        <div class="overview-value">{{ settlements.length }}</div>
        <div class="overview-copy">当前可在后台追踪的结算总量。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">已完成</div>
        <div class="overview-value">{{ completedCount }}</div>
        <div class="overview-copy">已经确认过的推广激励记录。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">待结算</div>
        <div class="overview-value">{{ pendingCount }}</div>
        <div class="overview-copy">仍需财务确认并回写的记录。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">待结算金额</div>
        <div class="overview-value">{{ pendingAmount }}</div>
        <div class="overview-copy">当前尚未完成打款确认的累计金额。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">结算记录列表</div>
          <div class="table-subtitle">确认结算后会直接影响创作者激励中心的可提现余额与后续提现申请。</div>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索创作者 / 类型 / 记录 ID"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="待结算" value="pending" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-button plain @click="goWithdrawPage">查看提现申请</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card ops-list-panel">
        <div v-if="filteredSettlements.length" class="ops-card-list">
          <article
            v-for="row in filteredSettlements"
            :key="row.recordId"
            class="ops-card ops-card--split settlement-card"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("SET", row.recordId) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.creator || "未知创作者" }}</div>
                <span class="ops-pill" :class="`ops-pill--${statusTone(row.statusCode)}`">
                  {{ row.status || "待结算" }}
                </span>
              </div>
              <div class="ops-card-summary">{{ row.type || "推广激励" }}</div>
              <div class="ops-meta-row">
                <span class="ops-meta-block">
                  <span class="ops-meta-label">创建时间</span>
                  <span class="ops-meta-value">{{ row.createdAt || "-" }}</span>
                </span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">结算金额</div>
              <div class="ops-amount">{{ formatCurrency(row.amount) }}</div>
              <div class="ops-note">激励类型：{{ row.type || "推广激励" }}</div>
              <div class="ops-note">当前状态：{{ row.status || "待结算" }}</div>
            </div>

            <div class="ops-card-side">
              <div class="ops-card-actions">
                <el-button
                  v-if="row.statusCode === 0"
                  type="primary"
                  :loading="actionKey === `settle-${row.recordId}`"
                  @click="handleSettle(row)"
                >
                  确认结算
                </el-button>
                <span v-else class="ops-pill ops-pill--success">已完成</span>
              </div>
              <div class="ops-card-caption">
                {{ row.statusCode === 0 ? "确认后会回写创作者可提现余额。" : "这笔结算已经完成回写，可继续处理提现。" }}
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有符合筛选条件的结算记录" />
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { confirmAdminSettlement, getAdminSettlements } from "../api/admin";
import { formatAdminCode, formatCurrency, matchesKeyword, toNumber } from "../utils/adminUi";

const router = useRouter();
const loading = ref(false);
const settlements = ref([]);
const actionKey = ref("");
const keyword = ref("");
const statusFilter = ref("all");

const pendingCount = computed(() => settlements.value.filter((item) => item.statusCode === 0).length);
const completedCount = computed(() => settlements.value.filter((item) => item.statusCode === 1).length);
const pendingAmount = computed(() => formatCurrency(settlements.value
  .filter((item) => item.statusCode === 0)
  .reduce((sum, item) => sum + toNumber(item.amount), 0)));
const filteredSettlements = computed(() => settlements.value.filter((item) => {
  const matchesText = matchesKeyword(keyword.value, [
    item.recordId,
    item.creator,
    item.type,
    item.status,
    item.createdAt
  ]);
  const matchesStatus = statusFilter.value === "all"
    || (statusFilter.value === "pending" && item.statusCode === 0)
    || (statusFilter.value === "completed" && item.statusCode === 1);
  return matchesText && matchesStatus;
}));

function statusTone(statusCode) {
  return statusCode === 1 ? "success" : "warning";
}

async function loadSettlements() {
  loading.value = true;
  try {
    settlements.value = await getAdminSettlements();
  } catch (error) {
    ElMessage.error(error.message || "加载结算记录失败");
  } finally {
    loading.value = false;
  }
}

function goWithdrawPage() {
  router.push("/withdraw-requests");
}

async function handleSettle(row) {
  try {
    await ElMessageBox.confirm(`确认将创作者“${row.creator}”的推广激励更新为已结算吗？`, "结算确认", {
      type: "warning",
      confirmButtonText: "确认结算",
      cancelButtonText: "取消"
    });
    actionKey.value = `settle-${row.recordId}`;
    await confirmAdminSettlement(row.recordId);
    ElMessage.success(`已将“${row.creator}”的结算记录更新为已结算`);
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

<style scoped>
.settlement-card {
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.95fr) auto;
}

@media (max-width: 1180px) {
  .settlement-card {
    grid-template-columns: 1fr;
  }
}
</style>

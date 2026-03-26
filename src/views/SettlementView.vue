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
          <el-button plain @click="goWithdrawPage">查看提现申请</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="settlements" stripe>
          <el-table-column prop="recordId" label="记录 ID" width="100" />
          <el-table-column prop="creator" label="创作者" width="120" />
          <el-table-column prop="type" label="激励类型" min-width="160" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="结算状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.statusCode)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170" />
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
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { confirmAdminSettlement, getAdminSettlements } from "../api/admin";
import { formatCurrency, toNumber } from "../utils/adminUi";

const router = useRouter();
const loading = ref(false);
const settlements = ref([]);
const actionKey = ref("");

const pendingCount = computed(() => settlements.value.filter((item) => item.statusCode === 0).length);
const completedCount = computed(() => settlements.value.filter((item) => item.statusCode === 1).length);
const pendingAmount = computed(() => formatCurrency(settlements.value
  .filter((item) => item.statusCode === 0)
  .reduce((sum, item) => sum + toNumber(item.amount), 0)));

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

function statusType(statusCode) {
  return statusCode === 1 ? "success" : "warning";
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

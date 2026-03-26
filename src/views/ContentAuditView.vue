<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">内容审核</div>
        <h1 class="hero-main-title">把穿搭内容、商品跳转和社区规范放到同一条审核链路里。</h1>
        <p class="hero-copy">审核通过和驳回会直接回写到你现在 app 的内容流，所以这里除了内容质量，也要一起看商品链接是否还能正常承接导购动作。</p>
        <div class="hero-badge-list">
          <span>待审核 {{ pendingCount }}</span>
          <span>已通过 {{ approvedCount }}</span>
          <span>已驳回 {{ rejectedCount }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">审核队列</div>
        <div class="overview-value">{{ audits.length }}</div>
        <div class="overview-copy">当前进入管理端审核台的内容总量。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">已通过</div>
        <div class="overview-value">{{ approvedCount }}</div>
        <div class="overview-copy">可以稳定进入前台 feed 的内容数量。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">待处理</div>
        <div class="overview-value">{{ pendingCount }}</div>
        <div class="overview-copy">优先级最高的一批内容积压。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">已驳回</div>
        <div class="overview-value">{{ rejectedCount }}</div>
        <div class="overview-copy">需要重新编辑或补充信息后再提交的内容。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">审核列表</div>
          <div class="table-subtitle">审核动作会立即影响内容可见性与导购链路，避免旧文案或失效链接继续暴露给用户。</div>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="audits" stripe>
          <el-table-column prop="postId" label="内容 ID" width="100" />
          <el-table-column prop="title" label="内容标题" min-width="240" />
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
          <el-table-column label="操作" width="190" fixed="right">
            <template #default="{ row }">
              <el-space>
                <el-button
                  v-if="row.auditStatusCode !== 1"
                  size="small"
                  type="success"
                  :loading="actionKey === `approve-${row.postId}`"
                  @click="handleAuditAction(row, 'approve')"
                >
                  通过
                </el-button>
                <el-button
                  v-if="row.auditStatusCode !== 2"
                  size="small"
                  type="danger"
                  :loading="actionKey === `reject-${row.postId}`"
                  @click="handleAuditAction(row, 'reject')"
                >
                  驳回
                </el-button>
              </el-space>
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
import { approveAdminPost, getAdminContentAudit, rejectAdminPost } from "../api/admin";
import { resolveProductStatusType } from "../utils/adminUi";

const loading = ref(false);
const audits = ref([]);
const actionKey = ref("");

const pendingCount = computed(() => audits.value.filter((item) => item.auditStatusCode === 0).length);
const approvedCount = computed(() => audits.value.filter((item) => item.auditStatusCode === 1).length);
const rejectedCount = computed(() => audits.value.filter((item) => item.auditStatusCode === 2).length);

async function loadAudits() {
  loading.value = true;
  try {
    audits.value = await getAdminContentAudit();
  } catch (error) {
    ElMessage.error(error.message || "加载审核列表失败");
  } finally {
    loading.value = false;
  }
}

function auditTagType(statusCode) {
  if (statusCode === 1) return "success";
  if (statusCode === 2) return "danger";
  return "warning";
}

async function handleAuditAction(row, action) {
  const isApprove = action === "approve";
  const actionLabel = isApprove ? "通过" : "驳回";
  try {
    await ElMessageBox.confirm(`确认${actionLabel}内容“${row.title}”吗？`, "审核确认", {
      type: isApprove ? "success" : "warning",
      confirmButtonText: `确认${actionLabel}`,
      cancelButtonText: "取消"
    });
    actionKey.value = `${action}-${row.postId}`;
    if (isApprove) {
      await approveAdminPost(row.postId);
      ElMessage.success(`已通过“${row.title}”`);
    } else {
      await rejectAdminPost(row.postId);
      ElMessage.success(`已驳回“${row.title}”`);
    }
    await loadAudits();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "审核操作失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadAudits);
</script>

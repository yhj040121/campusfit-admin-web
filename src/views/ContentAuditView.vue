<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">内容审核</div>
        <h1 class="hero-main-title">穿搭内容、商品链接与社区规范联审</h1>
        <p class="hero-copy">把内容质量、商品链接有效性和社区规范一起看清楚，避免前台信息流被低质广告和失效导购链接破坏体验。</p>
        <div class="hero-badge-list">
          <span>待审核内容</span>
          <span>商品链接校验</span>
          <span>通过 / 驳回</span>
        </div>
      </article>

      <div class="hero-side-stack">
        <article class="info-card">
          <div class="info-card-title">当前同步状态</div>
          <p class="muted-copy">{{ statusText }}</p>
        </article>
        <article class="info-card">
          <div class="info-card-title">审核建议</div>
          <ul class="bullet-list">
            <li>优先处理待审核且导购链接待校验的内容</li>
            <li>驳回时建议同步标记问题来源，方便后续申诉</li>
            <li>通过内容需确保场景标签和商品链接一致</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">审核队列</div>
        <div class="overview-value">{{ audits.length }}</div>
        <div class="overview-copy">当前待运营处理的内容总量</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">已通过</div>
        <div class="overview-value">{{ audits.filter((item) => item.auditStatusCode === 1).length }}</div>
        <div class="overview-copy">可以稳定露出的内容数量</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">待审核</div>
        <div class="overview-value">{{ audits.filter((item) => item.auditStatusCode === 0).length }}</div>
        <div class="overview-copy">需要尽快处理的内容积压</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">审核列表</div>
          <div class="table-subtitle">审核通过与驳回动作会立即反馈到内容状态。</div>
        </div>
        <el-tag type="warning">审核动作会同步影响前台内容展示</el-tag>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="audits" stripe>
          <el-table-column prop="postId" label="内容 ID" width="90" />
          <el-table-column prop="title" label="内容标题" min-width="240" />
          <el-table-column prop="author" label="发布者" width="120" />
          <el-table-column prop="scene" label="场景" width="120" />
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
          <el-table-column label="操作" width="180" fixed="right">
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
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { approveAdminPost, getAdminContentAudit, rejectAdminPost } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const audits = ref([]);
const statusText = ref("正在同步审核队列...");
const actionKey = ref("");

async function loadAudits() {
  loading.value = true;
  try {
    audits.value = await getAdminContentAudit();
    statusText.value = `已连接后端：${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `审核列表请求失败：${error.message}`;
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

<template>
  <div class="audit-page">
    <section class="section-card audit-overview-card">
      <div class="audit-overview-copy">
        <div class="hero-kicker-pill">内容审核</div>
        <div class="audit-overview-title">先选内容，再在弹窗里完成审核。</div>
        <div class="audit-overview-text">
          这一页只负责处理审核队列。点击任意一条内容，会在当前页面弹出审核窗口，完成通过或驳回后关闭窗口，再继续下一条。
        </div>
      </div>

      <div class="audit-overview-stats">
        <div class="audit-overview-stat">
          <span class="audit-overview-value">{{ audits.length }}</span>
          <span class="audit-overview-label">全部内容</span>
        </div>
        <div class="audit-overview-stat">
          <span class="audit-overview-value">{{ pendingCount }}</span>
          <span class="audit-overview-label">待审核</span>
        </div>
        <div class="audit-overview-stat">
          <span class="audit-overview-value">{{ approvedCount }}</span>
          <span class="audit-overview-label">已通过</span>
        </div>
        <div class="audit-overview-stat">
          <span class="audit-overview-value">{{ rejectedCount }}</span>
          <span class="audit-overview-label">已驳回</span>
        </div>
      </div>
    </section>

    <section class="section-card audit-table-card">
      <div class="audit-pane-head">
        <div>
          <div class="table-title">审核列表</div>
          <div class="table-subtitle">列表只负责排队，内容审核本身放进弹窗处理，避免页面被左右分栏割裂。</div>
        </div>

        <div class="audit-pane-actions">
          <div class="toolbar-actions audit-search-bar">
            <el-input
              v-model="auditKeyword"
              clearable
              placeholder="搜索标题 / 作者 / 场景 / ID"
              class="filter-input"
            />
          </div>
          <div class="audit-filter-group">
            <button
              v-for="item in filterOptions"
              :key="item.value"
              type="button"
              class="audit-filter-chip"
              :class="{ 'audit-filter-chip--active': auditFilter === item.value }"
              @click="auditFilter = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="audit-flow-card">
        <div class="audit-flow-label">审核完成流程</div>
        <div class="audit-flow-steps">
          <span>1. 点击内容</span>
          <span>2. 在弹窗查看图文与商品链路</span>
          <span>3. 通过或驳回后关闭</span>
        </div>
      </div>

      <div class="audit-table-wrap" v-loading="loading">
        <div v-if="filteredAudits.length" class="ops-card-list">
          <article
            v-for="row in filteredAudits"
            :key="row.postId"
            class="ops-card ops-card--split audit-list-card ops-card--interactive"
            @click="openAuditDialog(row)"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("AUD", row.postId) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.title || "未命名内容" }}</div>
                <span class="ops-pill" :class="`ops-pill--${auditTagType(row.auditStatusCode)}`">
                  {{ row.auditStatus }}
                </span>
              </div>
              <div class="ops-meta-row">
                <span class="ops-meta-block">
                  <span class="ops-meta-label">发布者</span>
                  <span class="ops-meta-value">{{ row.author || "-" }}</span>
                </span>
                <span class="ops-meta-sep" />
                <span class="ops-meta-block">
                  <span class="ops-meta-label">场景</span>
                  <span class="ops-meta-value">{{ row.scene || "-" }}</span>
                </span>
                <span class="ops-meta-sep" />
                <span class="ops-meta-block">
                  <span class="ops-meta-label">提交时间</span>
                  <span class="ops-meta-value">{{ row.createdAt || "-" }}</span>
                </span>
              </div>
              <div class="ops-chip-row">
                <span class="ops-pill" :class="`ops-pill--${resolveProductStatusType(row.productStatus)}`">
                  {{ row.productStatus }}
                </span>
                <span class="ops-pill ops-pill--primary">点击进入审核</span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">审核线索</div>
              <div class="ops-note">商品链路：{{ row.productStatus || "待确认" }}</div>
              <div class="ops-note">审核状态：{{ row.auditStatus || "待审核" }}</div>
            </div>

            <div class="ops-card-side">
              <div class="ops-card-actions">
                <el-button plain @click.stop="openAuditDialog(row)">查看审核</el-button>
              </div>
              <div class="ops-card-caption">点击卡片或按钮，直接在当前页弹出审核窗口。</div>
            </div>
          </article>
        </div>
        <el-empty v-else description="暂无符合筛选条件的内容" />
      </div>
    </section>

    <el-dialog
      v-model="previewVisible"
      width="min(1180px, calc(100vw - 48px))"
      top="4vh"
      destroy-on-close
      class="audit-dialog"
      @closed="handleDialogClosed"
    >
      <template #header>
        <div class="audit-dialog-head">
          <div>
            <div class="audit-dialog-kicker">内容审核</div>
            <div class="audit-dialog-title">{{ selectedDetail?.title || "内容预览" }}</div>
          </div>
          <div v-if="selectedDetail" class="audit-dialog-id">内容 ID {{ selectedDetail.postId }}</div>
        </div>
      </template>

      <div v-loading="detailLoading" class="audit-dialog-body">
        <template v-if="selectedDetail">
          <div class="audit-dialog-grid">
            <div class="audit-dialog-media">
              <div v-if="currentImage" class="preview-image-shell">
                <img :src="currentImage" :alt="selectedDetail.title" class="preview-image" />
                <div class="preview-image-badge">{{ selectedDetail.coverTag }}</div>
              </div>
              <div v-else class="preview-image-empty">暂无图片</div>

              <div v-if="previewImages.length > 1" class="preview-thumb-row">
                <button
                  v-for="(image, index) in previewImages"
                  :key="`${selectedDetail.postId}-${index}`"
                  type="button"
                  class="preview-thumb"
                  :class="{ 'preview-thumb--active': selectedImageIndex === index }"
                  @click="selectedImageIndex = index"
                >
                  <img :src="image" :alt="`${selectedDetail.title}-${index + 1}`" />
                </button>
              </div>
            </div>

            <div class="audit-dialog-side">
              <div class="preview-meta-row">
                <span class="status-pill">{{ selectedDetail.auditStatus }}</span>
                <span class="status-pill">{{ selectedDetail.scene }}</span>
                <span class="status-pill">{{ selectedDetail.createdAt }}</span>
              </div>

              <div class="preview-copy">{{ selectedDetail.description }}</div>

              <div class="preview-tag-row">
                <span class="preview-tag">{{ selectedDetail.scene }}</span>
                <span class="preview-tag">{{ selectedDetail.style }}</span>
                <span class="preview-tag">{{ selectedDetail.budget }}</span>
              </div>

              <div class="preview-author-card">
                <div v-if="selectedDetail.avatarUrl" class="preview-author-avatar">
                  <img :src="selectedDetail.avatarUrl" :alt="selectedDetail.author" />
                </div>
                <div v-else class="preview-author-avatar preview-author-avatar--fallback">
                  {{ selectedDetail.avatarText }}
                </div>
                <div class="preview-author-copy">
                  <div class="preview-author-name">{{ selectedDetail.author }}</div>
                  <div class="preview-author-school">{{ selectedDetail.school }}</div>
                </div>
              </div>

              <div class="preview-metrics">
                <div class="preview-metric">
                  <span class="preview-metric-value">{{ selectedDetail.likeCount }}</span>
                  <span class="preview-metric-label">点赞</span>
                </div>
                <div class="preview-metric">
                  <span class="preview-metric-value">{{ selectedDetail.commentCount }}</span>
                  <span class="preview-metric-label">评论</span>
                </div>
                <div class="preview-metric">
                  <span class="preview-metric-value">{{ selectedDetail.favoriteCount }}</span>
                  <span class="preview-metric-label">收藏</span>
                </div>
                <div class="preview-metric">
                  <span class="preview-metric-value">{{ selectedDetail.shareCount }}</span>
                  <span class="preview-metric-label">分享</span>
                </div>
              </div>

              <div class="preview-product-card">
                <div class="preview-product-top">
                  <div>
                    <div class="preview-product-label">商品链路</div>
                    <div class="preview-product-name">{{ selectedDetail.productName }}</div>
                  </div>
                  <el-tag :type="resolveProductStatusType(selectedDetail.productStatus)">{{ selectedDetail.productStatus }}</el-tag>
                </div>
                <div class="preview-product-meta">
                  <span>{{ selectedDetail.productPlatform }}</span>
                  <span>{{ selectedDetail.productPrice }}</span>
                </div>
                <a
                  v-if="selectedDetail.productConfigured && selectedDetail.productUrl"
                  :href="selectedDetail.productUrl"
                  class="preview-product-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  查看商品链接
                </a>
                <div v-else class="preview-product-empty">当前内容未配置可跳转商品链接。</div>
              </div>
            </div>
          </div>
        </template>

        <el-empty v-else description="当前没有可预览的内容" />
      </div>

      <template #footer>
        <div class="audit-dialog-actions">
          <el-button @click="previewVisible = false">关闭窗口</el-button>
          <el-button
            v-if="selectedDetail && selectedDetail.auditStatusCode !== 2"
            type="danger"
            plain
            :loading="actionKey === `reject-${selectedDetail.postId}`"
            @click="handleAuditAction(selectedDetail, 'reject')"
          >
            驳回内容
          </el-button>
          <el-button
            v-if="selectedDetail && selectedDetail.auditStatusCode !== 1"
            type="success"
            :loading="actionKey === `approve-${selectedDetail.postId}`"
            @click="handleAuditAction(selectedDetail, 'approve')"
          >
            通过内容
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  approveAdminPost,
  getAdminContentAudit,
  getAdminContentAuditDetail,
  rejectAdminPost
} from "../api/admin";
import { formatAdminCode, matchesKeyword, resolveProductStatusType } from "../utils/adminUi";

const loading = ref(false);
const detailLoading = ref(false);
const previewVisible = ref(false);
const audits = ref([]);
const selectedDetail = ref(null);
const selectedImageIndex = ref(0);
const actionKey = ref("");
const auditFilter = ref("all");
const auditKeyword = ref("");

const filterOptions = [
  { label: "全部", value: "all" },
  { label: "待审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" }
];

const filteredAudits = computed(() => {
  const byStatus = audits.value.filter((item) => {
    if (auditFilter.value === "pending") {
      return item.auditStatusCode === 0;
    }
    if (auditFilter.value === "approved") {
      return item.auditStatusCode === 1;
    }
    if (auditFilter.value === "rejected") {
      return item.auditStatusCode === 2;
    }
    return true;
  });

  return byStatus.filter((item) => matchesKeyword(auditKeyword.value, [
    item.postId,
    item.title,
    item.author,
    item.scene,
    item.productStatus,
    item.auditStatus
  ]));
});

const pendingCount = computed(() => audits.value.filter((item) => item.auditStatusCode === 0).length);
const approvedCount = computed(() => audits.value.filter((item) => item.auditStatusCode === 1).length);
const rejectedCount = computed(() => audits.value.filter((item) => item.auditStatusCode === 2).length);

const previewImages = computed(() => {
  const images = (selectedDetail.value?.imageUrls || []).filter(Boolean);
  if (images.length) {
    return images;
  }
  return selectedDetail.value?.coverImageUrl ? [selectedDetail.value.coverImageUrl] : [];
});

const currentImage = computed(() => previewImages.value[selectedImageIndex.value] || "");

function auditTagType(statusCode) {
  if (statusCode === 1) return "success";
  if (statusCode === 2) return "danger";
  return "warning";
}

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

async function openAuditDialog(row) {
  if (!row?.postId) {
    return;
  }
  previewVisible.value = true;
  detailLoading.value = true;
  selectedImageIndex.value = 0;
  try {
    selectedDetail.value = await getAdminContentAuditDetail(row.postId);
  } catch (error) {
    selectedDetail.value = null;
    ElMessage.error(error.message || "加载审核预览失败");
  } finally {
    detailLoading.value = false;
  }
}

function handleDialogClosed() {
  selectedDetail.value = null;
  selectedImageIndex.value = 0;
  actionKey.value = "";
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
    previewVisible.value = false;
    await loadAudits();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "审核操作失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(() => {
  loadAudits();
});
</script>

<style scoped>
.audit-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.audit-overview-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px 22px;
}

.audit-overview-copy,
.audit-overview-stats,
.audit-overview-title,
.audit-overview-text {
  position: relative;
  z-index: 1;
}

.audit-overview-title {
  margin-top: 10px;
  color: var(--admin-text);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -0.04em;
}

.audit-overview-text {
  max-width: 60ch;
  margin-top: 8px;
  color: var(--admin-text-soft);
  font-size: 13px;
  line-height: 1.6;
}

.audit-overview-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(108px, 1fr));
  gap: 10px;
}

.audit-overview-stat {
  min-width: 108px;
  padding: 14px;
  border: 1px solid rgba(144, 177, 203, 0.18);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
}

.audit-overview-value {
  display: block;
  color: var(--admin-text);
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.audit-overview-label {
  display: block;
  margin-top: 8px;
  color: var(--admin-text-soft);
  font-size: 12px;
}

.audit-table-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px;
}

.audit-pane-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.audit-pane-actions {
  display: grid;
  justify-items: end;
  gap: 12px;
}

.audit-filter-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.audit-search-bar {
  justify-content: flex-end;
}

.audit-filter-chip {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--admin-text-soft);
  font-size: 13px;
  font-weight: 700;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.audit-filter-chip:hover,
.audit-filter-chip--active {
  transform: translateY(-1px);
}

.audit-filter-chip--active {
  border-color: rgba(20, 103, 245, 0.18);
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.14), rgba(56, 194, 163, 0.18));
  color: var(--admin-text);
}

.audit-flow-card {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid rgba(144, 177, 203, 0.16);
  border-radius: 22px;
  background: rgba(247, 251, 255, 0.82);
}

.audit-flow-label {
  color: var(--admin-text);
  font-size: 13px;
  font-weight: 800;
}

.audit-flow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--admin-text-soft);
  font-size: 12px;
}

.audit-table-wrap {
  overflow: visible;
  padding: 18px;
  border: 1px solid rgba(144, 177, 203, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.74);
}

.audit-list-card {
  grid-template-columns: minmax(0, 1.55fr) minmax(220px, 0.7fr) auto;
}

.audit-dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.audit-dialog-kicker {
  color: var(--admin-primary);
  font-family: var(--admin-font-data);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.audit-dialog-title {
  margin-top: 8px;
  color: var(--admin-text);
  font-size: 28px;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.audit-dialog-id {
  color: var(--admin-text-muted);
  font-family: var(--admin-font-data);
  font-size: 12px;
  font-weight: 700;
}

.audit-dialog-body {
  min-height: 520px;
}

.audit-dialog-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: 22px;
  align-items: start;
}

.audit-dialog-media,
.audit-dialog-side {
  display: grid;
  gap: 14px;
}

.preview-image-shell {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(232, 242, 255, 0.92), rgba(245, 251, 255, 0.96));
  border: 1px solid rgba(20, 103, 245, 0.1);
  aspect-ratio: 1.48;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-image-badge {
  position: absolute;
  left: 16px;
  top: 16px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--admin-text);
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(28, 78, 125, 0.12);
}

.preview-image-empty {
  min-height: 320px;
  border-radius: 28px;
  border: 1px dashed rgba(20, 103, 245, 0.18);
  background: rgba(247, 251, 255, 0.8);
  color: var(--admin-text-soft);
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
}

.preview-thumb-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.preview-thumb {
  width: 74px;
  height: 74px;
  padding: 0;
  border: 1px solid rgba(20, 103, 245, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  overflow: hidden;
  flex: 0 0 auto;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-thumb--active {
  transform: translateY(-1px);
  border-color: rgba(20, 103, 245, 0.26);
  box-shadow: 0 10px 22px rgba(20, 103, 245, 0.12);
}

.preview-meta-row,
.preview-tag-row,
.preview-product-top,
.preview-product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-copy {
  color: var(--admin-text-soft);
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
}

.preview-tag {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(20, 103, 245, 0.12);
  border-radius: 999px;
  background: rgba(247, 251, 255, 0.86);
  color: var(--admin-primary);
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}

.preview-author-card,
.preview-product-card {
  padding: 16px;
  border: 1px solid var(--admin-border);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
}

.preview-author-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.preview-author-avatar {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.12), rgba(56, 194, 163, 0.18));
}

.preview-author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-author-avatar--fallback {
  color: var(--admin-primary);
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 800;
}

.preview-author-name {
  color: var(--admin-text);
  font-size: 15px;
  font-weight: 800;
}

.preview-author-school {
  margin-top: 4px;
  color: var(--admin-text-soft);
  font-size: 13px;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.preview-metric {
  padding: 14px 12px;
  border-radius: 22px;
  background: rgba(247, 251, 255, 0.88);
  border: 1px solid rgba(20, 103, 245, 0.1);
}

.preview-metric-value {
  display: block;
  color: var(--admin-text);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.preview-metric-label {
  display: block;
  margin-top: 8px;
  color: var(--admin-text-soft);
  font-size: 12px;
}

.preview-product-top {
  align-items: flex-start;
  justify-content: space-between;
}

.preview-product-label {
  color: var(--admin-text-muted);
  font-family: var(--admin-font-data);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-product-name {
  margin-top: 8px;
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 800;
}

.preview-product-meta {
  margin-top: 12px;
  color: var(--admin-text-soft);
  font-size: 13px;
}

.preview-product-link {
  display: inline-flex;
  margin-top: 14px;
  color: var(--admin-primary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.preview-product-empty {
  margin-top: 14px;
  color: var(--admin-text-soft);
  font-size: 13px;
}

.audit-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1420px) {
  .audit-overview-card {
    grid-template-columns: 1fr;
  }

  .audit-overview-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .audit-pane-head {
    flex-direction: column;
  }

  .audit-pane-actions,
  .audit-search-bar {
    width: 100%;
    justify-items: stretch;
  }

  .audit-filter-group {
    justify-content: flex-start;
  }

  .audit-dialog-grid {
    grid-template-columns: 1fr;
  }

  .audit-list-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .audit-overview-stats,
  .preview-metrics {
    grid-template-columns: 1fr;
  }

  .audit-dialog-body {
    min-height: 0;
  }

  .preview-image-shell {
    aspect-ratio: 1.1;
  }

  .audit-dialog-actions {
    flex-wrap: wrap;
  }
}
</style>

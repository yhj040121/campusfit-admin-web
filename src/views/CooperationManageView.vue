<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">合作管理</div>
        <h1 class="hero-main-title">把合作邀约、达标发奖和后续激励结算放进同一条后台运营链路里。</h1>
        <p class="hero-copy">这里集中展示商家合作单的创建、执行进度和奖励发放状态。内容运营可以直接发起合作邀约，财务可以只盯待发奖励，让商家合作和激励发放真正串成一条线。</p>
        <div class="hero-badge-list">
          <span>合作单 {{ cooperations.length }}</span>
          <span>待确认 {{ pendingCount }}</span>
          <span>进行中 {{ runningCount }}</span>
          <span>待发奖励 {{ rewardReadyCount }}</span>
          <span>已发奖励 {{ issuedRewardAmount }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">合作单总数</div>
        <div class="overview-value">{{ cooperations.length }}</div>
        <div class="overview-copy">已经进入平台运营视野的合作单总量。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">待确认</div>
        <div class="overview-value">{{ pendingCount }}</div>
        <div class="overview-copy">创作者还未接受、暂未进入执行阶段的合作单。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">待发奖励</div>
        <div class="overview-value">{{ rewardReadyCount }}</div>
        <div class="overview-copy">内容审核达标后，等待后台确认发放奖励的合作单。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">已发奖励</div>
        <div class="overview-value">{{ issuedRewardAmount }}</div>
        <div class="overview-copy">已经发放、后续会进入结算和提现链路的奖励金额。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">合作单列表</div>
          <div class="table-subtitle">先看合作邀约是否被接受，再跟进达标数量和奖励发放。这样商家合作和激励系统就不会再割裂成两套后台动作。</div>
        </div>
        <div class="toolbar-actions cooperation-filters">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索合作标题 / 商家 / 创作者"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="待确认" value="pending" />
            <el-option label="进行中" value="running" />
            <el-option label="待发奖励" value="ready" />
            <el-option label="已发奖励" value="issued" />
            <el-option label="已放弃" value="abandoned" />
          </el-select>
          <el-button v-if="canCreate" type="primary" @click="openCreateDialog">创建合作单</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card cooperation-panel">
        <div v-if="filteredCooperations.length" class="cooperation-list">
          <article
            v-for="row in filteredCooperations"
            :key="row.id"
            class="coop-card"
          >
            <div class="coop-card-main">
              <div class="coop-code">{{ row.displayCode }}</div>
              <div class="coop-card-heading">
                <div class="coop-title">{{ row.title || "未命名合作单" }}</div>
                <span class="coop-status-pill" :class="`coop-status-pill--${resolveStatusTone(row)}`">
                  {{ resolveStatusLabel(row) }}
                </span>
              </div>
              <div class="coop-card-meta">
                <span class="coop-meta-label">商家</span>
                <span class="coop-meta-value">{{ row.merchantName || "-" }}</span>
              </div>
              <div class="coop-card-meta coop-card-meta--soft">
                <span class="coop-meta-label">创作者</span>
                <span class="coop-meta-value">{{ row.creatorName || "-" }}</span>
              </div>
            </div>

            <div class="coop-card-section">
              <div class="coop-section-label">奖励与目标</div>
              <div class="coop-amount ops-amount">{{ formatCurrency(row.rewardAmount) }}</div>
              <div class="coop-detail-line">
                <el-icon><Document /></el-icon>
                <span>{{ resolveGoalText(row) }}</span>
              </div>
              <div class="coop-detail-line">
                <el-icon><Calendar /></el-icon>
                <span>{{ resolveDeadlineText(row) }}</span>
              </div>
            </div>

            <div class="coop-card-section coop-card-section--progress">
              <div class="coop-progress-top">
                <span class="coop-section-label">进度</span>
                <span class="coop-progress-count">{{ resolveProgressCount(row) }}</span>
              </div>
              <div class="coop-progress-track">
                <span
                  class="coop-progress-fill"
                  :class="`coop-progress-fill--${resolveProgressTone(row)}`"
                  :style="{ width: `${resolveProgressPercent(row)}%` }"
                />
              </div>
              <div class="coop-progress-state">{{ resolveProgressHeading(row) }}</div>
              <div class="coop-progress-sub">{{ resolveProgressSecondary(row) }}</div>
            </div>

            <div class="coop-card-side">
              <div v-if="hasOperationAction(row)" class="coop-side-actions">
                <el-button
                  v-if="canIssueRewardAction(row)"
                  class="coop-icon-action coop-icon-action--primary"
                  :loading="actionKey === `issue-${row.id}`"
                  @click="handleIssueReward(row)"
                >
                  <el-icon><Select /></el-icon>
                </el-button>
                <el-button
                  v-if="canCancelCooperation(row)"
                  class="coop-icon-action coop-icon-action--danger"
                  :loading="actionKey === `cancel-${row.id}`"
                  @click="handleCancelCooperation(row)"
                >
                  <el-icon><CloseBold /></el-icon>
                </el-button>
              </div>
              <div v-else class="coop-icon-action coop-icon-action--muted">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
              <div class="coop-side-caption">{{ resolveActionHint(row) }}</div>
            </div>
          </article>
        </div>
        <el-empty v-else description="暂无符合条件的合作单" />
      </el-card>
    </section>

    <el-dialog v-model="dialogVisible" title="创建合作单" width="680px">
      <el-alert
        v-if="createDisabled"
        :type="createAlertType"
        :closable="false"
        :title="createAlertTitle"
        show-icon
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="dialog-form"
      >
        <div class="dialog-grid">
          <el-form-item label="创作者" prop="userId">
            <el-select
              v-model="form.userId"
              filterable
              placeholder="选择创作者"
              :no-data-text="userSelectEmptyText"
            >
              <el-option
                v-for="item in activeUsers"
                :key="item.userId"
                :label="`${item.nickname} · ${item.school || '未完善学校信息'}`"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="合作商家" prop="merchantId">
            <el-select
              v-model="form.merchantId"
              filterable
              placeholder="选择合作中商家"
              :no-data-text="merchantSelectEmptyText"
            >
              <el-option
                v-for="item in merchantOptions"
                :key="item.merchantId"
                :label="item.name"
                :value="item.merchantId"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="合作标题" prop="cooperationTitle" class="span-2">
            <el-input v-model="form.cooperationTitle" maxlength="120" show-word-limit placeholder="例如：春季新品校园通勤合作计划" />
          </el-form-item>

          <el-form-item label="合作说明" prop="cooperationDesc" class="span-2">
            <el-input
              v-model="form.cooperationDesc"
              type="textarea"
              maxlength="500"
              show-word-limit
              placeholder="补充合作要求、发布方向和奖励说明，方便创作者确认后直接执行。"
            />
          </el-form-item>

          <el-form-item label="奖励金额" prop="rewardAmount">
            <el-input-number v-model="form.rewardAmount" :min="0.01" :step="10" :precision="2" />
          </el-form-item>

          <el-form-item label="目标内容数" prop="targetPostCount">
            <el-input-number v-model="form.targetPostCount" :min="1" :max="20" :step="1" :precision="0" />
          </el-form-item>

          <el-form-item label="目标点赞数" prop="targetLikeCount">
            <el-input-number v-model="form.targetLikeCount" :min="0" :max="100000" :step="10" :precision="0" />
          </el-form-item>

          <el-form-item label="截止时间" prop="deadlineAt" class="span-2">
            <el-date-picker
              v-model="form.deadlineAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm"
              placeholder="选择合作截止时间"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="toolbar-actions">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" :disabled="createDisabled" @click="handleCreate">
            创建合作单
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Calendar, CircleCheckFilled, CloseBold, Document, Select } from "@element-plus/icons-vue";
import {
  cancelAdminCooperation,
  createAdminCooperation,
  getAdminCooperations,
  getAdminMerchants,
  getAdminUsers,
  issueAdminCooperationReward
} from "../api/admin";
import { getAdminProfile } from "../utils/adminAuth";
import {
  formatCurrency,
  normalizeDateTimeValue,
  toNumber
} from "../utils/adminUi";

const adminProfile = getAdminProfile();
const roleCode = adminProfile?.roleCode || "";

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const actionKey = ref("");
const keyword = ref("");
const statusFilter = ref("all");
const cooperations = ref([]);
const users = ref([]);
const merchants = ref([]);
const formRef = ref();

const form = reactive({
  userId: undefined,
  merchantId: undefined,
  cooperationTitle: "",
  cooperationDesc: "",
  rewardAmount: 100,
  targetPostCount: 1,
  targetLikeCount: 0,
  deadlineAt: ""
});

const rules = {
  userId: [{ required: true, message: "请选择创作者", trigger: "change" }],
  merchantId: [{ required: true, message: "请选择商家", trigger: "change" }],
  cooperationTitle: [{ required: true, message: "请输入合作标题", trigger: "blur" }],
  rewardAmount: [{ required: true, message: "请输入奖励金额", trigger: "change" }]
};

const canCreate = computed(() => ["SUPER_ADMIN", "CONTENT_OPERATOR"].includes(roleCode));
const canIssueReward = computed(() => ["SUPER_ADMIN", "FINANCE"].includes(roleCode));
const activeUsers = computed(() => users.value.filter((item) => item.statusCode === 1));
const merchantOptions = computed(() => merchants.value.filter((item) => Number(item.statusCode) === 1));
const hasActiveUsers = computed(() => activeUsers.value.length > 0);
const hasActiveMerchants = computed(() => merchantOptions.value.length > 0);
const submitDisabled = computed(() => !hasActiveUsers.value || !hasActiveMerchants.value);
const createDisabled = computed(() => dialogVisible.value && submitDisabled.value);
const createAlertType = computed(() => (!hasActiveMerchants.value && hasActiveUsers.value ? "info" : "warning"));
const createAlertTitle = computed(() => {
  if (!hasActiveUsers.value && !hasActiveMerchants.value) {
    return "当前没有可选创作者，也没有合作中的商家，请先补齐基础数据。";
  }
  if (!hasActiveUsers.value) {
    return "当前没有可选创作者，请先确认创作者账号状态。";
  }
  if (!hasActiveMerchants.value) {
    return "当前没有合作中的商家，弹窗仍可填写信息，但商家列表会为空。可先到商家管理把意向商家设为合作中。";
  }
  return "";
});
const userSelectEmptyText = computed(() => (
  hasActiveUsers.value
    ? "暂无可选创作者"
    : "当前没有可用的创作者"
));
const merchantSelectEmptyText = computed(() => (
  hasActiveMerchants.value
    ? "暂无可选商家"
    : "暂无合作中商家，请先到商家管理启用"
));

const pendingCount = computed(() => cooperations.value.filter((item) => item.statusCode === 0).length);
const runningCount = computed(() => cooperations.value.filter((item) => item.statusCode === 1).length);
const rewardReadyCount = computed(() => cooperations.value.filter((item) => item.rewardReady && !item.rewardIssued).length);
const issuedRewardAmount = computed(() => formatCurrency(cooperations.value
  .filter((item) => item.rewardIssued)
  .reduce((sum, item) => sum + toNumber(item.rewardAmount), 0)));

const filteredCooperations = computed(() => {
  const needle = String(keyword.value || "").trim().toLowerCase();
  return cooperations.value.filter((item) => {
    const matchesKeyword = !needle || [
      item.displayCode,
      item.cooperationCode,
      item.title,
      item.creatorName,
      item.merchantName
    ].some((value) => String(value || "").toLowerCase().includes(needle));

    const matchesStatus = statusFilter.value === "all"
      || (statusFilter.value === "pending" && item.statusCode === 0)
      || (statusFilter.value === "running" && item.statusCode === 1)
      || (statusFilter.value === "ready" && item.rewardReady && !item.rewardIssued)
      || (statusFilter.value === "issued" && item.rewardIssued)
      || (statusFilter.value === "abandoned" && item.statusCode === 4);

    return matchesKeyword && matchesStatus;
  });
});

function formatDisplayCode(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "-";
  }
  return `COOP-${String(Math.trunc(numeric)).padStart(6, "0")}`;
}

function normalizeCooperationItem(item) {
  return {
    ...item,
    displayCode: item?.displayCode || formatDisplayCode(item?.id)
  };
}

function normalizeMerchantItem(item) {
  const statusCode = Number(item?.statusCode);
  return {
    ...item,
    statusCode: Number.isFinite(statusCode)
      ? statusCode
      : (String(item?.status || "").includes("合作中") ? 1 : 0)
  };
}

function resolveStatusLabel(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 4) {
    return "已取消";
  }
  if (statusCode === 3) {
    return "已发奖励";
  }
  if (statusCode === 2) {
    return "待发奖励";
  }
  if (statusCode === 1) {
    return "进行中";
  }
  return "待确认";
}

function resolveStatusTone(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 4) {
    return "danger";
  }
  if (statusCode === 3) {
    return "success";
  }
  if (statusCode === 2) {
    return "warning";
  }
  if (statusCode === 1) {
    return "active";
  }
  return "pending";
}

function canCancelCooperation(row) {
  const statusCode = Number(row?.statusCode || 0);
  return canCreate.value && statusCode !== 3 && statusCode !== 4;
}

function canIssueRewardAction(row) {
  return Boolean(row?.rewardReady && !row?.rewardIssued && canIssueReward.value);
}

function hasOperationAction(row) {
  return canIssueRewardAction(row) || canCancelCooperation(row);
}

function resolveGoalText(row) {
  const targetPostCount = Math.max(Number(row?.targetPostCount || 1), 1);
  const targetLikeCount = Math.max(Number(row?.targetLikeCount || 0), 0);
  return targetLikeCount > 0
    ? `${targetPostCount} 篇内容 / ${targetLikeCount} 点赞`
    : `${targetPostCount} 篇内容`;
}

function resolveDeadlineText(row) {
  return row?.deadlineAt && row.deadlineAt !== "-"
    ? `截止 ${row.deadlineAt}`
    : "未设置截止时间";
}

function resolveProgressCount(row) {
  const approvedPostCount = Math.max(Number(row?.approvedPostCount || 0), 0);
  const targetPostCount = Math.max(Number(row?.targetPostCount || 1), 1);
  return `${approvedPostCount}/${targetPostCount} 篇内容`;
}

function resolveActionHint(row) {
  if (canIssueRewardAction(row) && canCancelCooperation(row)) {
    return "可发奖或取消";
  }
  if (canIssueRewardAction(row)) {
    return "发放奖励";
  }
  if (canCancelCooperation(row)) {
    return "取消合作";
  }
  return resolveOperationLabel(row);
}

function resolveOperationLabel(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 4) {
    return row?.acceptedAt && row.acceptedAt !== "-" ? "已取消执行" : "已取消邀请";
  }
  if (statusCode === 3) {
    return row?.rewardIssuedAt && row.rewardIssuedAt !== "-"
      ? `已于 ${row.rewardIssuedAt} 发奖`
      : "奖励已发放";
  }
  if (statusCode === 2) {
    return "内容已达标，等待发奖";
  }
  if (statusCode === 1) {
    return row?.acceptedAt && row.acceptedAt !== "-"
      ? `已于 ${row.acceptedAt} 接受合作`
      : "合作执行中";
  }
  return "等待创作者确认";
}

function resolveProgressHeading(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 4) {
    return "合作已终止";
  }
  if (statusCode === 3) {
    return "奖励已发放";
  }
  if (statusCode === 2) {
    return "已达标待发奖";
  }
  if (statusCode === 1) {
    return "执行中";
  }
  return "待确认";
}

function resolveProgressPercent(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 3) {
    return 100;
  }

  const targetPostCount = Math.max(Number(row?.targetPostCount || 1), 1);
  const approvedPostCount = Math.max(Number(row?.approvedPostCount || 0), 0);
  const postRatio = Math.min(approvedPostCount / targetPostCount, 1);

  if (Number(row?.targetLikeCount || 0) > 0) {
    const targetLikeCount = Math.max(Number(row?.targetLikeCount || 0), 1);
    const approvedLikeCount = Math.max(Number(row?.approvedLikeCount || 0), 0);
    const likeRatio = Math.min(approvedLikeCount / targetLikeCount, 1);
    return Math.round(Math.min(postRatio, likeRatio) * 100);
  }

  return Math.round(postRatio * 100);
}

function resolveProgressTone(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 4) {
    return "danger";
  }
  if (statusCode === 3) {
    return "success";
  }
  if (statusCode === 2) {
    return "warning";
  }
  if (statusCode === 1) {
    return "primary";
  }
  return "muted";
}

function resolveProgressPrimary(row) {
  const postText = `${row.approvedPostCount}/${row.targetPostCount} 篇已通过`;
  if (Number(row?.targetLikeCount || 0) > 0) {
    return `${postText} · 点赞 ${row.approvedLikeCount}/${row.targetLikeCount}`;
  }
  return `${postText} · 无点赞门槛`;
}

function resolveProgressSecondary(row) {
  const statusCode = Number(row?.statusCode || 0);
  if (statusCode === 4) {
    return row?.acceptedAt && row.acceptedAt !== "-"
      ? "合作已取消，不再进入结算"
      : "合作邀请已撤回";
  }
  if (statusCode === 3) {
    return row?.rewardIssuedAt && row.rewardIssuedAt !== "-"
      ? `发奖时间 ${row.rewardIssuedAt}`
      : "奖励已发放，后续进入结算";
  }
  if (statusCode === 2) {
    return "内容已达标，等待后台发奖";
  }
  if (statusCode === 1) {
    return row?.acceptedAt && row.acceptedAt !== "-"
      ? `接受时间 ${row.acceptedAt}`
      : "合作执行中，继续累计达标";
  }
  return "等待创作者确认合作";
}

async function loadPageData() {
  loading.value = true;
  try {
    const cooperationPromise = getAdminCooperations();
    const referencePromises = canCreate.value
      ? Promise.all([getAdminUsers(), getAdminMerchants()])
      : Promise.resolve([[], []]);

    const [cooperationData, [userData, merchantData]] = await Promise.all([
      cooperationPromise,
      referencePromises
    ]);

    cooperations.value = Array.isArray(cooperationData) ? cooperationData.map(normalizeCooperationItem) : [];
    users.value = Array.isArray(userData) ? userData : [];
    merchants.value = Array.isArray(merchantData) ? merchantData.map(normalizeMerchantItem) : [];
  } catch (error) {
    ElMessage.error(error.message || "加载合作管理数据失败");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.userId = undefined;
  form.merchantId = undefined;
  form.cooperationTitle = "";
  form.cooperationDesc = "";
  form.rewardAmount = 100;
  form.targetPostCount = 1;
  form.targetLikeCount = 0;
  form.deadlineAt = "";
  formRef.value?.clearValidate();
}

function openCreateDialog() {
  resetForm();
  dialogVisible.value = true;
}

async function handleCreate() {
  if (!formRef.value) {
    return;
  }
  try {
    await formRef.value.validate();
    submitting.value = true;
    await createAdminCooperation({
      userId: form.userId,
      merchantId: form.merchantId,
      cooperationTitle: form.cooperationTitle.trim(),
      cooperationDesc: form.cooperationDesc.trim(),
      rewardAmount: Number(form.rewardAmount || 0),
      targetPostCount: Number(form.targetPostCount || 1),
      targetLikeCount: Number(form.targetLikeCount || 0),
      deadlineAt: normalizeDateTimeValue(form.deadlineAt)
    });
    ElMessage.success("合作单已创建并推送给创作者");
    dialogVisible.value = false;
    await loadPageData();
  } catch (error) {
    if (error?.message) {
      ElMessage.error(error.message);
    }
  } finally {
    submitting.value = false;
  }
}

async function handleIssueReward(row) {
  try {
    await ElMessageBox.confirm(
      `确认向“${row.creatorName}”发放合作单“${row.title}”的奖励吗？`,
      "奖励发放确认",
      {
        type: "warning",
        confirmButtonText: "确认发放",
        cancelButtonText: "取消"
      }
    );
    actionKey.value = `issue-${row.id}`;
    await issueAdminCooperationReward(row.id);
    ElMessage.success(`已向“${row.creatorName}”发放合作奖励`);
    await loadPageData();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "合作奖励发放失败");
    }
  } finally {
    actionKey.value = "";
  }
}

async function handleCancelCooperation(row) {
  try {
    await ElMessageBox.confirm(
      `确认取消合作单“${row.title}”吗？取消后该合作将不再计入奖励进度。`,
      "取消合作确认",
      {
        type: "warning",
        confirmButtonText: "确认取消",
        cancelButtonText: "再想想"
      }
    );
    actionKey.value = `cancel-${row.id}`;
    await cancelAdminCooperation(row.id);
    ElMessage.success(`合作单“${row.title}”已取消`);
    await loadPageData();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "取消合作失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadPageData);
</script>

<style scoped>
.cooperation-filters {
  justify-content: flex-end;
}

.filter-input {
  width: 260px;
}

.filter-select {
  width: 150px;
}

.cooperation-panel :deep(.el-card__body) {
  padding: 18px;
}

.cooperation-list {
  display: grid;
  gap: 14px;
}

.coop-card {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(210px, 0.9fr) minmax(240px, 1fr) auto;
  gap: 22px;
  align-items: center;
  padding: 22px 24px;
  border: 1px solid rgba(144, 177, 203, 0.16);
  border-radius: 26px;
  background:
    linear-gradient(135deg, rgba(20, 103, 245, 0.03), transparent 34%),
    linear-gradient(315deg, rgba(56, 194, 163, 0.04), transparent 40%),
    rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(28, 78, 125, 0.08);
}

.coop-card-main,
.coop-card-section {
  display: grid;
  gap: 10px;
}

.coop-card-heading,
.coop-progress-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.coop-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  width: fit-content;
  padding: 0 13px;
  border-radius: 999px;
  background: rgba(20, 103, 245, 0.08);
  color: var(--admin-primary);
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.coop-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.coop-status-pill--pending {
  background: rgba(126, 148, 168, 0.14);
  color: #6d7f91;
}

.coop-status-pill--active {
  background: rgba(56, 194, 163, 0.14);
  color: #1c8d74;
}

.coop-status-pill--warning {
  background: rgba(242, 163, 43, 0.16);
  color: #ad7415;
}

.coop-status-pill--success {
  background: rgba(34, 161, 122, 0.14);
  color: #1b8a67;
}

.coop-status-pill--danger {
  background: rgba(235, 109, 109, 0.14);
  color: #c85b5b;
}

.coop-title {
  color: var(--admin-text);
  font-family: var(--admin-font-display);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  flex: 1;
  min-width: 180px;
}

.coop-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--admin-text-soft);
  font-size: 13px;
}

.coop-card-meta--soft {
  color: var(--admin-text-muted);
}

.coop-meta-label {
  font-weight: 700;
}

.coop-meta-value {
  font-weight: 600;
}

.coop-section-label {
  color: var(--admin-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.coop-detail-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--admin-text-soft);
  font-size: 13px;
  font-weight: 600;
}

.coop-amount {
  color: var(--admin-text);
  font-size: clamp(32px, 2.7vw, 42px);
  font-weight: 800;
  letter-spacing: -0.03em;
  text-shadow: 0 10px 24px rgba(20, 103, 245, 0.08);
}

.coop-progress-count {
  color: var(--admin-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.coop-progress-state {
  color: var(--admin-text);
  font-size: 15px;
  font-weight: 800;
}

.coop-progress-track {
  position: relative;
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  background: rgba(17, 32, 51, 0.08);
}

.coop-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 220ms ease;
}

.coop-progress-fill--primary {
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.88), rgba(78, 181, 255, 0.88));
}

.coop-progress-fill--warning {
  background: linear-gradient(135deg, rgba(242, 163, 43, 0.9), rgba(255, 196, 95, 0.92));
}

.coop-progress-fill--success {
  background: linear-gradient(135deg, rgba(34, 161, 122, 0.92), rgba(56, 194, 163, 0.92));
}

.coop-progress-fill--danger {
  background: linear-gradient(135deg, rgba(235, 109, 109, 0.92), rgba(244, 150, 150, 0.92));
}

.coop-progress-fill--muted {
  background: linear-gradient(135deg, rgba(126, 148, 168, 0.82), rgba(170, 184, 198, 0.88));
}

.coop-progress-sub {
  color: var(--admin-text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.coop-card-side {
  display: grid;
  justify-items: end;
  gap: 10px;
  min-width: 84px;
}

.coop-side-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.coop-icon-action.el-button,
.coop-icon-action {
  width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0 !important;
  border-radius: 50% !important;
  justify-content: center;
  box-shadow: none !important;
  border-width: 1px !important;
  font-size: 16px;
}

.coop-icon-action--primary.el-button {
  color: #ffffff !important;
  border-color: transparent !important;
  background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-secondary) 100%) !important;
}

.coop-icon-action--danger.el-button,
.coop-icon-action--danger.el-button:hover {
  color: var(--admin-danger) !important;
  border-color: rgba(235, 109, 109, 0.18) !important;
  background: rgba(235, 109, 109, 0.08) !important;
}

.coop-icon-action--muted {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(144, 177, 203, 0.18);
  background: rgba(17, 32, 51, 0.05);
  color: var(--admin-text-soft);
}

.coop-side-caption {
  max-width: 112px;
  color: var(--admin-text-soft);
  font-size: 12px;
  font-weight: 700;
  text-align: right;
  line-height: 1.5;
}

@media (max-width: 1180px) {
  .coop-card {
    grid-template-columns: minmax(0, 1fr) minmax(220px, 1fr);
  }

  .coop-card-side {
    grid-column: 2;
  }
}

@media (max-width: 960px) {
  .cooperation-filters {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .cooperation-panel :deep(.el-card__body) {
    padding: 14px;
  }

  .coop-card {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 18px;
  }

  .coop-card-side {
    justify-items: start;
    min-width: 0;
  }

  .coop-side-actions {
    justify-content: flex-start;
  }

  .coop-side-caption {
    max-width: none;
    text-align: left;
  }

  .coop-title {
    font-size: 20px;
  }

  .coop-amount {
    font-size: 24px;
  }
}
</style>

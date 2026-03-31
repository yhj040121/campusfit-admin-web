<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">活动管理</div>
        <h1 class="hero-main-title">维护活动中心、首页推荐和发布页可选活动，让管理端跟上你现在 app 的玩法。</h1>
        <p class="hero-copy">这里的活动数据会同步到移动端活动中心、推荐位和发布页。状态、可选性和时间字段都按当前后端结构做了兼容，避免新旧文案切换后显示失真。</p>
        <div class="hero-badge-list">
          <span>前台可见 {{ activeCount }}</span>
          <span>首页推荐 {{ featuredCount }}</span>
          <span>内容数 {{ totalEntries }}</span>
          <span>发布可选 {{ publishSelectableCount }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">活动总数</div>
        <div class="overview-value">{{ activities.length }}</div>
        <div class="overview-copy">后台当前维护的活动条数。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">前台可见</div>
        <div class="overview-value">{{ activeCount }}</div>
        <div class="overview-copy">仍在活动中心和推荐位露出的活动。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">首页推荐</div>
        <div class="overview-value">{{ featuredCount }}</div>
        <div class="overview-copy">会进入首页推荐模块的活动数量。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">活动内容数</div>
        <div class="overview-value">{{ totalEntries }}</div>
        <div class="overview-copy">已关联到活动话题的内容总量。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">活动列表</div>
          <div class="table-subtitle">时间、热度、发布页可选活动和推荐位都从这里统一维护，适配当前 app 的活动中心展示逻辑。</div>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索活动 / 场景 / 标签"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部活动" value="all" />
            <el-option label="前台可见" value="active" />
            <el-option label="未展示" value="inactive" />
            <el-option label="首页推荐" value="featured" />
            <el-option label="发布可选" value="publish" />
          </el-select>
          <el-button type="primary" @click="openCreateDialog">新建活动</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card ops-list-panel">
        <div v-if="filteredActivities.length" class="ops-card-list">
          <article
            v-for="row in filteredActivities"
            :key="row.id"
            class="ops-card ops-card--split activity-card"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("ACT", row.id) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.title || "未命名活动" }}</div>
                <span class="ops-pill" :class="`ops-pill--${resolveActivityTone(row)}`">
                  {{ row.statusText || "状态未知" }}
                </span>
              </div>
              <div class="ops-card-summary">
                {{ row.summary || row.theme || "统一维护活动文案、推荐位与发布页可选状态。" }}
              </div>
              <div class="ops-meta-row">
                <span class="ops-meta-block">
                  <span class="ops-meta-label">场景</span>
                  <span class="ops-meta-value">{{ row.scene || "-" }}</span>
                </span>
                <span class="ops-meta-sep" />
                <span class="ops-meta-block">
                  <span class="ops-meta-label">时间文案</span>
                  <span class="ops-meta-value">{{ row.period || "-" }}</span>
                </span>
              </div>
              <div class="ops-chip-row">
                <span class="ops-pill" :class="row.featured ? 'ops-pill--warning' : 'ops-pill--muted'">
                  {{ row.featured ? "首页推荐" : "普通位" }}
                </span>
                <span class="ops-pill" :class="row.publishSelectable ? 'ops-pill--success' : 'ops-pill--muted'">
                  {{ row.publishSelectable ? "发布可选" : "发布关闭" }}
                </span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">活动表现</div>
              <div class="ops-metric-grid">
                <div class="ops-metric-card">
                  <div class="ops-metric-label">内容数</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.entries || 0 }}</div>
                </div>
                <div class="ops-metric-card">
                  <div class="ops-metric-label">热度</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.heat || 0 }}</div>
                </div>
                <div class="ops-metric-card">
                  <div class="ops-metric-label">排序</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.sortOrder || 0 }}</div>
                </div>
                <div class="ops-metric-card ops-metric-card--highlight">
                  <div class="ops-metric-label">时间窗口</div>
                  <div class="activity-card-window">{{ resolveActivityWindow(row) }}</div>
                </div>
              </div>
            </div>

            <div class="ops-card-side">
              <div class="ops-card-actions">
                <el-button @click="openEditDialog(row)">编辑</el-button>
                <el-button
                  v-if="!row.active"
                  type="success"
                  :loading="actionKey === `start-${row.id}`"
                  @click="toggleActivity(row, true)"
                >
                  发起
                </el-button>
                <el-button
                  v-else
                  type="warning"
                  :loading="actionKey === `stop-${row.id}`"
                  @click="toggleActivity(row, false)"
                >
                  终止
                </el-button>
              </div>
              <div class="ops-card-caption">{{ resolveActivityCaption(row) }}</div>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有符合筛选条件的活动" />
      </el-card>
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'edit' ? '编辑活动' : '新建活动'" width="820px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="dialog-form">
        <div class="dialog-grid">
          <el-form-item label="活动标题" prop="title">
            <el-input v-model="form.title" maxlength="120" show-word-limit />
          </el-form-item>
          <el-form-item label="活动标签">
            <el-input v-model="form.badgeLabel" maxlength="50" placeholder="例如：热门活动" />
          </el-form-item>
          <el-form-item label="活动场景" prop="sceneLabel">
            <el-input v-model="form.sceneLabel" maxlength="50" placeholder="例如：图书馆" />
          </el-form-item>
          <el-form-item label="时间文案" prop="periodText">
            <el-input v-model="form.periodText" maxlength="50" placeholder="例如：03.25 - 04.10" />
          </el-form-item>
          <el-form-item label="活动状态">
            <el-select v-model="form.statusCode" style="width: 100%;">
              <el-option label="进行中" value="ONGOING" />
              <el-option label="招募中" value="RECRUITING" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="可选"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="可选"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="前台可见">
            <el-switch v-model="form.status" inline-prompt active-text="显示" inactive-text="隐藏" />
          </el-form-item>
          <el-form-item label="首页推荐">
            <el-switch v-model="form.featuredFlag" inline-prompt active-text="推荐" inactive-text="普通" />
          </el-form-item>
          <el-form-item label="发布页可选">
            <el-switch v-model="form.publishSelectableFlag" inline-prompt active-text="可选" inactive-text="不可选" />
          </el-form-item>
          <el-form-item label="热度值">
            <el-input-number v-model="form.heatValue" :min="0" :step="10" />
          </el-form-item>
          <el-form-item label="排序值">
            <el-input-number v-model="form.sortOrder" :min="0" :step="1" />
          </el-form-item>
          <el-form-item label="主题说明" prop="themeDesc" class="span-2">
            <el-input v-model="form.themeDesc" type="textarea" :rows="3" maxlength="255" show-word-limit />
          </el-form-item>
          <el-form-item label="摘要" prop="summaryDesc" class="span-2">
            <el-input v-model="form.summaryDesc" type="textarea" :rows="3" maxlength="255" show-word-limit />
          </el-form-item>
          <el-form-item label="奖励说明" prop="rewardDesc" class="span-2">
            <el-input v-model="form.rewardDesc" type="textarea" :rows="3" maxlength="255" show-word-limit />
          </el-form-item>
          <el-form-item label="参与说明" prop="participationDesc" class="span-2">
            <el-input v-model="form.participationDesc" type="textarea" :rows="3" maxlength="255" show-word-limit />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createAdminActivity,
  getAdminActivities,
  startAdminActivity,
  stopAdminActivity,
  updateAdminActivity
} from "../api/admin";
import { formatAdminCode, matchesKeyword, normalizeDateTimeValue, resolveActivityStatusType } from "../utils/adminUi";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref("create");
const actionKey = ref("");
const editingId = ref(null);
const activities = ref([]);
const formRef = ref(null);
const keyword = ref("");
const statusFilter = ref("all");

const form = reactive(defaultForm());

const rules = {
  title: [{ required: true, message: "请输入活动标题", trigger: "blur" }],
  sceneLabel: [{ required: true, message: "请输入活动场景", trigger: "blur" }],
  periodText: [{ required: true, message: "请输入活动时间文案", trigger: "blur" }],
  themeDesc: [{ required: true, message: "请输入主题说明", trigger: "blur" }],
  summaryDesc: [{ required: true, message: "请输入活动摘要", trigger: "blur" }],
  rewardDesc: [{ required: true, message: "请输入奖励说明", trigger: "blur" }],
  participationDesc: [{ required: true, message: "请输入参与说明", trigger: "blur" }]
};

const activeCount = computed(() => activities.value.filter((item) => item.active).length);
const featuredCount = computed(() => activities.value.filter((item) => item.featured).length);
const totalEntries = computed(() => activities.value.reduce((sum, item) => sum + Number(item.entries || 0), 0));
const publishSelectableCount = computed(() => activities.value.filter((item) => item.publishSelectable).length);
const filteredActivities = computed(() => activities.value.filter((item) => {
  const matchesText = matchesKeyword(keyword.value, [
    item.id,
    item.title,
    item.badge,
    item.scene,
    item.period,
    item.theme,
    item.summary
  ]);
  const matchesStatus = statusFilter.value === "all"
    || (statusFilter.value === "active" && item.active)
    || (statusFilter.value === "inactive" && !item.active)
    || (statusFilter.value === "featured" && item.featured)
    || (statusFilter.value === "publish" && item.publishSelectable);
  return matchesText && matchesStatus;
}));

function defaultForm() {
  return {
    title: "",
    badgeLabel: "热门活动",
    themeDesc: "",
    summaryDesc: "",
    periodText: "",
    rewardDesc: "",
    participationDesc: "",
    sceneLabel: "",
    statusCode: "ONGOING",
    featuredFlag: false,
    publishSelectableFlag: true,
    heatValue: 0,
    sortOrder: 0,
    status: true,
    startTime: "",
    endTime: ""
  };
}

function resolveActivityTone(row) {
  const type = resolveActivityStatusType(row);
  return type === "info" ? "muted" : type;
}

function resolveActivityWindow(row) {
  if (row?.startTime && row?.endTime) {
    return `${row.startTime} - ${row.endTime}`;
  }
  if (row?.startTime) {
    return `开始于 ${row.startTime}`;
  }
  if (row?.endTime) {
    return `结束于 ${row.endTime}`;
  }
  return "未设置具体时间";
}

function resolveActivityCaption(row) {
  if (!row?.active) {
    return "当前不在前台露出，可继续编辑后重新发起。";
  }
  if (row?.featured) {
    return "活动正在首页推荐与活动中心同步露出。";
  }
  return "活动正在前台露出，可继续积累内容热度。";
}

function resetForm() {
  Object.assign(form, defaultForm());
  editingId.value = null;
  formRef.value?.clearValidate?.();
}

function applyRowToForm(row) {
  Object.assign(form, {
    title: row.title || "",
    badgeLabel: row.badge || "热门活动",
    themeDesc: row.theme || "",
    summaryDesc: row.summary || "",
    periodText: row.period || "",
    rewardDesc: row.reward || "",
    participationDesc: row.participation || "",
    sceneLabel: row.scene || "",
    statusCode: row.statusCode || "ONGOING",
    featuredFlag: !!row.featured,
    publishSelectableFlag: row.publishSelectable !== false,
    heatValue: Number(row.heat || 0),
    sortOrder: Number(row.sortOrder || 0),
    status: !!row.active,
    startTime: normalizeDateTimeValue(row.startTime),
    endTime: normalizeDateTimeValue(row.endTime)
  });
}

function toPayload() {
  return {
    title: form.title.trim(),
    badgeLabel: (form.badgeLabel || "").trim(),
    themeDesc: form.themeDesc.trim(),
    summaryDesc: form.summaryDesc.trim(),
    periodText: form.periodText.trim(),
    rewardDesc: form.rewardDesc.trim(),
    participationDesc: form.participationDesc.trim(),
    sceneLabel: form.sceneLabel.trim(),
    statusCode: form.statusCode || "ONGOING",
    featuredFlag: form.featuredFlag ? 1 : 0,
    publishSelectableFlag: form.publishSelectableFlag ? 1 : 0,
    heatValue: Number(form.heatValue || 0),
    sortOrder: Number(form.sortOrder || 0),
    status: form.status ? 1 : 0,
    startTime: form.startTime || "",
    endTime: form.endTime || ""
  };
}

async function loadActivities() {
  loading.value = true;
  try {
    activities.value = await getAdminActivities();
  } catch (error) {
    ElMessage.error(error.message || "加载活动列表失败");
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  dialogMode.value = "create";
  resetForm();
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogMode.value = "edit";
  resetForm();
  editingId.value = row.id;
  applyRowToForm(row);
  dialogVisible.value = true;
}

async function submitForm() {
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }
  saving.value = true;
  try {
    const payload = toPayload();
    if (dialogMode.value === "edit" && editingId.value) {
      await updateAdminActivity(editingId.value, payload);
      ElMessage.success("活动已更新");
    } else {
      await createAdminActivity(payload);
      ElMessage.success("活动已创建");
    }
    dialogVisible.value = false;
    await loadActivities();
  } catch (error) {
    ElMessage.error(error.message || "活动保存失败");
  } finally {
    saving.value = false;
  }
}

async function toggleActivity(row, enabled) {
  const action = enabled ? "发起" : "终止";
  try {
    await ElMessageBox.confirm(`确认${action}活动“${row.title}”吗？`, "活动确认", {
      type: enabled ? "success" : "warning",
      confirmButtonText: `确认${action}`,
      cancelButtonText: "取消"
    });
    actionKey.value = `${enabled ? "start" : "stop"}-${row.id}`;
    if (enabled) {
      await startAdminActivity(row.id);
    } else {
      await stopAdminActivity(row.id);
    }
    ElMessage.success(`活动已${action}`);
    await loadActivities();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "活动状态更新失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadActivities);
</script>

<style scoped>
.activity-card {
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr) auto;
}

.activity-card-window {
  margin-top: 8px;
  color: var(--admin-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .activity-card {
    grid-template-columns: 1fr;
  }
}
</style>

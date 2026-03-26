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
        <el-space>
          <el-button type="primary" @click="openCreateDialog">新建活动</el-button>
        </el-space>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="activities" stripe>
          <el-table-column prop="title" label="活动标题" min-width="210" />
          <el-table-column prop="scene" label="场景" width="120" />
          <el-table-column prop="period" label="时间文案" width="160" />
          <el-table-column prop="statusText" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="resolveActivityStatusType(row)">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="featured" label="推荐" width="100">
            <template #default="{ row }">
              <el-tag :type="row.featured ? 'warning' : 'info'">{{ row.featured ? "首页推荐" : "普通" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publishSelectable" label="发布可选" width="110">
            <template #default="{ row }">
              <el-tag :type="row.publishSelectable ? 'success' : 'info'">{{ row.publishSelectable ? "可选" : "不可选" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="entries" label="内容数" width="90" />
          <el-table-column prop="heat" label="热度" width="90" />
          <el-table-column prop="sortOrder" label="排序" width="90" />
          <el-table-column prop="startTime" label="开始时间" width="170" />
          <el-table-column prop="endTime" label="结束时间" width="170" />
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
                <el-button
                  v-if="!row.active"
                  size="small"
                  type="success"
                  :loading="actionKey === `start-${row.id}`"
                  @click="toggleActivity(row, true)"
                >
                  发起
                </el-button>
                <el-button
                  v-else
                  size="small"
                  type="warning"
                  :loading="actionKey === `stop-${row.id}`"
                  @click="toggleActivity(row, false)"
                >
                  终止
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
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
import { normalizeDateTimeValue, resolveActivityStatusType } from "../utils/adminUi";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref("create");
const actionKey = ref("");
const editingId = ref(null);
const activities = ref([]);
const formRef = ref(null);

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

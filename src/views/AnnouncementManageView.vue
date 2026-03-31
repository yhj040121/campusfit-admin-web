<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">官方公告</div>
        <h1 class="hero-main-title">把首页公告、发布时间和置顶优先级拉到和 app 同一条内容节奏里。</h1>
        <p class="hero-copy">公告上架后会直接影响移动端公告中心和首页提示位，所以这里除了发布动作，也要一起看生效时间、结束时间和置顶顺序。</p>
        <div class="hero-badge-list">
          <span>在线 {{ activeCount }}</span>
          <span>置顶 {{ pinnedCount }}</span>
          <span>总数 {{ announcements.length }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">公告总数</div>
        <div class="overview-value">{{ announcements.length }}</div>
        <div class="overview-copy">后台当前维护的公告条数。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">在线公告</div>
        <div class="overview-value">{{ activeCount }}</div>
        <div class="overview-copy">当前仍会在前台展示的公告。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">置顶公告</div>
        <div class="overview-value">{{ pinnedCount }}</div>
        <div class="overview-copy">优先展示在公告入口前列的内容。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">未上架</div>
        <div class="overview-value">{{ announcements.length - activeCount }}</div>
        <div class="overview-copy">仍在草稿或暂停中的公告。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">公告列表</div>
          <div class="table-subtitle">发布状态会同步影响当前 app 的公告页和首页提示位，时间字段按当前后端格式做了兜底兼容。</div>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索公告 / 标签 / 摘要"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部公告" value="all" />
            <el-option label="在线公告" value="online" />
            <el-option label="未上线" value="offline" />
            <el-option label="置顶优先" value="pinned" />
          </el-select>
          <el-button type="primary" @click="openCreateDialog">发布公告</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card ops-list-panel">
        <div v-if="filteredAnnouncements.length" class="ops-card-list">
          <article
            v-for="row in filteredAnnouncements"
            :key="row.id"
            class="ops-card ops-card--split announcement-card"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("ANN", row.id) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.title || "未命名公告" }}</div>
                <span class="ops-pill" :class="row.statusCode === 1 ? 'ops-pill--success' : 'ops-pill--muted'">
                  {{ row.statusText || "未上线" }}
                </span>
              </div>
              <div class="ops-card-summary">{{ row.summary || "公告摘要缺失，请补充说明。" }}</div>
              <div class="ops-chip-row">
                <span class="ops-pill" :class="row.pinned ? 'ops-pill--warning' : 'ops-pill--info'">
                  {{ row.badge || "官方公告" }}
                </span>
                <span class="ops-pill" :class="row.pinned ? 'ops-pill--warning' : 'ops-pill--muted'">
                  {{ row.pinned ? "置顶优先" : "普通优先级" }}
                </span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">时间与优先级</div>
              <div class="ops-metric-grid">
                <div class="ops-metric-card">
                  <div class="ops-metric-label">排序</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.sortOrder || 0 }}</div>
                </div>
                <div class="ops-metric-card ops-metric-card--highlight">
                  <div class="ops-metric-label">摘要长度</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ (row.summary || "").length }}</div>
                </div>
              </div>
              <div class="ops-note">发布时间：{{ row.publishTime || "立即生效" }}</div>
              <div class="ops-note">结束时间：{{ row.expireTime || "长期有效" }}</div>
            </div>

            <div class="ops-card-side">
              <div class="ops-card-actions">
                <el-button @click="openEditDialog(row)">编辑</el-button>
                <el-button
                  v-if="row.statusCode !== 1"
                  type="success"
                  :loading="actionKey === `enable-${row.id}`"
                  @click="toggleAnnouncement(row, true)"
                >
                  上线
                </el-button>
                <el-button
                  v-else
                  type="warning"
                  :loading="actionKey === `disable-${row.id}`"
                  @click="toggleAnnouncement(row, false)"
                >
                  下线
                </el-button>
              </div>
              <div class="ops-card-caption">{{ resolveAnnouncementCaption(row) }}</div>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有符合筛选条件的公告" />
      </el-card>
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'edit' ? '编辑公告' : '发布公告'" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="dialog-form">
        <div class="dialog-grid">
          <el-form-item label="公告标题" prop="title">
            <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="例如：平台内容审核说明更新" />
          </el-form-item>
          <el-form-item label="标签" prop="badgeLabel">
            <el-input v-model="form.badgeLabel" maxlength="30" placeholder="例如：官方公告" />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="form.publishTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="不填则默认立即生效"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="form.expireTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="可选"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="公告摘要" prop="summary" class="span-2">
            <el-input v-model="form.summary" type="textarea" :rows="3" maxlength="255" show-word-limit />
          </el-form-item>
          <el-form-item label="公告正文" class="span-2">
            <el-input v-model="form.content" type="textarea" :rows="5" maxlength="5000" show-word-limit />
          </el-form-item>
        </div>

        <div class="dialog-switches">
          <el-form-item label="前台显示">
            <el-switch v-model="form.status" inline-prompt active-text="上线" inactive-text="下线" />
          </el-form-item>
          <el-form-item label="置顶优先">
            <el-switch v-model="form.pinnedFlag" inline-prompt active-text="置顶" inactive-text="普通" />
          </el-form-item>
          <el-form-item label="排序值">
            <el-input-number v-model="form.sortOrder" :min="0" :step="1" />
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
  createAdminAnnouncement,
  disableAdminAnnouncement,
  enableAdminAnnouncement,
  getAdminAnnouncements,
  updateAdminAnnouncement
} from "../api/admin";
import { formatAdminCode, matchesKeyword, normalizeDateTimeValue } from "../utils/adminUi";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref("create");
const actionKey = ref("");
const editingId = ref(null);
const announcements = ref([]);
const formRef = ref(null);
const keyword = ref("");
const statusFilter = ref("all");

const form = reactive(defaultForm());

const rules = {
  title: [{ required: true, message: "请输入公告标题", trigger: "blur" }],
  summary: [{ required: true, message: "请输入公告摘要", trigger: "blur" }]
};

const activeCount = computed(() => announcements.value.filter((item) => item.statusCode === 1).length);
const pinnedCount = computed(() => announcements.value.filter((item) => item.pinned).length);
const filteredAnnouncements = computed(() => announcements.value.filter((item) => {
  const matchesText = matchesKeyword(keyword.value, [
    item.id,
    item.title,
    item.badge,
    item.summary,
    item.content
  ]);
  const matchesStatus = statusFilter.value === "all"
    || (statusFilter.value === "online" && item.statusCode === 1)
    || (statusFilter.value === "offline" && item.statusCode !== 1)
    || (statusFilter.value === "pinned" && item.pinned);
  return matchesText && matchesStatus;
}));

function defaultForm() {
  return {
    title: "",
    badgeLabel: "官方公告",
    summary: "",
    content: "",
    publishTime: "",
    expireTime: "",
    status: true,
    pinnedFlag: false,
    sortOrder: 0
  };
}

function resolveAnnouncementCaption(row) {
  if (row?.statusCode !== 1) {
    return "当前未在前台展示，可继续补充内容后上线。";
  }
  if (row?.pinned) {
    return "公告已上线且置顶，会优先展示在公告入口前列。";
  }
  return "公告已上线，会按照当前排序参与前台展示。";
}

function resetForm() {
  Object.assign(form, defaultForm());
  editingId.value = null;
  formRef.value?.clearValidate?.();
}

function applyRowToForm(row) {
  Object.assign(form, {
    title: row.title || "",
    badgeLabel: row.badge || "官方公告",
    summary: row.summary || "",
    content: row.content || "",
    publishTime: normalizeDateTimeValue(row.publishTime),
    expireTime: normalizeDateTimeValue(row.expireTime),
    status: row.statusCode === 1,
    pinnedFlag: !!row.pinned,
    sortOrder: Number(row.sortOrder || 0)
  });
}

function toPayload() {
  return {
    title: form.title.trim(),
    badgeLabel: (form.badgeLabel || "").trim(),
    summary: form.summary.trim(),
    content: (form.content || "").trim(),
    publishTime: form.publishTime || "",
    expireTime: form.expireTime || "",
    status: form.status ? 1 : 0,
    pinnedFlag: form.pinnedFlag ? 1 : 0,
    sortOrder: Number(form.sortOrder || 0)
  };
}

async function loadAnnouncements() {
  loading.value = true;
  try {
    announcements.value = await getAdminAnnouncements();
  } catch (error) {
    ElMessage.error(error.message || "加载公告列表失败");
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
      await updateAdminAnnouncement(editingId.value, payload);
      ElMessage.success("公告已更新");
    } else {
      await createAdminAnnouncement(payload);
      ElMessage.success("公告已发布");
    }
    dialogVisible.value = false;
    await loadAnnouncements();
  } catch (error) {
    ElMessage.error(error.message || "公告保存失败");
  } finally {
    saving.value = false;
  }
}

async function toggleAnnouncement(row, enabled) {
  const action = enabled ? "上线" : "下线";
  try {
    await ElMessageBox.confirm(`确认${action}公告“${row.title}”吗？`, "公告确认", {
      type: enabled ? "success" : "warning",
      confirmButtonText: `确认${action}`,
      cancelButtonText: "取消"
    });
    actionKey.value = `${enabled ? "enable" : "disable"}-${row.id}`;
    if (enabled) {
      await enableAdminAnnouncement(row.id);
    } else {
      await disableAdminAnnouncement(row.id);
    }
    ElMessage.success(`公告已${action}`);
    await loadAnnouncements();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "公告状态更新失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadAnnouncements);
</script>

<style scoped>
.announcement-card {
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.95fr) auto;
}

@media (max-width: 1180px) {
  .announcement-card {
    grid-template-columns: 1fr;
  }
}
</style>

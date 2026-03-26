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
        <el-space>
          <el-button type="primary" @click="openCreateDialog">发布公告</el-button>
        </el-space>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="announcements" stripe>
          <el-table-column prop="title" label="公告标题" min-width="220" />
          <el-table-column prop="badge" label="标签" width="120">
            <template #default="{ row }">
              <el-tag :type="row.pinned ? 'warning' : 'info'">{{ row.badge }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="summary" label="摘要" min-width="280" show-overflow-tooltip />
          <el-table-column prop="publishTime" label="发布时间" width="170" />
          <el-table-column prop="expireTime" label="结束时间" width="170" />
          <el-table-column prop="sortOrder" label="排序" width="90" />
          <el-table-column prop="statusText" label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="row.statusCode === 1 ? 'success' : 'info'">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
                <el-button
                  v-if="row.statusCode !== 1"
                  size="small"
                  type="success"
                  :loading="actionKey === `enable-${row.id}`"
                  @click="toggleAnnouncement(row, true)"
                >
                  上线
                </el-button>
                <el-button
                  v-else
                  size="small"
                  type="warning"
                  :loading="actionKey === `disable-${row.id}`"
                  @click="toggleAnnouncement(row, false)"
                >
                  下线
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
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
import { normalizeDateTimeValue } from "../utils/adminUi";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref("create");
const actionKey = ref("");
const editingId = ref(null);
const announcements = ref([]);
const formRef = ref(null);

const form = reactive(defaultForm());

const rules = {
  title: [{ required: true, message: "请输入公告标题", trigger: "blur" }],
  summary: [{ required: true, message: "请输入公告摘要", trigger: "blur" }]
};

const activeCount = computed(() => announcements.value.filter((item) => item.statusCode === 1).length);
const pinnedCount = computed(() => announcements.value.filter((item) => item.pinned).length);

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

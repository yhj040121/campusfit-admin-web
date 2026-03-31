<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">用户运营</div>
        <h1 class="hero-main-title">跟踪账号状态、学校身份和内容活跃度，保证社区秩序与内容质量同步稳定。</h1>
        <p class="hero-copy">用户状态调整会直接影响 app 前台的发布、互动和导购链路，这里把账号信息、内容活跃和收藏行为收进同一张运营视图里，方便快速判断异常账号。</p>
        <div class="hero-badge-list">
          <span>正常 {{ activeCount }}</span>
          <span>冻结 {{ frozenCount }}</span>
          <span>累计发布 {{ totalPosts }}</span>
          <span>累计收藏 {{ totalFavorites }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">当前用户数</div>
        <div class="overview-value">{{ users.length }}</div>
        <div class="overview-copy">管理端当前同步到的账号总量。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">正常账号</div>
        <div class="overview-value">{{ activeCount }}</div>
        <div class="overview-copy">可正常发布、互动和跳转导购链路的用户。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">冻结账号</div>
        <div class="overview-value">{{ frozenCount }}</div>
        <div class="overview-copy">需要进一步复查后再恢复权限的账号。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">累计发布</div>
        <div class="overview-value">{{ totalPosts }}</div>
        <div class="overview-copy">当前用户累计发布的内容总量，用来辅助判断活跃度。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">用户列表</div>
          <div class="table-subtitle">查看用户账号状态、学校信息与内容活跃度，必要时直接冻结或恢复账号。</div>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索昵称 / 学校 / 用户 ID"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="正常账号" value="active" />
            <el-option label="冻结账号" value="frozen" />
          </el-select>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card ops-list-panel">
        <div v-if="filteredUsers.length" class="ops-card-list">
          <article
            v-for="row in filteredUsers"
            :key="row.userId"
            class="ops-card ops-card--split user-card"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("USR", row.userId) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.nickname || "未命名用户" }}</div>
                <span class="ops-pill" :class="`ops-pill--${statusTone(row.statusCode)}`">
                  {{ row.status || "状态未知" }}
                </span>
              </div>
              <div class="ops-card-summary">{{ row.school || "暂未完善学校与年级信息" }}</div>
              <div class="ops-meta-row">
                <span class="ops-meta-block">
                  <span class="ops-meta-label">账号活跃度</span>
                  <span class="ops-meta-value">
                    {{ Number(row.posts || 0) + Number(row.favorites || 0) > 0 ? "已有内容互动" : "暂无内容互动" }}
                  </span>
                </span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">互动表现</div>
              <div class="ops-metric-grid">
                <div class="ops-metric-card">
                  <div class="ops-metric-label">发布数</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.posts || 0 }}</div>
                </div>
                <div class="ops-metric-card">
                  <div class="ops-metric-label">收藏数</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.favorites || 0 }}</div>
                </div>
              </div>
            </div>

            <div class="ops-card-side">
              <div class="ops-card-actions">
                <el-button
                  :type="row.statusCode === 1 ? 'danger' : 'success'"
                  :loading="actionKey === `user-${row.userId}`"
                  @click="handleUserAction(row)"
                >
                  {{ row.statusCode === 1 ? "冻结" : "恢复" }}
                </el-button>
              </div>
              <div class="ops-card-caption">
                {{ row.statusCode === 1 ? "冻结后会影响前台发布、互动和导购链路。" : "恢复后会重新开放前台互动与发布权限。" }}
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有符合筛选条件的用户" />
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { freezeAdminUser, getAdminUsers, unfreezeAdminUser } from "../api/admin";
import { formatAdminCode, matchesKeyword } from "../utils/adminUi";

const loading = ref(false);
const users = ref([]);
const actionKey = ref("");
const keyword = ref("");
const statusFilter = ref("all");

const activeCount = computed(() => users.value.filter((item) => item.statusCode === 1).length);
const frozenCount = computed(() => users.value.filter((item) => item.statusCode !== 1).length);
const totalPosts = computed(() => users.value.reduce((sum, item) => sum + Number(item.posts || 0), 0));
const totalFavorites = computed(() => users.value.reduce((sum, item) => sum + Number(item.favorites || 0), 0));
const filteredUsers = computed(() => users.value.filter((item) => {
  const matchesText = matchesKeyword(keyword.value, [
    item.userId,
    item.nickname,
    item.school,
    item.status
  ]);
  const matchesStatus = statusFilter.value === "all"
    || (statusFilter.value === "active" && item.statusCode === 1)
    || (statusFilter.value === "frozen" && item.statusCode !== 1);
  return matchesText && matchesStatus;
}));

function statusTone(statusCode) {
  return statusCode === 1 ? "success" : "danger";
}

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await getAdminUsers();
  } catch (error) {
    ElMessage.error(error.message || "加载用户列表失败");
  } finally {
    loading.value = false;
  }
}

async function handleUserAction(row) {
  const shouldFreeze = row.statusCode === 1;
  const actionLabel = shouldFreeze ? "冻结" : "恢复";
  try {
    await ElMessageBox.confirm(`确认${actionLabel}用户“${row.nickname}”吗？`, "操作确认", {
      type: "warning",
      confirmButtonText: `确认${actionLabel}`,
      cancelButtonText: "取消"
    });
    actionKey.value = `user-${row.userId}`;
    if (shouldFreeze) {
      await freezeAdminUser(row.userId);
      ElMessage.success(`已冻结用户“${row.nickname}”`);
    } else {
      await unfreezeAdminUser(row.userId);
      ElMessage.success(`已恢复用户“${row.nickname}”`);
    }
    await loadUsers();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "用户状态更新失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadUsers);
</script>

<style scoped>
.user-card {
  grid-template-columns: minmax(0, 1.45fr) minmax(240px, 0.8fr) auto;
}

@media (max-width: 1180px) {
  .user-card {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">用户运营</div>
        <h1 class="hero-main-title">跟踪账号状态、校园身份和内容活跃度，保证社区秩序与内容质量同步稳定。</h1>
        <p class="hero-copy">用户状态调整会直接影响 app 前台的发布、互动和导购链路，这里把账号信息、内容活跃和收藏行为放进同一张运营视图里，方便快速判断异常账号。</p>
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
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="users" stripe>
          <el-table-column prop="userId" label="用户 ID" width="90" />
          <el-table-column prop="nickname" label="昵称" width="140" />
          <el-table-column prop="school" label="学校 / 年级" min-width="240" show-overflow-tooltip />
          <el-table-column prop="posts" label="发布数" width="100" />
          <el-table-column prop="favorites" label="收藏数" width="100" />
          <el-table-column prop="status" label="账号状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.statusCode)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                :type="row.statusCode === 1 ? 'danger' : 'success'"
                :loading="actionKey === `user-${row.userId}`"
                @click="handleUserAction(row)"
              >
                {{ row.statusCode === 1 ? "冻结" : "恢复" }}
              </el-button>
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
import { freezeAdminUser, getAdminUsers, unfreezeAdminUser } from "../api/admin";

const loading = ref(false);
const users = ref([]);
const actionKey = ref("");
const activeCount = computed(() => users.value.filter((item) => item.statusCode === 1).length);
const frozenCount = computed(() => users.value.filter((item) => item.statusCode !== 1).length);
const totalPosts = computed(() => users.value.reduce((sum, item) => sum + Number(item.posts || 0), 0));
const totalFavorites = computed(() => users.value.reduce((sum, item) => sum + Number(item.favorites || 0), 0));

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

function statusType(statusCode) {
  return statusCode === 1 ? "success" : "danger";
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

<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">用户运营</div>
        <h1 class="hero-main-title">用户管理与账号状态总览</h1>
        <p class="hero-copy">从校园身份、内容产出和收藏活跃度三个维度快速判断账号质量，在异常情况下及时冻结或恢复用户状态。</p>
        <div class="hero-badge-list">
          <span>账号状态</span>
          <span>内容活跃</span>
          <span>收藏行为</span>
        </div>
      </article>

      <div class="hero-side-stack">
        <article class="info-card">
          <div class="info-card-title">当前同步状态</div>
          <p class="muted-copy">{{ statusText }}</p>
        </article>
        <article class="info-card">
          <div class="info-card-title">运营提醒</div>
          <ul class="bullet-list">
            <li>优先关注高发布但行为异常的账号</li>
            <li>冻结操作适用于违规导流与异常刷量</li>
            <li>恢复账号前建议复核最近互动与内容记录</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">当前用户数</div>
        <div class="overview-value">{{ users.length }}</div>
        <div class="overview-copy">管理端当前同步到的账号总量</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">正常账号</div>
        <div class="overview-value">{{ users.filter((item) => item.statusCode === 1).length }}</div>
        <div class="overview-copy">可正常发布、互动和导购的用户</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">冻结账号</div>
        <div class="overview-value">{{ users.filter((item) => item.statusCode !== 1).length }}</div>
        <div class="overview-copy">需要进一步复查后再恢复权限</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">用户列表</div>
          <div class="table-subtitle">查看用户账号状态、校园信息与内容活跃度。</div>
        </div>
        <el-tag type="info">支持冻结 / 恢复操作</el-tag>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="users" stripe>
          <el-table-column prop="userId" label="用户 ID" width="90" />
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column prop="school" label="学校 / 年级" min-width="220" />
          <el-table-column prop="posts" label="发布数" width="100" />
          <el-table-column prop="favorites" label="收藏数" width="100" />
          <el-table-column prop="status" label="账号状态" width="110">
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
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { freezeAdminUser, getAdminUsers, unfreezeAdminUser } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const users = ref([]);
const statusText = ref("正在同步用户列表...");
const actionKey = ref("");

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await getAdminUsers();
    statusText.value = `已连接后端：${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `用户列表请求失败：${error.message}`;
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

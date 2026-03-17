<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { freezeAdminUser, getAdminUsers, unfreezeAdminUser } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const users = ref([]);
const statusText = ref("Syncing users...");
const actionKey = ref("");

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await getAdminUsers();
    statusText.value = `Connected to backend: ${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `User request failed: ${error.message}`;
    ElMessage.error(error.message || "Failed to load users");
  } finally {
    loading.value = false;
  }
}

function statusType(statusCode) {
  return statusCode === 1 ? "success" : "danger";
}

async function handleUserAction(row) {
  const shouldFreeze = row.statusCode === 1;
  const actionLabel = shouldFreeze ? "freeze" : "reactivate";
  try {
    await ElMessageBox.confirm(
      `Do you want to ${actionLabel} ${row.nickname}?`,
      "Confirm Action",
      { type: "warning" }
    );
    actionKey.value = `user-${row.userId}`;
    if (shouldFreeze) {
      await freezeAdminUser(row.userId);
      ElMessage.success("User frozen");
    } else {
      await unfreezeAdminUser(row.userId);
      ElMessage.success("User reactivated");
    }
    await loadUsers();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "User action failed");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadUsers);
</script>

<template>
  <el-card shadow="never" v-loading="loading">
    <template #header>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>User Management</span>
        <el-tag type="info">{{ statusText }}</el-tag>
      </div>
    </template>
    <el-table :data="users" stripe>
      <el-table-column prop="userId" label="User ID" width="90" />
      <el-table-column prop="nickname" label="Nickname" width="120" />
      <el-table-column prop="school" label="School / Grade" min-width="220" />
      <el-table-column prop="posts" label="Posts" width="100" />
      <el-table-column prop="favorites" label="Favorites" width="100" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.statusCode)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            :type="row.statusCode === 1 ? 'danger' : 'success'"
            :loading="actionKey === `user-${row.userId}`"
            @click="handleUserAction(row)"
          >
            {{ row.statusCode === 1 ? "Freeze" : "Reactivate" }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
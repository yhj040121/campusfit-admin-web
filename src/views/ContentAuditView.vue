<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { approveAdminPost, getAdminContentAudit, rejectAdminPost } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const audits = ref([]);
const statusText = ref("Syncing audit queue...");
const actionKey = ref("");

async function loadAudits() {
  loading.value = true;
  try {
    audits.value = await getAdminContentAudit();
    statusText.value = `Connected to backend: ${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `Audit request failed: ${error.message}`;
    ElMessage.error(error.message || "Failed to load audit data");
  } finally {
    loading.value = false;
  }
}

function auditTagType(statusCode) {
  if (statusCode === 1) return "success";
  if (statusCode === 2) return "danger";
  return "warning";
}

async function handleAuditAction(row, action) {
  const actionLabel = action === "approve" ? "approve" : "reject";
  try {
    await ElMessageBox.confirm(
      `Do you want to ${actionLabel} this post?`,
      "Confirm Action",
      { type: action === "approve" ? "success" : "warning" }
    );
    actionKey.value = `${action}-${row.postId}`;
    if (action === "approve") {
      await approveAdminPost(row.postId);
      ElMessage.success("Post approved");
    } else {
      await rejectAdminPost(row.postId);
      ElMessage.success("Post rejected");
    }
    await loadAudits();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "Audit action failed");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadAudits);
</script>

<template>
  <el-card shadow="never" v-loading="loading">
    <template #header>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>Content Audit</span>
        <el-tag type="info">{{ statusText }}</el-tag>
      </div>
    </template>
    <el-table :data="audits" stripe>
      <el-table-column prop="postId" label="Post ID" width="90" />
      <el-table-column prop="title" label="Title" min-width="240" />
      <el-table-column prop="author" label="Author" width="120" />
      <el-table-column prop="scene" label="Scene" width="120" />
      <el-table-column prop="productStatus" label="Link Status" width="120">
        <template #default="{ row }">
          <el-tag :type="row.productStatus === 'Verified' ? 'success' : 'warning'">{{ row.productStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="auditStatus" label="Audit Status" width="120">
        <template #default="{ row }">
          <el-tag :type="auditTagType(row.auditStatusCode)">{{ row.auditStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="Created At" width="160" />
      <el-table-column label="Actions" width="180" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button
              v-if="row.auditStatusCode !== 1"
              size="small"
              type="success"
              :loading="actionKey === `approve-${row.postId}`"
              @click="handleAuditAction(row, 'approve')"
            >
              Approve
            </el-button>
            <el-button
              v-if="row.auditStatusCode !== 2"
              size="small"
              type="danger"
              :loading="actionKey === `reject-${row.postId}`"
              @click="handleAuditAction(row, 'reject')"
            >
              Reject
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
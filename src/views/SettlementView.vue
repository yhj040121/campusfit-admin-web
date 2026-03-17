<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { confirmAdminSettlement, getAdminSettlements } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const settlements = ref([]);
const statusText = ref("Syncing settlements...");
const actionKey = ref("");

async function loadSettlements() {
  loading.value = true;
  try {
    settlements.value = await getAdminSettlements();
    statusText.value = `Connected to backend: ${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `Settlement request failed: ${error.message}`;
    ElMessage.error(error.message || "Failed to load settlements");
  } finally {
    loading.value = false;
  }
}

function statusType(statusCode) {
  return statusCode === 1 ? "success" : "warning";
}

async function handleSettle(row) {
  try {
    await ElMessageBox.confirm(
      `Confirm settlement for ${row.creator}?`,
      "Confirm Action",
      { type: "warning" }
    );
    actionKey.value = `settle-${row.recordId}`;
    await confirmAdminSettlement(row.recordId);
    ElMessage.success("Settlement confirmed");
    await loadSettlements();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "Settlement action failed");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadSettlements);
</script>

<template>
  <el-card shadow="never" v-loading="loading">
    <template #header>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>Commission Settlements</span>
        <el-tag type="info">{{ statusText }}</el-tag>
      </div>
    </template>
    <el-table :data="settlements" stripe>
      <el-table-column prop="recordId" label="Record ID" width="100" />
      <el-table-column prop="creator" label="Creator" width="120" />
      <el-table-column prop="type" label="Income Type" min-width="160" />
      <el-table-column prop="amount" label="Amount" width="120">
        <template #default="{ row }">USD {{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.statusCode)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="Created At" width="160" />
      <el-table-column label="Actions" width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.statusCode === 0"
            size="small"
            type="primary"
            :loading="actionKey === `settle-${row.recordId}`"
            @click="handleSettle(row)"
          >
            Settle
          </el-button>
          <el-tag v-else type="success">Completed</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
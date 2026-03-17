<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAdminMerchants } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const merchants = ref([]);
const statusText = ref("Syncing merchants...");

async function loadMerchants() {
  loading.value = true;
  try {
    merchants.value = await getAdminMerchants();
    statusText.value = `Connected to backend: ${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `Merchant request failed: ${error.message}`;
    ElMessage.error(error.message || "Failed to load merchants");
  } finally {
    loading.value = false;
  }
}

onMounted(loadMerchants);
</script>

<template>
  <el-card shadow="never" v-loading="loading">
    <template #header>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>Merchant Management</span>
        <el-tag type="info">{{ statusText }}</el-tag>
      </div>
    </template>
    <el-table :data="merchants" stripe>
      <el-table-column prop="merchantId" label="Merchant ID" width="100" />
      <el-table-column prop="name" label="Merchant Name" min-width="220" />
      <el-table-column prop="contact" label="Contact" width="140" />
      <el-table-column prop="campaigns" label="Campaigns" width="120" />
      <el-table-column prop="status" label="Status" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
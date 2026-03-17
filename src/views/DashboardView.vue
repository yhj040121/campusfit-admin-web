<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAdminContentAudit, getDashboardSummary, getAdminSettlements } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const summary = ref({
  todayUsers: 0,
  pendingAudits: 0,
  productClicks: 0,
  estimatedCommission: 0,
  activeCampaigns: 0
});
const audits = ref([]);
const settlements = ref([]);
const statusText = ref("Syncing dashboard data...");

async function loadData() {
  loading.value = true;
  try {
    const [summaryData, auditData, settlementData] = await Promise.all([
      getDashboardSummary(),
      getAdminContentAudit(),
      getAdminSettlements()
    ]);
    summary.value = summaryData;
    audits.value = (auditData || []).slice(0, 4);
    settlements.value = (settlementData || []).slice(0, 4);
    statusText.value = `Connected to backend: ${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `Dashboard request failed: ${error.message}`;
    ElMessage.error(error.message || "Failed to load dashboard data");
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="page-grid">
    <el-alert :title="statusText" type="info" show-icon :closable="false" />

    <el-row :gutter="16" class="section-gap">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="New Users Today" :value="summary.todayUsers" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="Pending Audits" :value="summary.pendingAudits" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="Product Clicks" :value="summary.productClicks" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="Pending Commission" :value="summary.estimatedCommission" prefix="USD " />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="section-gap">
      <el-col :span="14">
        <el-card shadow="never" v-loading="loading">
          <template #header>Content Audit Snapshot</template>
          <el-table :data="audits" stripe>
            <el-table-column prop="title" label="Title" min-width="220" />
            <el-table-column prop="author" label="Author" width="100" />
            <el-table-column prop="scene" label="Scene" width="110" />
            <el-table-column prop="productStatus" label="Link Status" width="120">
              <template #default="{ row }">
                <el-tag>{{ row.productStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="Audit Status" width="120">
              <template #default="{ row }">
                <el-tag type="success">{{ row.auditStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="Created At" width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never" v-loading="loading">
          <template #header>Settlement Timeline</template>
          <el-timeline>
            <el-timeline-item v-for="item in settlements" :key="item.recordId" :timestamp="item.createdAt">
              <div>{{ item.creator }} · {{ item.type }}</div>
              <div style="margin-top:4px; color:#6d8191;">USD {{ item.amount }} · {{ item.status }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
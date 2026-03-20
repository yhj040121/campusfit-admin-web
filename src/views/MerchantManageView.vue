<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">商家合作</div>
        <h1 class="hero-main-title">品牌合作、专题投放与资源位管理</h1>
        <p class="hero-copy">集中查看商家合作状态、联系人和专题投放数量，帮助我们快速判断哪些品牌适合进入前台活动专题与首页推荐位。</p>
        <div class="hero-badge-list">
          <span>合作品牌</span>
          <span>专题数量</span>
          <span>投放状态</span>
        </div>
      </article>

      <div class="hero-side-stack">
        <article class="info-card">
          <div class="info-card-title">当前同步状态</div>
          <p class="muted-copy">{{ statusText }}</p>
        </article>
        <article class="info-card">
          <div class="info-card-title">运营建议</div>
          <ul class="bullet-list">
            <li>优先维护合作中且专题数高的品牌</li>
            <li>意向商家建议尽快补齐联系人与活动计划</li>
            <li>专题数可和前台活动管理联动展示</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">合作商家</div>
        <div class="overview-value">{{ merchants.length }}</div>
        <div class="overview-copy">当前管理端已同步的品牌总量</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">合作中</div>
        <div class="overview-value">{{ merchants.filter((item) => item.status === '合作中').length }}</div>
        <div class="overview-copy">正在进行专题合作与资源投放的品牌</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">专题总数</div>
        <div class="overview-value">{{ merchants.reduce((sum, item) => sum + Number(item.campaigns || 0), 0) }}</div>
        <div class="overview-copy">累计配置的专题活动与合作入口数量</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">商家列表</div>
          <div class="table-subtitle">查看品牌状态、联系人和可投入的专题资源数量。</div>
        </div>
        <el-tag type="success">可与活动管理页联动演示</el-tag>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="merchants" stripe>
          <el-table-column prop="merchantId" label="商家 ID" width="100" />
          <el-table-column prop="name" label="商家名称" min-width="220" />
          <el-table-column prop="contact" label="联系人" width="140" />
          <el-table-column prop="campaigns" label="专题数" width="120" />
          <el-table-column prop="status" label="合作状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAdminMerchants } from "../api/admin";
import { API_BASE_URL } from "../api/http";

const loading = ref(false);
const merchants = ref([]);
const statusText = ref("正在同步商家列表...");

async function loadMerchants() {
  loading.value = true;
  try {
    merchants.value = await getAdminMerchants();
    statusText.value = `已连接后端：${API_BASE_URL}`;
  } catch (error) {
    statusText.value = `商家列表请求失败：${error.message}`;
    ElMessage.error(error.message || "加载商家列表失败");
  } finally {
    loading.value = false;
  }
}

function statusType(status) {
  return status === "合作中" ? "success" : "warning";
}

onMounted(loadMerchants);
</script>

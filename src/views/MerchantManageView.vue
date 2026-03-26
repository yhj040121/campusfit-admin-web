<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">商家合作</div>
        <h1 class="hero-main-title">把品牌合作、专题投放和资源位判断也拉进同一套运营语境里。</h1>
        <p class="hero-copy">商家状态会影响活动专题和资源位安排，这里把状态识别改成了更稳妥的关键词判断，避免你更新了合作文案后管理端颜色判断失真。</p>
        <div class="hero-badge-list">
          <span>合作中 {{ activeMerchantCount }}</span>
          <span>专题总数 {{ totalCampaigns }}</span>
          <span>商家总数 {{ merchants.length }}</span>
        </div>
      </article>
    </section>

    <section class="info-stat-grid">
      <article class="overview-card overview-sky">
        <div class="overview-label">合作商家</div>
        <div class="overview-value">{{ merchants.length }}</div>
        <div class="overview-copy">当前同步到后台的品牌总量。</div>
      </article>
      <article class="overview-card overview-mint">
        <div class="overview-label">合作中</div>
        <div class="overview-value">{{ activeMerchantCount }}</div>
        <div class="overview-copy">仍在投放和专题合作中的品牌。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">专题总数</div>
        <div class="overview-value">{{ totalCampaigns }}</div>
        <div class="overview-copy">累计配置的合作专题与资源位数量。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">暂停 / 其他</div>
        <div class="overview-value">{{ merchants.length - activeMerchantCount }}</div>
        <div class="overview-copy">需要重新跟进的品牌数量。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">商家列表</div>
          <div class="table-subtitle">查看品牌状态、联系人和可投放专题数量，辅助判断是否进入活动专题与推荐位。</div>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card">
        <el-table :data="merchants" stripe>
          <el-table-column prop="merchantId" label="商家 ID" width="100" />
          <el-table-column prop="name" label="商家名称" min-width="220" />
          <el-table-column prop="contact" label="联系人" width="140" />
          <el-table-column prop="campaigns" label="专题数" width="120" />
          <el-table-column prop="status" label="合作状态" width="120">
            <template #default="{ row }">
              <el-tag :type="resolveMerchantStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAdminMerchants } from "../api/admin";
import { resolveMerchantStatusType } from "../utils/adminUi";

const loading = ref(false);
const merchants = ref([]);

const totalCampaigns = computed(() => merchants.value.reduce((sum, item) => sum + Number(item.campaigns || 0), 0));
const activeMerchantCount = computed(() => merchants.value.filter((item) => resolveMerchantStatusType(item.status) === "success").length);

async function loadMerchants() {
  loading.value = true;
  try {
    merchants.value = await getAdminMerchants();
  } catch (error) {
    ElMessage.error(error.message || "加载商家列表失败");
  } finally {
    loading.value = false;
  }
}

onMounted(loadMerchants);
</script>

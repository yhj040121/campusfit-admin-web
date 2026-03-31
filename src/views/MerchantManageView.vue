<template>
  <div class="manage-page">
    <section class="manage-hero">
      <article class="hero-surface">
        <div class="hero-kicker-pill">商家合作</div>
        <h1 class="hero-main-title">把商家状态、合作进度和奖励发放一起拉进同一块运营面板里。</h1>
        <p class="hero-copy">商家管理不再只看联系人和静态资源占位，这里会把合作单体量、待发奖励和已发奖励一起展示，方便快速判断哪个品牌仍在活跃合作、哪个已经进入激励结算阶段。</p>
        <div class="hero-badge-list">
          <span>合作中 {{ activeMerchantCount }}</span>
          <span>合作单 {{ totalCooperations }}</span>
          <span>待发奖励 {{ totalPendingReward }}</span>
          <span>已发奖励 {{ totalIssuedReward }}</span>
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
        <div class="overview-label">合作单总数</div>
        <div class="overview-value">{{ totalCooperations }}</div>
        <div class="overview-copy">已经建立的合作单数量，更直观看出品牌合作活跃度。</div>
      </article>
      <article class="overview-card overview-warm">
        <div class="overview-label">待发奖励</div>
        <div class="overview-value">{{ totalPendingReward }}</div>
        <div class="overview-copy">已经达标、等待后台确认发放的合作奖励。</div>
      </article>
      <article class="overview-card overview-ice">
        <div class="overview-label">已发奖励</div>
        <div class="overview-value">{{ totalIssuedReward }}</div>
        <div class="overview-copy">已经完成发放并继续流向结算与提现链路的奖励总额。</div>
      </article>
    </section>

    <section class="table-shell">
      <div class="table-toolbar">
        <div>
          <div class="table-title">商家列表</div>
          <div class="table-subtitle">查看品牌联系人、合作体量和奖励状态，辅助判断商家是否继续进入合作邀约、内容投放和奖励发放阶段。</div>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索商家 / 联系人 / 电话"
            class="filter-input"
          />
          <el-select v-model="statusFilter" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="合作中" value="active" />
            <el-option label="待沟通" value="pending" />
            <el-option label="可删除" value="deletable" />
          </el-select>
          <el-button type="primary" @click="openCreateDialog">添加商户</el-button>
          <el-button plain @click="goCooperations">查看合作单</el-button>
        </div>
      </div>

      <el-card shadow="never" v-loading="loading" class="manage-card ops-list-panel">
        <div v-if="filteredMerchants.length" class="ops-card-list">
          <article
            v-for="row in filteredMerchants"
            :key="row.merchantId"
            class="ops-card ops-card--split merchant-card"
          >
            <div class="ops-card-main">
              <div class="ops-card-code">{{ formatAdminCode("MER", row.merchantId) }}</div>
              <div class="ops-card-heading">
                <div class="ops-card-title">{{ row.name || "未命名商家" }}</div>
                <span class="ops-pill" :class="`ops-pill--${resolveMerchantStatusTone(row.status)}`">
                  {{ row.status || "待沟通" }}
                </span>
              </div>
              <div class="ops-card-summary">
                {{ row.remark || "查看联系人、合作体量和奖励发放情况，判断商家是否继续进入合作链路。" }}
              </div>
              <div class="ops-meta-row">
                <span class="ops-meta-block">
                  <span class="ops-meta-label">联系人</span>
                  <span class="ops-meta-value">{{ row.contact || "-" }}</span>
                </span>
                <span class="ops-meta-sep" />
                <span class="ops-meta-block">
                  <span class="ops-meta-label">电话</span>
                  <span class="ops-meta-value">{{ row.phone || "-" }}</span>
                </span>
              </div>
            </div>

            <div class="ops-card-stack">
              <div class="ops-section-label">合作概况</div>
              <div class="ops-metric-grid">
                <div class="ops-metric-card">
                  <div class="ops-metric-label">进行中</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.campaigns || 0 }}</div>
                </div>
                <div class="ops-metric-card">
                  <div class="ops-metric-label">合作单</div>
                  <div class="ops-metric-value ops-metric-value--compact">{{ row.cooperations || 0 }}</div>
                </div>
                <div class="ops-metric-card ops-metric-card--highlight">
                  <div class="ops-metric-label">待发奖励</div>
                  <div class="ops-metric-value">{{ formatCurrency(row.pendingRewardAmount) }}</div>
                </div>
                <div class="ops-metric-card">
                  <div class="ops-metric-label">已发奖励</div>
                  <div class="ops-metric-value">{{ formatCurrency(row.issuedRewardAmount) }}</div>
                </div>
              </div>
            </div>

            <div class="ops-card-side">
              <div class="ops-card-actions">
                <el-button
                  v-if="Number(row.statusCode) !== 1"
                  type="primary"
                  :loading="actionKey === `activate-${row.merchantId}`"
                  @click="handleActivate(row)"
                >
                  设为合作中
                </el-button>
                <el-button
                  v-if="row.canDelete"
                  plain
                  type="danger"
                  :loading="actionKey === `delete-${row.merchantId}`"
                  @click="handleDelete(row)"
                >
                  删除商家
                </el-button>
                <span v-else class="ops-pill ops-pill--muted">仍有进行中合作</span>
              </div>
              <div class="ops-card-caption">
                {{ resolveMerchantCaption(row) }}
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有符合筛选条件的商家" />
      </el-card>
    </section>

    <el-dialog v-model="dialogVisible" title="添加商户" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="dialog-form">
        <div class="dialog-grid">
          <el-form-item label="商户名称" prop="merchantName" class="span-2">
            <el-input
              v-model="form.merchantName"
              maxlength="120"
              show-word-limit
              placeholder="例如：青芒服饰"
            />
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="form.contactName" maxlength="50" placeholder="填写对接人姓名" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.contactPhone" maxlength="30" placeholder="填写联系电话" />
          </el-form-item>
          <el-form-item label="合作状态">
            <el-select v-model="form.cooperationStatus" style="width: 100%;">
              <el-option label="意向商家" :value="0" />
              <el-option label="合作中" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" class="span-2">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              maxlength="255"
              show-word-limit
              placeholder="补充品牌背景、主营方向或其他协作说明"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="toolbar-actions">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleCreate">保存商户</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { activateAdminMerchant, createAdminMerchant, deleteAdminMerchant, getAdminMerchants } from "../api/admin";
import { formatAdminCode, formatCurrency, matchesKeyword, resolveMerchantStatusType, toNumber } from "../utils/adminUi";

const router = useRouter();
const loading = ref(false);
const merchants = ref([]);
const formRef = ref(null);
const dialogVisible = ref(false);
const submitting = ref(false);
const actionKey = ref("");
const keyword = ref("");
const statusFilter = ref("all");

const form = reactive({
  merchantName: "",
  contactName: "",
  contactPhone: "",
  cooperationStatus: 0,
  remark: ""
});

const rules = {
  merchantName: [
    { required: true, message: "请输入商户名称", trigger: "blur" }
  ]
};

function normalizeMerchantItem(item) {
  const statusCode = Number(item?.statusCode);
  return {
    ...item,
    statusCode: Number.isFinite(statusCode)
      ? statusCode
      : (String(item?.status || "").includes("合作中") ? 1 : 0),
    canDelete: item?.canDelete === true
  };
}

const activeMerchantCount = computed(() => merchants.value.filter((item) => Number(item.statusCode) === 1).length);
const totalCooperations = computed(() => merchants.value.reduce((sum, item) => sum + Number(item.cooperations || 0), 0));
const totalPendingReward = computed(() => formatCurrency(merchants.value.reduce((sum, item) => sum + toNumber(item.pendingRewardAmount), 0)));
const totalIssuedReward = computed(() => formatCurrency(merchants.value.reduce((sum, item) => sum + toNumber(item.issuedRewardAmount), 0)));
const filteredMerchants = computed(() => merchants.value.filter((item) => {
  const matchesText = matchesKeyword(keyword.value, [
    item.merchantId,
    item.name,
    item.contact,
    item.phone,
    item.status,
    item.remark
  ]);
  const matchesStatus = statusFilter.value === "all"
    || (statusFilter.value === "active" && Number(item.statusCode) === 1)
    || (statusFilter.value === "pending" && Number(item.statusCode) !== 1)
    || (statusFilter.value === "deletable" && item.canDelete);
  return matchesText && matchesStatus;
}));

function resolveMerchantStatusTone(value) {
  const type = resolveMerchantStatusType(value);
  return type === "info" ? "muted" : type;
}

function resolveMerchantCaption(row) {
  if (Number(row?.statusCode) !== 1) {
    return row.canDelete
      ? "意向商家不会出现在合作单创建列表里，可先设为合作中；如果确认不用了，也可以直接删除。"
      : "这家商家仍有进行中的合作，暂时不能删除；需要继续合作时可保留当前状态。";
  }
  return row.canDelete
    ? "当前没有进行中的合作，删除后商家会从后台列表移除，历史合作记录仍会保留。"
    : "仍有进行中的合作关联，需先结束合作后再删除。";
}

async function loadMerchants() {
  loading.value = true;
  try {
    const data = await getAdminMerchants();
    merchants.value = Array.isArray(data) ? data.map(normalizeMerchantItem) : [];
  } catch (error) {
    ElMessage.error(error.message || "加载商家列表失败");
  } finally {
    loading.value = false;
  }
}

function goCooperations() {
  router.push("/cooperations");
}

function resetForm() {
  form.merchantName = "";
  form.contactName = "";
  form.contactPhone = "";
  form.cooperationStatus = 0;
  form.remark = "";
  formRef.value?.clearValidate?.();
}

function openCreateDialog() {
  resetForm();
  dialogVisible.value = true;
}

async function handleActivate(row) {
  try {
    await ElMessageBox.confirm(
      `确认将商家“${row.name}”设为合作中吗？启用后它会立即出现在创建合作单的商家选项里。`,
      "启用商家确认",
      {
        type: "info",
        confirmButtonText: "设为合作中",
        cancelButtonText: "取消"
      }
    );
    actionKey.value = `activate-${row.merchantId}`;
    await activateAdminMerchant(row.merchantId);
    ElMessage.success(`商家“${row.name}”已设为合作中`);
    await loadMerchants();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "启用商家失败");
    }
  } finally {
    actionKey.value = "";
  }
}

async function handleCreate() {
  try {
    await formRef.value?.validate();
  } catch (error) {
    return;
  }
  submitting.value = true;
  try {
    await createAdminMerchant({
      merchantName: form.merchantName.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      cooperationStatus: Number(form.cooperationStatus || 0),
      remark: form.remark.trim()
    });
    ElMessage.success("商户已添加");
    dialogVisible.value = false;
    await loadMerchants();
  } catch (error) {
    ElMessage.error(error.message || "添加商户失败");
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除商家“${row.name}”吗？删除后商家会从后台列表移除，历史合作记录仍会保留，且无法恢复。`,
      "删除商家确认",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消"
      }
    );
    actionKey.value = `delete-${row.merchantId}`;
    await deleteAdminMerchant(row.merchantId);
    ElMessage.success(`商家“${row.name}”已删除`);
    await loadMerchants();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "删除商家失败");
    }
  } finally {
    actionKey.value = "";
  }
}

onMounted(loadMerchants);
</script>

<style scoped>
.merchant-card {
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 1fr) auto;
}

.merchant-card .ops-metric-value {
  word-break: break-word;
}

@media (max-width: 1180px) {
  .merchant-card {
    grid-template-columns: 1fr;
  }
}
</style>

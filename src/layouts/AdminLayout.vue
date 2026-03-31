<script setup>
import { computed, onMounted, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { fetchAdminProfile, logoutAdmin } from "../api/admin";
import { clearAdminSession, getAdminProfile, setAdminProfile } from "../utils/adminAuth";

const route = useRoute();
const router = useRouter();
const adminProfile = ref(getAdminProfile());
const menuKeyword = ref("");

const menus = [
  { path: "/dashboard", label: "数据看板", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR", "FINANCE"] },
  { path: "/users", label: "用户管理", roles: ["SUPER_ADMIN"] },
  { path: "/content-audit", label: "内容审核", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/announcements", label: "公告管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/activities", label: "活动管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/cooperations", label: "合作管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR", "FINANCE"] },
  { path: "/merchants", label: "商家管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/settlements", label: "结算记录", roles: ["SUPER_ADMIN", "FINANCE"] },
  { path: "/withdraw-requests", label: "提现申请", roles: ["SUPER_ADMIN", "FINANCE"] }
];

const activeMenu = computed(() => route.path);
const roleMenus = computed(() => {
  const roleCode = adminProfile.value?.roleCode;
  if (!roleCode) {
    return [];
  }

  return menus
    .filter((item) => item.roles.includes(roleCode))
    .map((item, index) => ({
      ...item,
      order: String(index + 1).padStart(2, "0")
    }));
});
const visibleMenus = computed(() => roleMenus.value.filter((item) => String(item.label || "")
  .toLowerCase()
  .includes(String(menuKeyword.value || "").trim().toLowerCase())));

const pageTitle = computed(() => route.meta?.title || "青搭管理台");

function go(path) {
  router.push(path);
}

async function syncProfile() {
  try {
    const profile = await fetchAdminProfile();
    adminProfile.value = profile;
    setAdminProfile(profile);
  } catch (error) {
    // Keep local profile when refresh fails.
  }
}

async function handleLogout() {
  try {
    await logoutAdmin();
  } catch (error) {
    // Ignore backend logout errors and still clear local session.
  } finally {
    clearAdminSession();
    ElMessage.success("已退出登录");
    router.replace("/login");
  }
}

onMounted(() => {
  syncProfile();
});
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="256px" class="admin-aside">
      <div class="brand-panel">
        <div class="brand-kicker">QINGTA ADMIN</div>
        <div class="brand-title">青搭管理台</div>
        <div class="brand-copy">把公告、活动、内容审核和创作者激励统一收进一个清晰的运营后台里。</div>
        <div class="menu-search-wrap">
          <el-input
            v-model="menuKeyword"
            :prefix-icon="Search"
            clearable
            placeholder="搜索模块"
          />
        </div>
      </div>

      <el-menu v-if="visibleMenus.length" :default-active="activeMenu" class="menu-panel" @select="go">
        <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
          <span class="menu-order">{{ item.order }}</span>
          <span class="menu-text">{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <div v-else class="menu-panel">
        <div class="menu-search-empty">没有匹配的模块，试试别的关键词。</div>
      </div>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-title">{{ pageTitle }}</div>

        <div class="header-side">
          <div class="header-user">{{ adminProfile?.displayName || "管理员" }}</div>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.header-title {
  min-width: 0;
  color: var(--admin-text);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.header-side {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-user {
  color: var(--admin-text);
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.menu-order {
  width: 28px;
}

.menu-text {
  flex: 1;
}

@media (max-width: 1180px) {
  .header-side {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>

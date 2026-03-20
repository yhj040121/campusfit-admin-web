<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { fetchAdminProfile, logoutAdmin } from "../api/admin";
import { API_BASE_URL } from "../api/http";
import { clearAdminSession, getAdminProfile, setAdminProfile } from "../utils/adminAuth";

const route = useRoute();
const router = useRouter();
const loadingProfile = ref(false);
const adminProfile = ref(getAdminProfile());

const menus = [
  { path: "/dashboard", label: "数据看板", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR", "FINANCE"] },
  { path: "/users", label: "用户管理", roles: ["SUPER_ADMIN"] },
  { path: "/content-audit", label: "内容审核", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/activities", label: "活动管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/merchants", label: "商家管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/settlements", label: "佣金结算", roles: ["SUPER_ADMIN", "FINANCE"] }
];

const activeMenu = computed(() => route.path);
const visibleMenus = computed(() => {
  if (!adminProfile.value?.roleCode) {
    return [];
  }
  return menus.filter((item) => item.roles.includes(adminProfile.value.roleCode));
});

function formatRole(roleCode) {
  if (roleCode === "SUPER_ADMIN") return "超级管理员";
  if (roleCode === "CONTENT_OPERATOR") return "内容运营";
  if (roleCode === "FINANCE") return "财务人员";
  return "管理员";
}

function go(path) {
  router.push(path);
}

async function syncProfile(showToast = false) {
  loadingProfile.value = true;
  try {
    const profile = await fetchAdminProfile();
    adminProfile.value = profile;
    setAdminProfile(profile);
    if (showToast) {
      ElMessage.success("管理员信息已刷新");
    }
  } catch (error) {
    ElMessage.error(error.message || "获取管理员信息失败");
  } finally {
    loadingProfile.value = false;
  }
}

async function handleLogout() {
  try {
    await logoutAdmin();
  } catch (error) {
    // 忽略后端退出失败，仍然清理本地会话
  } finally {
    clearAdminSession();
    ElMessage.success("已退出登录");
    router.replace("/login");
  }
}

onMounted(() => {
  if (!adminProfile.value) {
    syncProfile();
  }
});
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="240px" class="admin-aside">
      <div class="brand-panel">
        <div class="brand-kicker">Campus Bulletin</div>
        <div class="brand-title">CampusFit 管理后台</div>
        <div class="brand-copy">校园穿搭社交导购平台运营中心，以更轻盈的方式查看审核、商家合作与佣金结算。</div>
        <div class="brand-tags">
          <span>内容审核</span>
          <span>导购转化</span>
          <span>收益结算</span>
        </div>
      </div>
      <el-menu :default-active="activeMenu" class="menu-panel" @select="go">
        <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-copy">
          <div class="header-kicker">运营总览</div>
          <div class="page-title">{{ route.meta.title || "CampusFit 管理后台" }}</div>
          <div class="page-subtitle">当前已连接 Spring Boot + MySQL：{{ API_BASE_URL }}</div>
        </div>
        <el-space alignment="center" size="large" class="header-actions">
          <el-space direction="vertical" size="small" alignment="end">
            <div class="admin-user-name">{{ adminProfile?.displayName || "管理员" }}</div>
            <div class="admin-user-role">角色：{{ formatRole(adminProfile?.roleCode) }}</div>
          </el-space>
          <el-tag type="success">Spring Boot</el-tag>
          <el-tag type="primary">MySQL</el-tag>
          <el-tag type="info">Vue 3 + Element Plus</el-tag>
          <el-button :loading="loadingProfile" plain @click="syncProfile(true)">刷新资料</el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </el-space>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.brand-kicker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.brand-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.brand-tags span {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
}

.header-copy {
  min-width: 0;
}

.header-kicker {
  margin-bottom: 10px;
  color: #53a9dd;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.header-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.admin-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.admin-user-role {
  font-size: 12px;
  color: #7d8ea3;
}
</style>

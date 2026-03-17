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
  { path: "/dashboard", label: "Dashboard", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR", "FINANCE"] },
  { path: "/users", label: "Users", roles: ["SUPER_ADMIN"] },
  { path: "/content-audit", label: "Content Audit", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/merchants", label: "Merchants", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/settlements", label: "Settlements", roles: ["SUPER_ADMIN", "FINANCE"] }
];

const activeMenu = computed(() => route.path);
const visibleMenus = computed(() => {
  if (!adminProfile.value?.roleCode) {
    return [];
  }
  return menus.filter((item) => item.roles.includes(adminProfile.value.roleCode));
});

function go(path) {
  router.push(path);
}

async function syncProfile() {
  loadingProfile.value = true;
  try {
    const profile = await fetchAdminProfile();
    adminProfile.value = profile;
    setAdminProfile(profile);
  } catch (error) {
    ElMessage.error(error.message || "Failed to fetch admin profile");
  } finally {
    loadingProfile.value = false;
  }
}

async function handleLogout() {
  try {
    await logoutAdmin();
  } catch (error) {
    // Ignore backend logout failure and still clear local session.
  } finally {
    clearAdminSession();
    ElMessage.success("Logged out");
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
        <div class="brand-title">CampusFit Admin</div>
        <div class="brand-copy">Campus outfit commerce management center</div>
      </div>
      <el-menu :default-active="activeMenu" class="menu-panel" @select="go">
        <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div>
          <div class="page-title">{{ route.meta.title || "CampusFit Admin" }}</div>
          <div class="page-subtitle">Connected to Spring Boot + MySQL at {{ API_BASE_URL }}</div>
        </div>
        <el-space alignment="center" size="large">
          <el-space direction="vertical" size="small" alignment="end">
            <div class="admin-user-name">{{ adminProfile?.displayName || "Admin" }}</div>
            <div class="admin-user-role">Role: {{ adminProfile?.roleCode || "Loading" }}</div>
          </el-space>
          <el-tag type="success">Spring Boot</el-tag>
          <el-tag type="primary">MySQL</el-tag>
          <el-tag type="info">Vue 3 + Element Plus</el-tag>
          <el-button :loading="loadingProfile" plain @click="syncProfile">Refresh</el-button>
          <el-button type="danger" plain @click="handleLogout">Logout</el-button>
        </el-space>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
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
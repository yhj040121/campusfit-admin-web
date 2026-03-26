<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { fetchAdminProfile, logoutAdmin } from "../api/admin";
import { clearAdminSession, getAdminProfile, setAdminProfile } from "../utils/adminAuth";

const route = useRoute();
const router = useRouter();
const loadingProfile = ref(false);
const adminProfile = ref(getAdminProfile());

const menus = [
  { path: "/dashboard", label: "数据看板", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR", "FINANCE"] },
  { path: "/users", label: "用户管理", roles: ["SUPER_ADMIN"] },
  { path: "/content-audit", label: "内容审核", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/announcements", label: "官方公告", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/activities", label: "活动管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/merchants", label: "商家管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] },
  { path: "/settlements", label: "结算记录", roles: ["SUPER_ADMIN", "FINANCE"] },
  { path: "/withdraw-requests", label: "提现申请", roles: ["SUPER_ADMIN", "FINANCE"] }
];

const pageDescriptions = {
  "/dashboard": "把当前 app 的内容流、活动位和激励状态收拢到一个统一工作台里。",
  "/users": "跟踪用户状态、内容活跃度和异常账号处理，保证社区秩序稳定。",
  "/content-audit": "审核穿搭内容、商品链路和社区规范，减少低质量与失效信息进入前台。",
  "/announcements": "管理首页公告、发布时间和置顶优先级，让前台提示位和现在的 app 节奏一致。",
  "/activities": "维护活动中心、首页推荐和发布页可选活动，适配你现在的活动玩法。",
  "/merchants": "查看合作品牌、投放状态和专题资源位，辅助运营判断合作入口。",
  "/settlements": "跟踪激励结算、确认打款前状态，承接创作者激励链路。",
  "/withdraw-requests": "审核提现、回写处理状态，让激励中心和财务动作保持同步。"
};

const activeMenu = computed(() => route.path);
const visibleMenus = computed(() => {
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

const pageTitle = computed(() => route.meta?.title || "青搭管理后台");
const pageSubtitle = computed(() => {
  return pageDescriptions[route.path] || "把移动端最新的内容、活动和激励逻辑映射到管理端工作流。";
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
      ElMessage.success("管理员资料已刷新");
    }
  } catch (error) {
    if (showToast) {
      ElMessage.error(error.message || "获取管理员资料失败");
    }
  } finally {
    loadingProfile.value = false;
  }
}

async function handleLogout() {
  try {
    await logoutAdmin();
  } catch (error) {
    // Ignore backend logout errors and still clear the local session.
  } finally {
    clearAdminSession();
    ElMessage.success("已退出登录");
    router.replace("/login");
  }
}

onMounted(() => {
  syncProfile(false);
});
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="256px" class="admin-aside">
      <div class="brand-panel">
        <div class="brand-kicker">青搭 ADMIN</div>
        <div class="brand-title">青搭管理后台</div>
        <div class="brand-copy">把公告、活动、内容审核和创作者激励统一收进一个云端运营工作台，和青搭前台节奏保持一致。</div>
      </div>

      <el-menu :default-active="activeMenu" class="menu-panel" @select="go">
        <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
          <span class="menu-order">{{ item.order }}</span>
          <span class="menu-text">{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-copy">
          <div class="header-kicker">内容运营工作台</div>
          <div class="page-title">{{ pageTitle }}</div>
          <div class="page-subtitle">{{ pageSubtitle }}</div>
          <div class="page-meta">当前账号可访问 {{ visibleMenus.length }} 个业务模块</div>
        </div>

        <el-space alignment="center" size="middle" class="header-actions">
          <el-space direction="vertical" size="small" alignment="end" class="header-user-box">
            <div class="admin-user-label">当前账号</div>
            <div class="admin-user-name">{{ adminProfile?.displayName || "管理员" }}</div>
            <div class="admin-user-role">角色：{{ formatRole(adminProfile?.roleCode) }}</div>
          </el-space>

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
.header-copy {
  min-width: 0;
}

.page-meta {
  margin-top: 10px;
  color: var(--admin-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.header-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.header-user-box {
  min-width: 156px;
}

.admin-user-label {
  color: var(--admin-text-muted);
  font-family: var(--admin-font-data);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-order {
  width: 28px;
}

.menu-text {
  flex: 1;
}

.admin-user-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--admin-text);
}

.admin-user-role {
  font-size: 12px;
  color: var(--admin-text-soft);
}

@media (max-width: 960px) {
  .header-user-box {
    align-items: flex-start !important;
  }
}
</style>

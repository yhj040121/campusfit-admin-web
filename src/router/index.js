import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "../layouts/AdminLayout.vue";
import DashboardView from "../views/DashboardView.vue";
import UserManageView from "../views/UserManageView.vue";
import ContentAuditView from "../views/ContentAuditView.vue";
import AnnouncementManageView from "../views/AnnouncementManageView.vue";
import MerchantManageView from "../views/MerchantManageView.vue";
import SettlementView from "../views/SettlementView.vue";
import WithdrawRequestView from "../views/WithdrawRequestView.vue";
import ActivityManageView from "../views/ActivityManageView.vue";
import LoginView from "../views/LoginView.vue";
import { getAdminProfile, getAdminToken, hasAnyRole } from "../utils/adminAuth";

function getDefaultPathByRole(profile) {
  switch (profile?.roleCode) {
    case "CONTENT_OPERATOR":
      return "/content-audit";
    case "FINANCE":
      return "/settlements";
    case "SUPER_ADMIN":
    default:
      return "/dashboard";
  }
}

const routes = [
  {
    path: "/login",
    component: LoginView,
    meta: { public: true, title: "后台登录" }
  },
  {
    path: "/",
    component: AdminLayout,
    redirect: "/dashboard",
    children: [
      { path: "dashboard", component: DashboardView, meta: { title: "数据看板", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR", "FINANCE"] } },
      { path: "users", component: UserManageView, meta: { title: "用户管理", roles: ["SUPER_ADMIN"] } },
      { path: "content-audit", component: ContentAuditView, meta: { title: "内容审核", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] } },
      { path: "announcements", component: AnnouncementManageView, meta: { title: "官方公告", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] } },
      { path: "activities", component: ActivityManageView, meta: { title: "活动管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] } },
      { path: "merchants", component: MerchantManageView, meta: { title: "商家管理", roles: ["SUPER_ADMIN", "CONTENT_OPERATOR"] } },
      { path: "settlements", component: SettlementView, meta: { title: "结算记录", roles: ["SUPER_ADMIN", "FINANCE"] } },
      { path: "withdraw-requests", component: WithdrawRequestView, meta: { title: "提现申请", roles: ["SUPER_ADMIN", "FINANCE"] } }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta?.title || "CampusFit 管理后台"} - CampusFit`;

  const token = getAdminToken();
  const profile = getAdminProfile();

  if (to.meta?.public) {
    if (token && profile && to.path === "/login") {
      next(getDefaultPathByRole(profile));
      return;
    }
    next();
    return;
  }

  if (!token || !profile) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }

  const roles = to.meta?.roles || [];
  if (!hasAnyRole(roles)) {
    next(getDefaultPathByRole(profile));
    return;
  }

  next();
});

export default router;

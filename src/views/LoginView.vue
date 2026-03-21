<template>
  <div class="login-page campus-login-page">
    <div class="login-wrap campus-login-wrap">
      <section class="login-poster campus-poster">
        <div class="poster-badge">Campus Bulletin</div>
        <h2>校园穿搭运营中心</h2>
        <p>把内容审核、活动专题、商家合作、推广激励和结算记录放在同一块轻盈的校园运营公告板里，帮助你更顺滑地演示整套系统。</p>

        <div class="poster-metrics">
          <article>
            <span>模块覆盖</span>
            <strong>审核 / 活动 / 结算 / 提现</strong>
          </article>
          <article>
            <span>系统风格</span>
            <strong>校园公告栏式后台</strong>
          </article>
        </div>

        <div class="poster-points">
          <div class="poster-point">查看真实看板数据与待审核内容</div>
          <div class="poster-point">处理商家合作、专题活动与运营配置</div>
          <div class="poster-point">跟踪创作者推广激励、结算记录与提现申请</div>
        </div>
      </section>

      <section class="login-panel campus-login-panel">
        <div class="brand-badge">CampusFit 管理后台</div>
        <h1>管理员登录</h1>
        <p>选择演示账号即可进入后台，按角色查看不同的管理能力与工作台范围。</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSubmit">
          <el-form-item label="管理员账号" prop="username">
            <el-input v-model="form.username" placeholder="请输入账号" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" />
          </el-form-item>
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleSubmit">
            进入后台
          </el-button>
        </el-form>

        <div class="demo-block">
          <div class="demo-title-row">
            <span class="demo-title">演示账号</span>
            <span class="demo-copy">点击即可自动填充</span>
          </div>
          <div class="demo-list campus-demo-list">
            <button class="demo-card" type="button" @click="fillDemoAccount('admin', 'admin123')">
              <div>
                <strong>超级管理员</strong>
                <small>可查看全部模块</small>
              </div>
              <span>admin / admin123</span>
            </button>
            <button class="demo-card" type="button" @click="fillDemoAccount('operator', 'operator123')">
              <div>
                <strong>内容运营</strong>
                <small>审核、活动、商家</small>
              </div>
              <span>operator / operator123</span>
            </button>
            <button class="demo-card" type="button" @click="fillDemoAccount('finance', 'finance123')">
              <div>
                <strong>财务人员</strong>
                <small>看板、结算记录、提现申请</small>
              </div>
              <span>finance / finance123</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { loginAdmin } from "../api/admin";
import { setAdminSession } from "../utils/adminAuth";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const formRef = ref();
const form = reactive({
  username: "admin",
  password: "admin123"
});

const rules = {
  username: [{ required: true, message: "请输入管理员账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

function getRedirectPath(payload) {
  if (route.query.redirect) {
    return String(route.query.redirect);
  }
  switch (payload?.roleCode) {
    case "CONTENT_OPERATOR":
      return "/content-audit";
    case "FINANCE":
      return "/settlements";
    case "SUPER_ADMIN":
    default:
      return "/dashboard";
  }
}

function fillDemoAccount(username, password) {
  form.username = username;
  form.password = password;
}

async function handleSubmit() {
  if (!formRef.value) {
    return;
  }
  await formRef.value.validate();
  loading.value = true;
  try {
    const payload = await loginAdmin(form);
    setAdminSession(payload);
    ElMessage.success("登录成功");
    router.replace(getRedirectPath(payload));
  } catch (error) {
    ElMessage.error(error.message || "登录失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.campus-login-page {
  min-height: 100vh;
  padding: 32px;
}

.campus-login-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
  gap: 24px;
  width: min(1160px, 100%);
  margin: 0 auto;
  align-items: stretch;
  min-height: calc(100vh - 64px);
}

.campus-poster,
.campus-login-panel {
  position: relative;
  overflow: hidden;
}

.login-poster,
.campus-login-panel {
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 34px;
  box-shadow: 0 28px 60px rgba(73, 122, 156, 0.14);
}

.login-poster {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 640px;
  padding: 36px;
  color: #ffffff;
  background:
    radial-gradient(circle at 18% 18%, rgba(140, 223, 255, 0.22), transparent 24%),
    radial-gradient(circle at 88% 12%, rgba(112, 232, 194, 0.2), transparent 22%),
    linear-gradient(160deg, rgba(37, 69, 98, 0.96) 0%, rgba(26, 51, 75, 0.98) 52%, rgba(33, 74, 92, 0.96) 100%);
}

.login-poster::before,
.login-poster::after,
.campus-login-panel::before {
  content: "";
  position: absolute;
  pointer-events: none;
}

.login-poster::before {
  right: -36px;
  top: -30px;
  width: 180px;
  height: 180px;
  border-radius: 42px;
  background: rgba(255, 255, 255, 0.08);
  transform: rotate(16deg);
}

.login-poster::after {
  left: 34px;
  bottom: 34px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(114, 210, 255, 0.18) 0%, rgba(114, 210, 255, 0) 72%);
}

.campus-login-panel {
  align-self: center;
  padding: 34px 32px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(18px);
}

.campus-login-panel::before {
  right: -42px;
  bottom: -50px;
  width: 190px;
  height: 190px;
  border-radius: 36px;
  background: linear-gradient(135deg, rgba(88, 189, 240, 0.12), rgba(103, 217, 175, 0.12));
  transform: rotate(18deg);
}

.poster-badge,
.brand-badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.poster-badge {
  color: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.12);
}

.brand-badge {
  color: #4d99ce;
  background: rgba(88, 189, 240, 0.12);
}

.login-poster h2,
.campus-login-panel h1,
.campus-login-panel p,
.poster-point,
.poster-metrics,
.demo-block,
.campus-login-panel :deep(.el-form) {
  position: relative;
  z-index: 1;
}

.login-poster h2 {
  margin: 22px 0 0;
  font-size: clamp(34px, 4vw, 48px);
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.login-poster > p {
  max-width: 560px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  line-height: 1.9;
}

.campus-login-panel h1 {
  margin: 20px 0 0;
  font-size: clamp(30px, 4vw, 40px);
  line-height: 1.12;
  letter-spacing: -0.04em;
  color: #203244;
}

.campus-login-panel > p {
  margin: 14px 0 0;
  color: #698194;
  line-height: 1.8;
}

.poster-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.poster-metrics article {
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.poster-metrics span {
  display: block;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
}

.poster-metrics strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}

.poster-points {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.poster-point {
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.campus-demo-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-block {
  margin-top: 28px;
}

.demo-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.demo-title {
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 700;
}

.demo-copy {
  color: #7b8fa1;
  font-size: 12px;
}

.demo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgba(109, 154, 188, 0.14);
  border-radius: 20px;
  background: rgba(246, 250, 253, 0.96);
  color: #203244;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(.22, 1, .36, 1), box-shadow 0.22s cubic-bezier(.22, 1, .36, 1), border-color 0.22s cubic-bezier(.22, 1, .36, 1);
  align-items: flex-start;
}

.demo-card div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.demo-card small {
  color: #8aa0b0;
  font-size: 12px;
}

.demo-card > span {
  color: #4d99ce;
  font-size: 13px;
  font-weight: 700;
}

.submit-btn {
  width: 100%;
  height: 52px;
  margin-top: 8px;
}

.campus-login-panel :deep(.el-form) {
  margin-top: 28px;
}

.campus-login-panel :deep(.el-form-item) {
  margin-bottom: 18px;
}

.campus-login-panel :deep(.el-form-item__label) {
  color: #365064;
  font-size: 13px;
  font-weight: 700;
}

.campus-login-panel :deep(.el-input__wrapper) {
  min-height: 52px;
  border-radius: 16px;
  background: rgba(246, 250, 253, 0.96);
  box-shadow: inset 0 0 0 1px rgba(109, 154, 188, 0.16);
}

.campus-login-panel :deep(.el-input__wrapper.is-focus) {
  box-shadow: inset 0 0 0 1px rgba(88, 189, 240, 0.48), 0 0 0 4px rgba(88, 189, 240, 0.12);
}

.campus-login-panel :deep(.el-input__inner) {
  color: #203244;
  font-size: 14px;
}

.campus-login-panel :deep(.el-input__inner::placeholder) {
  color: #8ca1b2;
}

@media (max-width: 960px) {
  .campus-login-page {
    padding: 20px;
  }

  .campus-login-wrap {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .campus-login-panel {
    order: 1;
  }

  .login-poster {
    order: 2;
    min-height: auto;
    padding: 28px 24px;
  }

  .poster-metrics {
    grid-template-columns: 1fr;
  }
}
</style>

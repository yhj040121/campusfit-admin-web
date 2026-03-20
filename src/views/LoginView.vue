<template>
  <div class="login-page campus-login-page">
    <div class="login-wrap campus-login-wrap">
      <section class="login-poster campus-poster">
        <div class="poster-badge">Campus Bulletin</div>
        <h2>校园穿搭运营中心</h2>
        <p>把内容审核、活动专题、商家合作和收益结算放在同一块轻盈的校园运营公告板里，帮助你更顺滑地演示整套系统。</p>

        <div class="poster-metrics">
          <article>
            <span>模块覆盖</span>
            <strong>审核 / 活动 / 结算</strong>
          </article>
          <article>
            <span>系统风格</span>
            <strong>校园公告栏式后台</strong>
          </article>
        </div>

        <div class="poster-points">
          <div class="poster-point">查看真实看板数据与待审核内容</div>
          <div class="poster-point">处理商家合作、专题活动与运营配置</div>
          <div class="poster-point">跟踪创作者收益与导购佣金结算</div>
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
                <small>看板、结算</small>
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
  width: min(1160px, 100%);
  margin: 0 auto;
  align-items: stretch;
}

.campus-poster,
.campus-login-panel {
  position: relative;
  overflow: hidden;
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

.campus-demo-list {
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

@media (max-width: 960px) {
  .campus-login-page {
    padding: 20px;
  }

  .poster-metrics {
    grid-template-columns: 1fr;
  }
}
</style>

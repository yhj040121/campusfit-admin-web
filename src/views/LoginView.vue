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
  username: [{ required: true, message: "Please enter the admin username", trigger: "blur" }],
  password: [{ required: true, message: "Please enter the password", trigger: "blur" }]
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
    ElMessage.success("Login success");
    router.replace(getRedirectPath(payload));
  } catch (error) {
    ElMessage.error(error.message || "Login failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="brand-badge">CampusFit Admin</div>
      <h1>Admin Login</h1>
      <p>Use a demo account below to review real dashboard, audit, merchant and settlement data.</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Enter username" size="large" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="Enter password" size="large" />
        </el-form-item>
        <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleSubmit">
          Enter Admin
        </el-button>
      </el-form>

      <el-divider>Demo Accounts</el-divider>
      <div class="demo-list">
        <button class="demo-card" type="button" @click="fillDemoAccount('admin', 'admin123')">
          <strong>Super Admin</strong>
          <span>admin / admin123</span>
        </button>
        <button class="demo-card" type="button" @click="fillDemoAccount('operator', 'operator123')">
          <strong>Content Operator</strong>
          <span>operator / operator123</span>
        </button>
        <button class="demo-card" type="button" @click="fillDemoAccount('finance', 'finance123')">
          <strong>Finance</strong>
          <span>finance / finance123</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: linear-gradient(135deg, #eef7ff 0%, #f8fffb 100%);
}

.login-panel {
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(62, 120, 171, 0.12);
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #e7f3ff;
  color: #3483d1;
  font-size: 13px;
  font-weight: 600;
}

h1 {
  margin: 18px 0 10px;
  font-size: 28px;
  color: #1f2d3d;
}

p {
  margin: 0 0 24px;
  color: #6f8197;
  line-height: 1.7;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  border-radius: 14px;
}

.demo-list {
  display: grid;
  gap: 12px;
}

.demo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #dce9f6;
  border-radius: 16px;
  background: #f8fbff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-card:hover {
  border-color: #7cc9c0;
  transform: translateY(-1px);
}

.demo-card strong {
  color: #1f2d3d;
}

.demo-card span {
  color: #6f8197;
  font-size: 13px;
}
</style>
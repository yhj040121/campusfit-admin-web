<template>
  <div class="login-page campus-login-page">
    <div class="campus-login-wrap">
      <section class="login-poster campus-poster">
        <div class="brand-badge poster-badge">青搭 ADMIN</div>
        <h2>青搭内容运营中心</h2>
        <p>统一处理公告、活动、内容审核、品牌合作和创作者激励，当前后台连接云端服务。</p>
      </section>

      <section class="login-panel campus-login-panel">
        <div class="brand-badge login-panel-badge">青搭管理后台</div>
        <h1>管理员登录</h1>
        <p>输入管理员账号和密码后进入运营工作台。</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSubmit">
          <el-form-item label="管理员账号" prop="username">
            <el-input v-model="form.username" placeholder="请输入管理员账号" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" />
          </el-form-item>
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleSubmit">
            进入后台
          </el-button>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { loginAdmin } from "../api/admin";
import { getDefaultAdminPathByRole, setAdminSession } from "../utils/adminAuth";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const formRef = ref();
const form = reactive({
  username: "",
  password: ""
});

const rules = {
  username: [{ required: true, message: "请输入管理员账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

function getRedirectPath(payload) {
  if (route.query.redirect) {
    return String(route.query.redirect);
  }
  return getDefaultAdminPathByRole(payload);
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
.campus-poster,
.campus-login-panel {
  position: relative;
  overflow: hidden;
}

.login-poster h2,
.campus-login-panel h1,
.campus-login-panel p,
.campus-login-panel :deep(.el-form) {
  position: relative;
  z-index: 1;
}

.poster-badge {
  color: rgba(255, 255, 255, 0.88);
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.12);
}

.login-panel-badge {
  margin-bottom: 4px;
}
.campus-login-panel :deep(.el-form-item__label) {
  color: var(--admin-text);
  font-size: 13px;
  font-weight: 700;
}

.campus-login-panel :deep(.el-input__wrapper) {
  min-height: 52px;
  border-radius: 16px;
  background: rgba(255, 251, 247, 0.96);
  box-shadow: inset 0 0 0 1px rgba(43, 24, 34, 0.08);
}

.campus-login-panel :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 4px rgba(45, 87, 217, 0.08), inset 0 0 0 1px rgba(45, 87, 217, 0.28);
}

.campus-login-panel :deep(.el-input__inner) {
  color: var(--admin-text);
  font-size: 14px;
}

.campus-login-panel :deep(.el-input__inner::placeholder) {
  color: var(--admin-text-soft);
}

@media (max-width: 960px) {
  .poster-badge {
    color: var(--admin-secondary);
    border-color: var(--admin-border);
    background: rgba(255, 250, 245, 0.92);
  }
}
</style>

<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <h2 class="login-title">GPNU 公寓电力系统</h2>
        <p class="login-subtitle">Apartment Electricity System</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="remember">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const formRef = ref()
const loading = ref(false)
const remember = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
}

const handleLogin = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    // 纯前端演示：模拟登录流程
    setTimeout(() => {
      loading.value = false
      ElMessage.success('登录成功')
    }, 800)
  })
}

onMounted(() => {
  ElMessageBox.alert(
    h('p', { style: 'line-height: 1.6' }, [
      '这是一个纯前端项目，仅用于界面演示，',
      h('strong', '不会改变和管理任何数据'),
      '。',
    ]),
    '提示',
    {
      confirmButtonText: '我知道了',
      type: 'warning',
    }
  )
})
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 400px;
  border-radius: 12px;
  padding: 12px 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.login-subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: #909399;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.login-btn {
  width: 100%;
  letter-spacing: 4px;
}
</style>

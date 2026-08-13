<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { saveProfile } from '../store'

const name = ref('')
const gender = ref<'boy' | 'girl'>('boy')
const birthDate = ref('')

async function submit() {
  if (!name.value.trim()) {
    showToast('请填写宝宝小名')
    return
  }
  if (!birthDate.value) {
    showToast('请选择出生日期')
    return
  }
  if (dayjs(birthDate.value).isAfter(dayjs())) {
    showToast('出生日期不能晚于今天')
    return
  }
  await saveProfile({ name: name.value.trim(), gender: gender.value, birthDate: birthDate.value })
}
</script>

<template>
  <div class="setup page">
    <div class="hero">
      <div class="hero-icon">👶</div>
      <h2>欢迎使用宝宝记录</h2>
      <p class="muted">数据只保存在你的手机本地，先填一下宝宝的基本信息吧</p>
    </div>

    <div class="card">
      <div class="form-label">宝宝小名</div>
      <input v-model="name" class="dt-input" placeholder="如：安崽" maxlength="12" />

      <div class="form-label">性别（用于生长曲线对照）</div>
      <div class="chip-row">
        <button class="chip" :class="{ active: gender === 'boy' }" @click="gender = 'boy'">男宝 👦</button>
        <button class="chip" :class="{ active: gender === 'girl' }" @click="gender = 'girl'">女宝 👧</button>
      </div>

      <div class="form-label">出生日期</div>
      <input v-model="birthDate" class="dt-input" type="date" :max="dayjs().format('YYYY-MM-DD')" />

      <van-button type="primary" block round style="margin-top: 24px" @click="submit">
        开始使用
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.setup {
  padding-top: 15vh;
}

.hero {
  text-align: center;
  margin-bottom: 24px;
}

.hero-icon {
  font-size: 56px;
}

.hero h2 {
  margin: 8px 0 4px;
}
</style>

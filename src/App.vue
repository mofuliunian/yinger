<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { loadProfile, profile, undoState, dismissUndo } from './store'
import ProfileSetup from './components/ProfileSetup.vue'

const isDark = ref(false)
const media = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme() {
  isDark.value = media.matches
  document.documentElement.classList.toggle('dark', media.matches)
}

const { needRefresh, updateServiceWorker } = useRegisterSW()

onMounted(() => {
  applyTheme()
  media.addEventListener('change', applyTheme)
  loadProfile()
  // 申请持久化存储，降低 iOS/浏览器自动清理本地数据的风险
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {})
  }
})

onUnmounted(() => {
  media.removeEventListener('change', applyTheme)
})

function handleUndo() {
  undoState.value.onUndo?.()
  dismissUndo()
}
</script>

<template>
  <van-config-provider :theme="isDark ? 'dark' : 'light'">
    <template v-if="profile === undefined">
      <div class="loading-wrap"><van-loading size="32">加载中...</van-loading></div>
    </template>

    <ProfileSetup v-else-if="profile === null" />

    <template v-else>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>

      <van-tabbar route safe-area-inset-bottom>
        <van-tabbar-item to="/" icon="wap-home-o">首页</van-tabbar-item>
        <van-tabbar-item to="/calendar" icon="calendar-o">日历</van-tabbar-item>
        <van-tabbar-item to="/growth" icon="chart-trending-o">成长</van-tabbar-item>
        <van-tabbar-item to="/plan" icon="todo-list-o">计划</van-tabbar-item>
        <van-tabbar-item to="/mine" icon="user-o">我的</van-tabbar-item>
      </van-tabbar>
    </template>

    <!-- 撤销条 -->
    <transition name="van-slide-up">
      <div v-if="undoState.show" class="undo-bar">
        <span>{{ undoState.message }}</span>
        <van-button size="small" plain type="primary" @click="handleUndo">撤销</van-button>
      </div>
    </transition>

    <!-- 新版本提示 -->
    <div v-if="needRefresh" class="update-bar">
      <span>发现新版本</span>
      <van-button size="small" type="primary" @click="updateServiceWorker(true)">立即刷新</van-button>
    </div>
  </van-config-provider>
</template>

<style scoped>
.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

.undo-bar,
.update-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(70px + env(safe-area-inset-bottom));
  z-index: 3000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(50, 50, 51, 0.95);
  color: #fff;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.update-bar {
  bottom: calc(120px + env(safe-area-inset-bottom));
}
</style>

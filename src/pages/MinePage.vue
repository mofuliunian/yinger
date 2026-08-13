<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { showConfirmDialog, showToast } from 'vant'
import { db } from '../db'
import { profile, saveProfile, useQuery, getSetting } from '../store'
import { exportToFile, importFromFile, generateSyncCode, importSyncCode } from '../utils/backup'
import { ageInfo } from '../utils/date'

// ---------- 档案 ----------
const editShow = ref(false)
const editName = ref('')
const editGender = ref<'boy' | 'girl'>('boy')
const editBirth = ref('')

function openEdit() {
  if (!profile.value) return
  editName.value = profile.value.name
  editGender.value = profile.value.gender
  editBirth.value = profile.value.birthDate
  editShow.value = true
}

async function saveEdit() {
  if (!editName.value.trim() || !editBirth.value) {
    showToast('请填写完整')
    return
  }
  await saveProfile({ name: editName.value.trim(), gender: editGender.value, birthDate: editBirth.value })
  editShow.value = false
  showToast('已保存')
}

const age = computed(() => (profile.value ? ageInfo(profile.value.birthDate) : null))

// ---------- 备份 ----------
const eventCount = useQuery(() => db.events.count(), 0)
const lastBackupAt = useQuery(() => getSetting<string>('lastBackupAt').then((v) => v ?? null), null as string | null)

const fileInput = ref<HTMLInputElement>()

async function onExport() {
  await exportToFile()
  showToast('已导出备份文件')
}

async function onImportFile(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    await showConfirmDialog({
      title: '导入备份',
      message: '导入会覆盖当前手机上的所有记录，确定继续吗？',
    })
    await importFromFile(file)
    showToast('导入成功')
  } catch (e: any) {
    if (e !== 'cancel' && e?.message) showToast(`导入失败：${e.message}`)
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ---------- 同步码 ----------
const syncCodeShow = ref(false)
const syncCode = ref('')
const syncImportShow = ref(false)
const syncImportText = ref('')

async function onGenerateCode() {
  syncCode.value = await generateSyncCode()
  syncCodeShow.value = true
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(syncCode.value)
    showToast('已复制，粘贴给另一台手机吧')
  } catch {
    showToast('复制失败，请长按文本手动复制')
  }
}

async function onImportCode() {
  if (!syncImportText.value.trim()) {
    showToast('请粘贴同步码')
    return
  }
  try {
    await showConfirmDialog({
      title: '导入同步码',
      message: '导入会覆盖当前手机上的所有记录，确定继续吗？',
    })
    await importSyncCode(syncImportText.value)
    syncImportShow.value = false
    syncImportText.value = ''
    showToast('同步成功')
  } catch (e: any) {
    if (e !== 'cancel' && e?.message) showToast(`导入失败：${e.message}`)
  }
}

// ---------- 存储持久化 ----------
const persisted = ref<boolean | null>(null)

onMounted(async () => {
  if (navigator.storage?.persisted) {
    persisted.value = await navigator.storage.persisted()
  }
})

async function requestPersist() {
  if (!navigator.storage?.persist) {
    showToast('当前浏览器不支持')
    return
  }
  persisted.value = await navigator.storage.persist()
  showToast(persisted.value ? '已开启持久化存储' : '浏览器未授予，添加到主屏幕后更容易成功')
}

const iosGuideShow = ref(false)
</script>

<template>
  <div class="page">
    <!-- 宝宝档案 -->
    <div class="card" v-if="profile">
      <div class="card-title" style="justify-content: space-between">
        <span>👶 宝宝档案</span>
        <van-button size="small" round plain type="primary" @click="openEdit">编辑</van-button>
      </div>
      <van-cell-group inset style="margin: 0">
        <van-cell title="小名" :value="profile.name" />
        <van-cell title="性别" :value="profile.gender === 'boy' ? '男宝' : '女宝'" />
        <van-cell title="出生日期" :value="profile.birthDate" />
        <van-cell title="月龄" :value="age?.text ?? ''" />
      </van-cell-group>
    </div>

    <!-- 数据备份 -->
    <div class="card">
      <div class="card-title">💾 数据备份</div>
      <p class="muted" style="margin: 0 0 10px">
        共 {{ eventCount }} 条记录，全部保存在本机浏览器。上次备份：{{
          lastBackupAt ? dayjs(lastBackupAt).format('YYYY-MM-DD HH:mm') : '从未备份'
        }}。建议每周备份一次。
      </p>
      <van-cell-group inset style="margin: 0">
        <van-cell title="📤 导出备份文件" is-link @click="onExport" />
        <van-cell title="📥 导入备份文件" is-link @click="fileInput?.click()" />
        <van-cell title="🔗 生成同步码" label="把数据变成一段文本发给另一台手机" is-link @click="onGenerateCode" />
        <van-cell title="📋 输入同步码" label="粘贴另一台手机生成的同步码" is-link @click="syncImportShow = true" />
      </van-cell-group>
      <input ref="fileInput" type="file" accept="application/json,.json" style="display: none" @change="onImportFile" />
    </div>

    <!-- 存储与安装 -->
    <div class="card">
      <div class="card-title">📱 存储与安装</div>
      <van-cell-group inset style="margin: 0">
        <van-cell
          title="持久化存储"
          :label="persisted === null ? '状态未知' : persisted ? '已开启，数据不易被浏览器清理' : '未开启，长期不访问时数据可能被清理'"
        >
          <template #value>
            <van-button v-if="!persisted" size="small" round type="primary" plain @click="requestPersist">
              申请开启
            </van-button>
            <span v-else style="color: #43a047">✅ 已开启</span>
          </template>
        </van-cell>
        <van-cell title="添加到主屏幕" label="像 App 一样全屏使用，数据更安全" is-link @click="iosGuideShow = true" />
      </van-cell-group>
    </div>

    <div class="card">
      <div class="card-title">ℹ️ 关于</div>
      <p class="muted" style="margin: 0; line-height: 1.8">
        本应用为纯本地工具，无服务器、无账号，所有数据仅保存在你的手机浏览器中。
        疫苗程序、WHO 生长曲线、喂养与早教内容均为内置参考信息，具体请遵医嘱。
        请定期导出备份，防止更换手机或清理浏览器数据导致记录丢失。
      </p>
    </div>

    <!-- 编辑档案 -->
    <van-popup v-model:show="editShow" position="bottom" round closeable>
      <div class="sheet-title">编辑宝宝档案</div>
      <div class="sheet-body">
        <div class="form-label">小名</div>
        <input v-model="editName" class="dt-input" maxlength="12" />
        <div class="form-label">性别</div>
        <div class="chip-row">
          <button class="chip" :class="{ active: editGender === 'boy' }" @click="editGender = 'boy'">男宝 👦</button>
          <button class="chip" :class="{ active: editGender === 'girl' }" @click="editGender = 'girl'">女宝 👧</button>
        </div>
        <div class="form-label">出生日期</div>
        <input v-model="editBirth" class="dt-input" type="date" :max="dayjs().format('YYYY-MM-DD')" />
        <van-button type="primary" block round style="margin-top: 20px" @click="saveEdit">保存</van-button>
      </div>
    </van-popup>

    <!-- 同步码展示 -->
    <van-popup v-model:show="syncCodeShow" position="bottom" round closeable>
      <div class="sheet-title">🔗 同步码</div>
      <div class="sheet-body">
        <p class="muted" style="margin: 0 0 8px">
          复制后通过微信等发送到另一台手机，在对方的「输入同步码」中粘贴导入
        </p>
        <textarea :value="syncCode" readonly class="dt-input" rows="5" style="resize: none; font-size: 11px"></textarea>
        <van-button type="primary" block round style="margin-top: 12px" @click="copyCode">复制同步码</van-button>
      </div>
    </van-popup>

    <!-- 同步码导入 -->
    <van-popup v-model:show="syncImportShow" position="bottom" round closeable>
      <div class="sheet-title">📋 输入同步码</div>
      <div class="sheet-body">
        <textarea
          v-model="syncImportText"
          class="dt-input"
          rows="5"
          placeholder="粘贴以 BB1: 开头的同步码"
          style="resize: none; font-size: 11px"
        ></textarea>
        <van-button type="primary" block round style="margin-top: 12px" @click="onImportCode">导入</van-button>
      </div>
    </van-popup>

    <!-- iOS 安装引导 -->
    <van-popup v-model:show="iosGuideShow" position="bottom" round closeable>
      <div class="sheet-title">📱 添加到主屏幕</div>
      <div class="sheet-body">
        <p style="font-size: 14px; line-height: 2; margin: 0 0 12px">
          <b>iPhone（Safari）：</b><br />
          1. 用 Safari 打开本页面<br />
          2. 点底部「分享」按钮（方框加箭头）<br />
          3. 选择「添加到主屏幕」→ 点「添加」<br />
          <br />
          <b>安卓（Chrome/Edge）：</b><br />
          1. 点右上角菜单「⋮」<br />
          2. 选择「添加到主屏幕」或「安装应用」
        </p>
        <p class="muted" style="margin: 0">添加后从主屏幕图标打开，可全屏使用且离线可用，本地数据也更不容易被清理</p>
      </div>
    </van-popup>
  </div>
</template>

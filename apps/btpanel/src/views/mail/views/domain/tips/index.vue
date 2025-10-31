<template>
  <el-alert type="warning" class="!mb-[16px]" :closable="false" v-if="isShow === 0 && blacklistNum">
    <template #default>
      宝塔面板发现您的域名已进入邮件垃圾邮件列表
      <el-button type="primary" class="ml-16px" @click="onChangeTips(1)">
        我已处理
      </el-button>
      <el-button link type="primary" @click="onChangeTips(-1)">
        忽略
      </el-button>
    </template>
  </el-alert>
</template>
<script lang="ts" setup>
import { getBlacklistTips, setBlacklistTips } from '@/api/mail'
import { useDataHandle } from '@/hooks/tools'
import { isObject } from '@/utils'

const isShow = ref()

// 列表黑名单总数
const blacklistNum = ref(0)

// 忽略or处理警告
const onChangeTips = async (val: number) => {
  useDataHandle({
    loading: '正在处理...',
    message: true,
    request: setBlacklistTips({ operation: val }),
    success: () => init(),
  })
}

const init = async () => {
  const { data } = await getBlacklistTips()
  if (isObject<{ status: number; count: number }>(data)) {
    isShow.value = data.status
    blacklistNum.value = data.count
  }
}

init()

</script>
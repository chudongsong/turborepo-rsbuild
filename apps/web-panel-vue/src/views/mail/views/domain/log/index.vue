<template>
  <div class="p-16px h-300px">
    <el-button class="mb-8px" type="primary" @click="init">刷新</el-button>
    <bt-log class="h-[280px]" v-loading="loading" :content="content"></bt-log>
  </div>
</template>
<script lang="ts" setup>
import { getMailScanLog } from '@/api/mail';
import { useLoading } from '@mail/useMethod'
import { isObject } from '@/utils'

interface PropsData {
  log: string
}

interface Props {
  compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { loading, setLoading } = useLoading()

const content = ref(`暂无日志`)

// 获取数据
const init = async () => {
  setLoading(true)
  try {
    const { data } = await getMailScanLog({ path: props.compData.log })
    if (isObject<any>(data)) {
      content.value = data.data ? data.data : '暂无日志'
    }
  } finally {
    setLoading(false)
  }
}

init()
</script>

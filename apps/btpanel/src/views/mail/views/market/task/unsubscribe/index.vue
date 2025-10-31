<template>
  <bt-table-group class="p-16px">
    <template #content>
      <BtTable />
    </template>
    <template #footer-right>
      <BtPage />
    </template>
  </bt-table-group>
</template>

<script lang="ts" setup>
import { getTaskUnsubscribe } from '@/api/mail'
import { useAllTable } from '@/hooks/tools';
import { formatTime, isObject } from '@/utils'

interface PropsData {
  id: number
}

interface Props {
  compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { id: task_id } = props.compData

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh } = useAllTable({
  request: async data => {
    let params = {
      task_id,
      p: data.p,
      size: data.limit
    }
    const { data: message } = await getTaskUnsubscribe(params)
    return {
      data: message.data,
      total: message.total
    }
  },
  columns: [
    {
      prop: 'recipient',
      label: '邮箱'
    },
    {
      prop: 'created',
      label: '退订时间',
      align: 'right',
      render: row => formatTime(row.created)
    }
  ]
})

</script>
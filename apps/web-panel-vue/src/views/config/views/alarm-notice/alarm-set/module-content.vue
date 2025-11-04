<template>
	<div>
		<template v-if="row.list.length === 0">
			<span class="text-danger cursor-pointer" @click="setAlarmModuleDialog(row)">未配置</span>
		</template>
		<template v-else-if="row.list.length > 0">
			<span class="c7">
				<span v-if="row.name !== 'sms'" class="cursor-pointer" @click="setAlarmModuleDialog(row)">已绑定【{{ bindComputed(row.list) }}】,可继续配置绑定更多账号</span>
				<span v-if="row.name === 'sms'">今日剩余发送次数：{{ row.list.at(0).data.count }}( <span class="bt-link" @click="refreshCount">刷新次数</span>)</span>
			</span>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { Message } from '@/hooks/tools'
import { setAlarmModuleDialog } from '@/public/popup'

import { useGlobalStore } from '@store/global'

interface Props {
	row: any
}

const { getSenderAlarmListInfo } = useGlobalStore()

const props = withDefaults(defineProps<Props>(), {})
const { row } = toRefs(props) // 解构props

// 绑定数据处理
const bindComputed = (arr: any[]) => arr.map(item => item.data.title).join('、')

const refreshCount = async () => {
	await getSenderAlarmListInfo(true)
	Message.success('刷新成功')
}
</script>

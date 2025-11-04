<template>
	<div>
		<template v-if="row.name !== 'sms'">
			<span class="bt-link" @click="openAlarmDialog()">配置</span>
		</template>
		<template v-else>
			<span class="bt-link" v-if="!used" @click="setSms">开启</span>
			<span class="bt-link" v-if="used" @click="setSms">禁用</span>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { useConfirm, Message } from '@hooks/tools'

import { useGlobalStore } from '@store/global'
import { setSmsStatus } from '@/api/global'
import { setAlarmModuleDialog } from '@/public/popup'
import { getConfigStore } from '@/views/config/useStore'

interface Props {
	row: any
}
const { getSenderAlarmListInfo } = useGlobalStore()
const {
	refs: { isRefreshList },
} = getConfigStore()

const props = withDefaults(defineProps<Props>(), {})
const { row } = toRefs(props)
const used = computed(() => row.value.list.at(0).used)

// 设置短信告警
const setSms = async () => {
	try {
		await useConfirm({
			title: `${used.value ? '禁用' : '开启'}短信通知`,
			content: `您真的要${used.value ? '禁用' : '开启'}短信通知吗？`,
		})
		const id: any = row.value.list?.at(0).id
		const res = await setSmsStatus({ sender_id: id })
		Message.request(res)
		row.value.list.at(0).used = !used.value
		getSenderAlarmListInfo()
	} catch (error) {}
}

/**
 * @description 打开告警设置弹窗
 */
const openAlarmDialog = () =>
	setAlarmModuleDialog({
		...row.value,
		callback: () => {
			isRefreshList.value = true
		},
	})
</script>

<template>
	<div class="p-[2rem]">
		<BtTable :min-height="mainHeight" />
		<bt-help class="mt-[1rem]" :options="[{ content: '选择要安装集合的WordPress站点' }, { content: '默认安装Integration Pack插件和主题的最新版本' }]" style="list-style: disc"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useAllTable } from '@/hooks/tools'
import { confirmInstall, getWpInstallListConfig, getWpInstallListData } from './useController'
import { useGlobalStore } from '@/store/global'

const { mainHeight } = useGlobalStore()

/**
 * @description 获取表格
 */
const { BtTable, ref: installRef } = useAllTable({
	request: (data: any) => {
		return getWpInstallListData(data)
	},
	columns: getWpInstallListConfig(),
	extension: [],
})

const onConfirm = (close: () => void) => {
	confirmInstall(installRef.value.tableSelectList, close)
}

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>

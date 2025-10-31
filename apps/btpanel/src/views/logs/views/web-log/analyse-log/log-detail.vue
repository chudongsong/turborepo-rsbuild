<template>
	<div class="p-[20px]">
		<el-alert :closable="false" class="!mb-[20px]" show-icon>
			<template #title>
				<span>
					为了保护您的网站安全，建议使用【
					<span class="bt-link" @click="openPluginViewEvent">Nginx防火墙</span>
					】以有效防御当前站点的sql攻击
				</span>
			</template>
		</el-alert>
		<BtTable max-height="500" />
	</div>
</template>

<script setup lang="tsx">
import { useTable } from '@/hooks/tools'
import { storeToRefs } from 'pinia'
import { LOG_ANALYSE_STORE } from './useStore'
import { tableColumn, renderDetailData } from './useController'
import { openPluginView } from '@/public/index'

const popupClose = inject<any>('popupClose') //     弹窗关闭

const store = LOG_ANALYSE_STORE()
const { rowData } = storeToRefs(store)

/**
 * @description 打开插件视图
 */
const openPluginViewEvent = () => {
	openPluginView({ name: 'btwaf' })
	popupClose()
}

const { BtTable } = useTable({
	request: async () => await renderDetailData(rowData.value.type),
	columns: tableColumn,
})
</script>

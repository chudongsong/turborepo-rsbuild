<template>
	<div class="h-full">
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<template #content>
				<bt-table ref="siteProxyTable" v-bt-loading:title="'正在加载中，请稍后...'" :data="replaceData.subfilter" :max-height="350" :column="tableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
			</template>
		</bt-table-group>
		<bt-help :options="replaceHelpList" class="absolute bottom-0"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useOperation } from '@/hooks/tools'
import { proxyData, replaceData, replaceHelpList, tableColumns, initReplaceData, addReplaceView } from './useController'

watch(
	() => proxyData.value.sub_filter,
	() => {
		initReplaceData(proxyData.value.sub_filter)
	}
)

const { BtOperation } = useOperation({
	options: [
		{
			label: '添加内容替换',
			type: 'button',
			active: true,
			onClick: addReplaceView,
		},
	],
})
</script>

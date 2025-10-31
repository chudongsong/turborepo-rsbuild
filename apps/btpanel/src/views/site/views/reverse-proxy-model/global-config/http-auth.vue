<!--  -->
<template>
	<bt-table-group>
		<template #header-left>
			<BtOperation />
		</template>
		<template #content>
			<bt-table ref="siteProxyTable" v-bt-loading:title="'正在加载中，请稍后...'" :max-height="500" :data="authData" :column="authTableColumns">
				<template #empty>
					<div class="flex items-center justify-center">当前列表为空</div>
				</template>
			</bt-table>
		</template>
	</bt-table-group>
</template>

<script setup lang="ts">
import { useOperation } from '@/hooks/tools'
import { globalConfig, authData, authTableColumns, editHttpAuthEvent, initAuthData } from './useController'

watch(
	() => globalConfig.value.basic_auth,
	val => {
		initAuthData(val)
	}
)

const { BtOperation } = useOperation({
	options: [
		{
			label: '添加',
			type: 'button',
			active: true,
			onClick: () => {
				editHttpAuthEvent()
			},
		},
	],
})

onMounted(async () => {
	initAuthData(globalConfig.value.basic_auth)
})
</script>

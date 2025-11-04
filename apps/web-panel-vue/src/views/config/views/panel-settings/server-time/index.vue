<template>
	<config-rows :label="'服务器时间'">
		<template #value>
			<div class="w-[26rem]">
				<bt-input v-model="panelConfig.systemdate" :readonly="true"></bt-input>
			</div>
			<el-button type="primary" class="!ml-[1.2rem]" @click="onSync()"> 同步 </el-button>
		</template>
		<template #desc>
			<span>同步当前服务器时间</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'
import ConfigRows from '@config/public/config-rows-new'
import { setSyncDate } from '@/api/config'

const {
	refs: { panelConfig },
	getGlobalConfig,
} = getConfigStore()

/**
 * @description: 同步服务器时间
 */
const onSync = async () => {
	await useDataHandle({
		loading: '正在同步服务器时间，请稍候...',
		request: setSyncDate(),
		message: true,
		success: () => {
			getGlobalConfig()
		},
	})
}
</script>

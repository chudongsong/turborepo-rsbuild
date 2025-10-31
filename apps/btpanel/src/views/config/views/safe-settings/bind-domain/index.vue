<template>
	<config-rows :label="'绑定域名'">
		<template #value>
			<div class="w-[26rem]">
				<bt-input v-model="safeConfig.domain"></bt-input>
			</div>
			<el-button type="primary" class="!ml-12px" @click="onSave()">保存</el-button>
		</template>
		<template #desc>
			<span>为面板绑定一个访问域名，</span>
			<span class="text-danger">注意：一旦绑定域名，只能通过域名访问面板</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
	saveConfig,
} = getConfigStore()

/**
 * @description:保存按钮
 */
const onSave = () => {
	saveConfig('正在绑定域名，请稍候...')
}
</script>

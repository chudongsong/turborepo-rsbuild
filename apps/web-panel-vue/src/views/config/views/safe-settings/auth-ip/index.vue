<template>
	<config-rows :label="'授权IP'">
		<template #value>
			<div class="w-[26rem]">
				<bt-input v-model="safeConfig.limitip" placeholder="示例: 1.1.1.1,2.2.2.1-2.2.2.2"> </bt-input>
			</div>
			<el-button type="primary" class="!ml-12px" @click="onSave()">保存</el-button>
		</template>
		<template #desc>
			<span>设置访问授权IP，多个IP地址，请使用“,”分割，</span>
			<span class="text-danger">注意：一旦设置授权IP，只有指定IP的电脑能访问面板</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { Message } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
	saveConfig,
} = getConfigStore()

/**
 * @description:保存按钮
 */
const onSave = async () => {
	let regexp = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/
	let valdata = safeConfig.value.limitip.split(',').join('-').split('-')
	let isCorrect = true
	if (valdata.length) {
		for (let i = 0; i < valdata.length; i++) {
			if (regexp.test(valdata[i]) == false) {
				isCorrect = false
			}
		}
	}
	if (!isCorrect && safeConfig.value.limitip.length > 0) {
		return Message.error('请输入正确的ip地址')
	} else {
		saveConfig('正在保存授权IP，请稍候...')
	}
}
</script>

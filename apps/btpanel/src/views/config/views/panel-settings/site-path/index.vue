<template>
	<config-rows :label="'默认建站目录'">
		<template #value>
			<bt-input-icon v-model="panelConfig.sites_path" icon="el-folder-opened" @icon-click="onPathChange" width="26rem" />
			<el-button type="primary" class="!ml-12px" @click="onSave">保存</el-button>
		</template>
		<template #desc>
			<span>创建的站点，默认将保存到该目录下</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { fileSelectionDialog } from '@/public/index'
import { getConfigStore } from '@config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
	saveConfig,
} = getConfigStore()

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: panelConfig.value.sites_path,
		change: path => {
			panelConfig.value.sites_path = path
		},
	})
}

/**
 * @description: 保存
 */
const onSave = async () => saveConfig('正在保存默认建站目录，请稍候...')
</script>

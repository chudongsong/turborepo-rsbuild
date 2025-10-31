<template>
	<config-rows :label="'默认备份目录'">
		<template #value>
			<bt-input-icon v-model="panelConfig.backup_path" icon="el-folder-opened" @icon-click="onPathChange" width="26rem" />
			<el-button type="primary" class="!ml-12px" @click="onSave">保存</el-button>
		</template>
		<template #desc>
			<span>网站和站点默认的备份目录</span>
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
		path: panelConfig.value.backup_path,
		change: path => {
			panelConfig.value.backup_path = path
		},
	})
}

const onSave = async () => saveConfig('正在保存默认备份目录，请稍候...')
</script>

<template>
	<div class="json-config-dialog">
		<div class="json-config-header">
			<p>当前UI设置的JSON配置数据，可用于备份、分享或导入配置，保存后，需要刷新界面才能显示生效。</p>
		</div>
		<div class="json-config-content">
			<BtAceEditor v-model="jsonConfigText" :editor-option="editorOptions" class="json-editor" @save="handleSaveConfig" />
		</div>
		<div class="json-config-actions">
			<div class="actions-left">
				<el-button @click="copyJsonConfig">复制</el-button>
				<el-button :loading="importLoading" @click="importJsonConfig">
					{{ importLoading ? '导入中...' : '导入配置' }}
				</el-button>
				<el-button :loading="exportLoading" @click="downloadJsonConfig">
					{{ exportLoading ? '导出中...' : '导出配置' }}
				</el-button>
			</div>
			<div class="actions-right">
				<el-button type="primary" @click="handleSaveConfig">保存配置 </el-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessage } from '@/hooks/tools'
import BtAceEditor from '@/components/extension/bt-editor/index.tsx'
import { useGlobalStore } from '@store/global'
import { getConfigStore } from '@config/useStore'
import { copyText } from '@/utils/index'
import { useImportExportController } from './useController'
import { updateAllCSSVariables, isDark } from '@/utils/theme-config'
const { globalTheme } = useGlobalStore()
const { savaPanelTheme } = getConfigStore() // 获取面板主题、设置面板主题

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

const message = useMessage()
const jsonConfigText = ref('')

// 使用导入导出控制器
const { importLoading, exportLoading, handleImportConfig, handleExportConfig } = useImportExportController()

// 编辑器配置
const editorOptions = {
	mode: 'ace/mode/json',
	theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', //主题
	fontSize: '14px',
	showPrintMargin: false,
	wrap: true,
	readOnly: false,
}

// 复制JSON配置
const copyJsonConfig = async () => {
	try {
		await copyText({ value: jsonConfigText.value })
		message.success('配置已复制到剪贴板', 'success')
	} catch (err) {
		console.error('复制失败:', err)
		message.error('复制失败，请手动选择复制', 'error')
	}
}

// 导入JSON配置
const importJsonConfig = async () => {
	// 使用控制器的导入功能，导入成功后更新编辑器内容
	handleImportConfig({
		updateVariables: updateAllCSSVariables,
		onSuccess: () => {
			// 更新编辑器内容
			jsonConfigText.value = JSON.stringify(globalTheme.value, null, 2)
		},
	})
}

// 导出JSON配置
const downloadJsonConfig = async () => {
	// 使用控制器的导出功能
	await handleExportConfig()
}

// 保存配置
const handleSaveConfig = () => {
	try {
		// 验证JSON格式
		const config = JSON.parse(jsonConfigText.value)
		// 验证配置是否包含必要字段
		if (!config || !config.theme) {
			message.error('配置文件格式错误，请检查是否包含必要字段', 'error')
			return
		}
		globalTheme.value = { ...config }
		savaPanelTheme()
		message.success('配置保存成功！', 'success')
	} catch (error) {
		message.error('JSON格式错误，请检查配置内容', 'error')
	}
}

onMounted(() => {
	jsonConfigText.value = JSON.stringify(globalTheme.value, null, 2)
})
</script>

<style scoped>
.json-config-dialog {
	padding: 20px;
}

.json-config-header {
	margin-bottom: 20px;
}

.json-config-header h3 {
	margin: 0 0 8px 0;
	color: var(--el-text-color-primary);
	font-size: 18px;
	font-weight: 600;
}

.json-config-header p {
	margin: 0;
	color: var(--el-text-color-regular);
	font-size: 14px;
	line-height: 1.5;
}

.json-config-content {
	margin-bottom: 20px;
	height: 460px;
}

.json-editor {
	height: 100%;
	border: 1px solid var(--el-border-color);
	border-radius: var(--el-border-radius-base);
}

.json-config-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 8px;
}

.actions-left {
	display: flex;
	gap: 8px;
}

.actions-right {
	display: flex;
	gap: 8px;
}
</style>

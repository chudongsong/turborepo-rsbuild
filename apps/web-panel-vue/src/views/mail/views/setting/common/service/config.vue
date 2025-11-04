<template>
	<div class="p-16px">
		<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
		<bt-ace-editor v-bt-loading="loading" class="!h-[550px] my-[12px] rounded-base" v-model="content" id="mailConfigContent" :editorOption="getAceConfig()" />
	</div>
</template>

<script lang="ts" setup>
import BtAceEditor from '@components/extension/bt-editor'
import { isObject } from '@/utils'
import { getServiceConfig, saveServiceConfig } from '@/api/mail'
import { MailServiceTable } from '@mail/types'

import { useLoading } from '@mail/useMethod'
import { useMessage } from '@/hooks/tools'
import { isDark } from '@/utils/theme-config'

interface propsData {
	row: MailServiceTable
}

interface Props {
	compData: propsData
}

const Message = useMessage()

const props = withDefaults(defineProps<Props>(), {})

const { row } = props.compData

const content = ref('')

const encoding = ref('utf-8')

const { loading, setLoading } = useLoading()

const getContent = async () => {
	try {
		setLoading(true)
		const { data } = await getServiceConfig({ service: row.key })
		if (isObject(data)) {
			content.value = data.data.data
			encoding.value = data.data.encoding
		}
	} finally {
		setLoading(false)
	}
}

/**
 * @description 获取Ace编辑器配置信息
 * @param { string } params.readonly 是否只读 默认false
 */
const getAceConfig = (
	params: { readonly: boolean; theme: string } = {
		readonly: false,
		theme: 'chrome',
	}
) => {
	return {
		mode: 'ace/mode/nginx',
		theme: !isDark.value ? `ace/theme/${params.theme}` : 'ace/theme/clouds_midnight', // 主题
		wrap: true, // 是否自动换行
		showInvisibles: false, // 是否显示空格
		showFoldWidgets: false, // 是否显示代码折叠线
		useSoftTabs: true, // 是否使用空格代替tab
		tabSize: 2, // tab宽度
		showPrintMargin: false, // 是否显示打印边距
		readOnly: params.readonly, // 是否只读
		fontSize: '12px', // 字体大小
	}
}

const onConfirm = async (close: any) => {
	const { data } = await saveServiceConfig({ service: row.key, data: content.value })
	Message.request(data)
	if (data.status) {
		close()
	}
}

getContent()

defineExpose({
	onConfirm,
})
</script>

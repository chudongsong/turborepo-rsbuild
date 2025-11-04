<!--伪静态  -->
<template>
	<div class="p-2rem">
		<div class="flex items-center">
			站点已有伪静态规则：
			<el-select class="mx-12px !w-16rem" v-model="siteData" @change="handleChangeSite">
				<el-option v-for="item in siteRewrites" :key="item.id" :label="item.name + '站点的伪静态配置'" :value="item.file"></el-option>
			</el-select>
			模板伪静态规则：
			<el-select class="mx-12px !w-16rem" v-model="templateData" @change="handleChangeOther">
				<el-option v-for="item in templateRewrites" :key="item.id" :label="item.name + '模板的伪静态配置'" :value="item.file"></el-option>
			</el-select>
		</div>
		<el-divider></el-divider>
		<bt-editor v-model="editorContent" class="!h-[42rem]"></bt-editor>
		<bt-dialog title="部署当前伪静态" v-model="setPopup" :area="[52, 28]">
			<div class="relative h-full">
				<div class="p-20px">
					<span class="!mb-4px inline-block">如下是需要批量部署伪静态的站点：</span>
					<div class="overflow-auto h-[12rem] border border-lighter p-12px">
						<div v-for="(item, index) in compData" :key="index" class="p-4px w-full">
							{{ item.name }}
						</div>
					</div>
					<div class="text-danger mt-4px">注意：批量设置站点伪静态后，原有站点伪静态配置将被覆盖。</div>
				</div>
				<div class="absolute bottom-0 w-full bg-light flex items-center justify-end p-12px">
					<el-button type="warning" @click="setPopup = false">取消</el-button>
					<el-button type="primary" @click="handleConfirm">部署({{ compData.length }}项)</el-button>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle, useMessage } from '@/hooks/tools'
import { assembBatchParams, assembBatchResults, openResultView } from '@/public'
import { SITE_STORE } from '@/views/site/useStore'
import { getRewriteLists, batchPhpRewrite } from '@api/site'

const { batchConfig } = storeToRefs(SITE_STORE())
const { getFileEvent } = SITE_STORE()

const Message = useMessage() // 消息提示

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const emits = defineEmits(['close'])

const editorContent = ref('')
const setPopup = ref(false)

const siteRewrites = ref<any[]>([]) // 站点伪静态规则
const templateRewrites = ref<any[]>([]) // 模板伪静态规则

const siteData = ref()
const templateData = ref()

const getSelectData = async () => {
	try {
		const res = await getRewriteLists({
			site_ids: JSON.stringify(props.compData.map((item: any) => item.id)),
			site_type: 'PHP',
		})
		siteRewrites.value = res.data.site_rewrites
		templateRewrites.value = res.data.template_rewrites
	} catch (error) {
		console.log(error)
	}
}
const handleChangeSite = async (val: any) => {
	await getBody(val)
	templateData.value = ''
}

const handleChangeOther = async (val: any) => {
	await getBody(val)
	siteData.value = ''
}

const getBody = async (val: any) => {
	try {
		const { data: res } = await getFileEvent({ path: val })
		editorContent.value = res.data
	} catch (error) {
		console.log(error)
	}
}

const handleConfirm = async () => {
	// 请求参数
	const list = JSON.stringify(
		props.compData.map((item: any) => {
			const file = siteRewrites.value.find((items: any) => items.id === item.id)
			return {
				id: item.id,
				name: item.name,
				file: file.file,
			}
		})
	)
	const { exclude, enable } = batchConfig.value
	const params = assembBatchParams(false, exclude, enable, { params: { site_list: list, project_type: 'PHP', rewrite_data: editorContent.value } })
	useDataHandle({
		loading: '正在部署，请稍后...',
		request: batchPhpRewrite(params),
		success: (res: any) => {
			const { data } = assembBatchResults(res.data)
			openResultView(data, { title: '部署伪静态' })
			setPopup.value = false
			emits('close')
		},
	})
}

const onConfirm = () => {
	if (!siteData.value && !templateData.value) {
		Message.error('请选择一种伪静态规则')
		return
	}
	setPopup.value = true
}

defineExpose({
	onConfirm,
})

onMounted(async () => {
	await getSelectData()
})
</script>

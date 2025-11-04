<template>
	<div class="p-[20px]" v-bt-loading="viewLoading">
		<el-form ref="formRef" :model="form" :rules="rules" label-position="left">
			<el-form-item label="TLS设置" prop="checkList">
				<el-checkbox-group v-model="form.checkList">
					<el-checkbox value="TLSv1">TLSv1</el-checkbox>
					<el-checkbox value="TLSv1.1">TLSv1.1</el-checkbox>
					<el-checkbox value="TLSv1.2">TLSv1.2</el-checkbox>
					<el-checkbox value="TLSv1.3">TLSv1.3</el-checkbox>
				</el-checkbox-group>
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="handleSaveEvent">保存</el-button>
			</el-form-item>
			<bt-help class="ml-[20px] my-[20px]" :options="helpList"></bt-help>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { getSslProtocol, setSslProtocol } from '@api/site'

const Message = useMessage() // 消息提示
const formRef = ref<any>() // 表单实例
const form = reactive({
	checkList: ['选中且禁用'],
})
const viewLoading = ref(false) // 页面加载状态
const helpList = ref([
	{
		content: '请注意，TLS 1.0和1.1版本存在安全风险。如果您的应用程序不会出现兼容性问题，请不要勾选此选项。',
	},
	{
		content: '修改后只会对后续部署证书的站点进行设置，已部署证书的站点不会因此改变',
	},
	{
		content: '仅支持PHP项目',
	},
])
const rules = {
	checkList: [{ required: true, message: '请选择TLS设置', trigger: 'change' }],
}

/**
 * @description 获取TLS数据
 */
const getTlsData = async () => {
	viewLoading.value = true
	try {
		const { data } = await getSslProtocol()
		let arr: any[] = []
		//循环data对象，若键值为true,则将键添加至arr中、
		for (let key in data) {
			if (data[key]) {
				arr.push(key)
			}
		}
		form.checkList = arr
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description 保存
 */
const handleSaveEvent = async () => {
	await formRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setSslProtocol({ use_protocols: form.checkList.join(',') }),
		message: true,
	})
	if (res.status) getTlsData()
}

onMounted(() => {
	getTlsData()
})
</script>

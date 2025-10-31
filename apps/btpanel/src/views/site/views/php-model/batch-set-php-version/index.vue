<template>
	<div class="p-2rem">
		<el-form ref="formRef" :model="form" label-width="80px" :rules="rules">
			<el-form-item label="PHP版本" prop="selectValue">
				<el-select v-model="form.selectValue" placeholder="请选择PHP版本" class="!w-24rem">
					<el-option v-for="item in phpList" :key="item.version" :label="item.name" :value="item.version"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '请根据您的程序需求选择版本' }]" class="pl-4rem"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle, useMessage } from '@/hooks/tools'
import { assembBatchParams, assembBatchResults, openResultView } from '@/public'
import { openResultDialog } from '@/views/site/useController'
import { batchPhpVersion, getPhpVersion, modifyProjectAsync, setSitePhpVersionMultiple } from '@api/site'
import { useSiteStore } from '@site/useStore'

const Message = useMessage() // 消息提示

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const { isRefreshList, batchConfig } = useSiteStore()

const formRef = ref<any>() // 表单ref
const form = reactive({
	selectValue: '', // php版本
})
const rules = reactive({
	selectValue: [{ required: true, message: '请选择PHP版本', trigger: 'change' }],
})
const phpList = ref<any>([])

const onConfirm = async (close: any) => {
	let load: any
	try {
		await formRef.value.validate()
		load = Message.load('正在调整php版本，请稍后...')
		// let arr: any = []
		// let resultArr: any = []

		let asyncList = []
		const otherList = props.compData.filter((item: any) => item?.project_config?.type !== 'PHPMOD')

		props.compData.forEach((item: any) => {
			if (item?.project_config?.type === 'PHPMOD') {
				asyncList.push({ name: item.name, msg: '异步项目不支持', status: false })
			}
		})

		const { enable, exclude } = batchConfig.value

		const params = assembBatchParams(otherList, exclude, enable, { params: { project_type: 'PHP', version: form.selectValue } })
		const res: any = await batchPhpVersion(params)

		const { data } = assembBatchResults(res.data)
		openResultView(data, { title: '设置php版本' })

		close()
		isRefreshList.value = true

		// 获取异步项目
		// const syncArr: any = props.compData.filter((item: a  ny) => item?.project_config?.type === 'PHPMOD')

		// if (syncArr.length) {
		// 	if (form.selectValue == '00') {
		// 		syncArr.forEach((item: any) => {
		// 			resultArr.push({
		// 				name: item.name,
		// 				status: false,
		// 				msg: '异步项目不支持',
		// 			})
		// 		})
		// 	} else {
		// 		const promises = syncArr.map(async (item: any) => {
		// 			const res2 = await modifyProjectAsync({
		// 				site_name: item.name,
		// 				...item.project_config,
		// 				php_version: form.selectValue,
		// 			})
		// 			return {
		// 				name: item.name,
		// 				status: res2.status,
		// 				msg: res2.msg,
		// 			}
		// 		})
		// 		const results = await Promise.all(promises)
		// 		resultArr.push(...results)
		// 	}
		// }
		// Object.keys(res.error).forEach((item: any) => {
		// 	resultArr.push({
		// 		name: item,
		// 		status: false,
		// 	})
		// })
		// res.success.forEach((item: any) => {
		// 	resultArr.push({
		// 		name: item,
		// 		status: true,
		// 	})
		// })
		// openResultDialog({
		// 	title: '批量设置php版本',
		// 	resultTitle: '设置php版本',
		// 	resultData: resultArr,
		// })
		// close()
		// isRefreshList.value = true
	} catch (error) {
		console.log(error)
	} finally {
		load?.close()
	}
}

/**
 * @description 获取php版本列表
 */
const getPHPVersionList = async () => {
	await useDataHandle({
		request: getPhpVersion(),
		data: [Array, phpList],
	})
	form.selectValue = phpList.value[0]?.version || ''
}

defineExpose({
	onConfirm,
})

onMounted(() => {
	getPHPVersionList()
})
</script>

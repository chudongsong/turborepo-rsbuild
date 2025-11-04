<template>
	<div class="p-2rem">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="到期时间" prop="edate">
				<div class="flex items-center">
					<bt-date-picker v-model="form.edate" value-format="YYYY-MM-DD" :disabled-date="disabledDate" class="date" @change="timeChangeEvent" type="date" placeholder="选择日期"></bt-date-picker>
					<el-button type="default" class="!ml-[.4rem]" @click="setPermanent"> 设为永久 </el-button>
				</div>
			</el-form-item>
		</el-form>
		<div v-if="form.edate" class="text-tertiary mt-[8px] ml-10rem">* 到期当天24点后过期</div>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { setDockerSiteEdate } from '@api/docker'
import { openResultDialog } from '@docker/views/docker-site/useController'
import { getDockerStore } from '@docker/useStore'

const Message = useMessage()

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const { rowData, siteType } = props.compData

const isMult = Array.isArray(rowData) ? true : false

const { refreshSiteTable } = getDockerStore()

const emit = defineEmits(['close'])

const formRef = ref() // 表单ref
const form = reactive({
	edate: rowData.edate || '',
}) // 表单数据
const rules = {
	// edate: [{ required: true, message: '请选择到期时间', trigger: 'blur' }],
} // 表单验证规则

const disabledDate = (time: any) => {
	return time.getTime() < Date.now() - 8.64e7
}

/**
 * @description 设置永久
 */
const setPermanent = () => {
	form.edate = ''
	setTimeText()
	onConfirm()
}

/**
 * @description 设置时间选择文字信息，永久
 */
const setTimeText = () => {
	const dateDom = document.querySelector('.date .el-input__inner') as HTMLInputElement
	if (dateDom) dateDom.value = '永久'
	dateDom?.blur()
}

/**
 * @description 时间选择事件
 */
const timeChangeEvent = (val: any) => {
	if(!val){
		setTimeText()
	}
}

const onConfirm = async (close?: any) => {
	try {
		if (isMult) {
			let arr: any = []
			let resultArr: any = []
			// 循环获取选中的站点id
			rowData.forEach((item: any) => {
				arr.push(item.id)
			})
			const res: any = await setDockerSiteEdate({
				edate: !form.edate ? '0000-00-00' : form.edate,
				sites_id: arr,
			})
			Object.keys(res.error).forEach((item: any) => {
				resultArr.push({
					name: item,
					status: false,
				})
			})
			await res.success.forEach((item: any) => {
				resultArr.push({
					name: item,
					status: true,
				})
			})
			openResultDialog({
				title: '批量设置到期时间',
				resultTitle: '设置到期时间',
				resultData: resultArr,
			})
			refreshSiteTable()
			emit('close')
		} else {
			let loading = Message.load('正在设置到期时间，请稍后...')
			// 其他模块
			const res = await setDockerSiteEdate({
				id: rowData.id,
				edate: !form.edate ? '0000-00-00' : form.edate,
			})
			if (res.data.status) {
				{
					Message.request(res)
					refreshSiteTable()
				}
			} else Message.error(res.data.msg)
			loading.close()
			emit('close')
		}
	} catch (error) {
		console.log(error)
	} finally {
	}
}

defineExpose({
	onConfirm,
})

onMounted(() => {
	if (rowData.edate === '0000-00-00') {
		form.edate = ''
		nextTick(() => {
			setTimeText()
		})
	}
})
</script>

<style lang="css" scoped>
:deep(.el-input--small input.el-input__inner) {
	padding-left: 2.8rem !important;
}
</style>

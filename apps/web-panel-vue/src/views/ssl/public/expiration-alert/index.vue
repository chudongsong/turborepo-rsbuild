<template>
	<div class="p-2rem">
		<el-form ref="sslExpire" :disabled="formDisabled" :rules="rules" :model="form" label-width="100px">
			<el-form-item label="域名">
				<el-tooltip :content="form.domain" placement="top" popper-class="!max-w-[300px]">
					<el-input class="!w-[28rem]" v-model="form.domain" disabled />
				</el-tooltip>
			</el-form-item>
			<el-form-item label="证书">
				<el-tooltip :content="form.title" placement="top" popper-class="!max-w-[300px]">
					<el-input class="!w-[28rem]" v-model="form.title" disabled />
				</el-tooltip>
			</el-form-item>

			<el-form-item label="剩余天数" prop="cycle">
				<bt-input v-model="form.cycle" width="14rem" textType="天" min="1" type="number">
					<template #append> 天 </template>
				</bt-input>
			</el-form-item>
			<el-form-item label="总发送上限" prop="total">
				<bt-input v-model="form.total" width="14rem" textType="次" min="0" type="number">
					<template #append> 次 </template>
				</bt-input>
			</el-form-item>
			<el-form-item :label="'通知方式'" prop="sender">
				<bt-alarm-select v-model="form.sender" :limit="['sms']" class="!w-[28rem]" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { getSslStore } from '@ssl/useStore'
import { createReportTask, createReportTaskCert } from '@api/ssl'
import { useMessage } from '@hooks/tools/message'
import { resultDialog } from '@ssl/useMethod'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'
import { useDataHandle } from '@/hooks/tools'
import { getAlarmTaskList } from '@/api/global'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isMulti: false,
	}),
})

const emits = defineEmits(['close'])

const message = useMessage()

const {
	refs: { tabActive, isRefreshDomainList },
} = getSslStore()

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const sslExpire = ref<any>()
const formDisabled = ref<boolean>(false)

const form = reactive<any>({
	domain: '',
	title: '',
	cycle: 30,
	allSsl: false,
	total: 2,
	sender: [],
})

const rules = ref({
	cycle: [
		{ required: true, message: '请输入剩余天数', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('请输入大于0的正整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	total: [
		{ required: true, message: '请输入总发送上线', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				// 大于等于0的整数
				if (!/^\d+$/.test(value)) {
					callback(new Error('请输入大于等于0的正整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	sender: [
		{ required: true, message: '请选择通知方式', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 0) {
					callback(new Error('请选择通知方式'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

const onConfirm = async () => {
	try {
		// 触发表单校验
		const valid = await sslExpire.value.validate()
		if (!valid) {
			return
		}

		formDisabled.value = true
		if (!props.compData?.isMulti) {
			let params: any = {
				cycle: form.cycle,
				total: form.total,
				sender: form.sender.join(','),
			}
			if (tabActive.value === 'domain') {
				params.domain = form.domain
			} else {
				params.ssl_id = props.compData.ssl_id
			}
			const res = tabActive.value === 'domain' ? await createReportTask(params) : await createReportTaskCert(params)
			message.request(res)
			if (res.status) {
				if (tabActive.value === 'domain') {
					isRefreshDomainList.value = true
				} else {
					const refreshMap = {
						ssl: () => (sslIsRefresh.value = true),
						test: () => (testIsRefresh.value = true),
						encrypt: () => (encryptIsRefresh.value = true),
						other: () => (otherIsRefresh.value = true),
					} as const
					refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
				}
				emits('close')
			}
		} else {
			// 批量操作
			const resultArray: { name: string; status: boolean }[] = []
			const loadingMessage = message.load('正在批量设置告警...')

			for (const item of props.compData.data) {
				try {
					const params = {
						cycle: form.cycle,
						total: form.total,
						sender: form.sender.join(','),
						ssl_id: item.ssl_id,
					}
					const res = await createReportTaskCert(params)
					resultArray.push({
						name: item.title,
						status: res.status,
					})
				} catch (err) {
					resultArray.push({
						name: item.title,
						status: false,
					})
				}
			}

			loadingMessage.close()

			// 显示结果弹窗
			const resultColumn = [
				{
					label: '名称',
					prop: 'name',
				},
				{
					label: '结果',
					render: (row: any) => {
						const message = row.status ? '设置成功' : '设置失败'
						const className = row.status ? 'text-primary' : 'text-danger'
						return h('span', { class: className }, message)
					},
				},
			]

			resultDialog({
				resultData: resultArray,
				resultTitle: '设置告警',
				resultColumn,
			})

			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			emits('close')
		}
	} catch (error) {
		console.log(error)
	} finally {
		formDisabled.value = false
	}
}

const getSenderData = () => {
	useDataHandle({
		request: getAlarmTaskList(),
		success: ({ data }: any) => {
			const item = data.data.find((item: any) => item.id === props.compData.report_id)
			if (item) {
				form.sender = item.sender
				form.cycle = item.task_data.cycle
				form.total = item.number_rule.total
			}
		},
	})
}

onMounted(() => {
	if (tabActive.value === 'domain') {
		form.domain = props.compData.domain
	} else {
		if (!props.compData?.isMulti) {
			form.title = props.compData.title
			form.domain = props.compData.domainName.join(',')
		} else {
			form.title = props.compData.data.map((item: any) => item.title).join(',')
			form.domain = props.compData.data
				.map((item: any) => {
					// 如果 domainName 是 null 或空数组，返回空字符串
					if (!item.domainName || (Array.isArray(item.domainName) && item.domainName.length === 0)) {
						return ''
					}
					// 如果是数组，进行 join 操作
					return Array.isArray(item.domainName) ? item.domainName.join(',') : item.domainName
				})
				.filter((domain: any) => domain !== '') // 过滤掉空字符串
				.join(',')
		}
	}
	getSenderData()
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>

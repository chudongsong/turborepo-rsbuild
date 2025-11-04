<template>
	<el-form ref="formRef" :model="form" :rules="rules" label-width="150px">
		<div class="mb-12px font-bold text-medium text-default leading-28px">
			{{ !isEdit ? '添加发送任务' : '编辑发送任务' }}
		</div>
		<div ref="containerRef" class="flex min-h-654px" :style="{ height }">
			<div class="flex flex-col w-550px">
				<div class="form-card mb-16px pt-20px">
					<el-form-item label="发件人" prop="addresser">
						<sender-select v-model:value="form.addresser" @change="onUpdateAddr"></sender-select>
					</el-form-item>
					<el-form-item label="显示名称" prop="full_name">
						<div class="w-360px">
							<el-input v-model="form.full_name" placeholder="请输入显示名称" />
						</div>
					</el-form-item>
					<el-form-item label="邮件主题" prop="subject">
						<div class="w-360px">
							<el-input ref="subjectRef" v-model="form.subject" placeholder="请输入邮件主题" />
						</div>
					</el-form-item>
					<el-form-item label="收件人" prop="etypes">
						<type-select v-model:value="form.etypes" v-model:name="typeList"></type-select>
					</el-form-item>
					<el-form-item label="邮件模板" prop="temp_id">
						<template-select v-model:value="form.temp_id"></template-select>
					</el-form-item>
					<el-form-item label="保存到发件箱">
						<el-switch v-model="form.is_record" :active-value="1" :inactive-value="0" />
					</el-form-item>
					<el-form-item label="退订链接">
						<el-switch v-model="form.unsubscribe" :active-value="1" :inactive-value="0" />
						<el-button class="ml-16px" size="small" @click="onShowUnsubscribeSet">设置</el-button>
						<!-- <bt-link class="ml-16px" @click="onShowCase">查看案例</bt-link> -->
					</el-form-item>
					<el-form-item label="线程数" prop="threads">
						<el-radio-group v-model="form.threadsType">
							<el-radio :label="0">自动</el-radio>
							<el-radio :label="1">自定义</el-radio>
						</el-radio-group>
						<div v-show="form.threadsType === 1" class="w-[60px] ml-[24px]">
							<el-input-number class="!w-[60px]" v-model="form.threads" :min="1" :max="5" :controls="false" placeholder="输入线程数" />
						</div>
					</el-form-item>
				</div>
				<div class="form-card flex-1 py-[10px]">
					<el-form-item ref="startTimeRef" label="发送时间" prop="start_time">
						<el-radio-group v-model="form.pause" class="flex items-center" @change="onUpdatePause">
							<el-radio :label="0">立即发送</el-radio>
							<el-radio :label="1">
								<el-date-picker v-model="form.start_time" type="datetime" :disabled="form.pause === 0" clearable @change="onUpdateTime" />
							</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="备注">
						<div class="w-360px">
							<el-input v-model="form.remark" placeholder="请输入备注" />
						</div>
					</el-form-item>
					<el-form-item label="发送测试邮件">
						<div class="flex w-360px">
							<div class="flex-1 mr-10px">
								<el-input ref="mailToRef" v-model="form.mail_to" placeholder="请输入邮箱" />
							</div>
							<el-button @click="onSendTest">发送测试邮件</el-button>
						</div>
					</el-form-item>
				</div>
			</div>
			<div class="form-card flex flex-col items-center w-640px ml-16px pt-12px p-16px overflow-hidden">
				<div class="mb-12px">
					<el-form-item label="From: " :show-feedback="false" class="!mb-[0]" :label-style="{ fontWeight: 'bold' }">
						<div class="min-w-260px text-small">
							{{ form.addresser }}
						</div>
					</el-form-item>
					<el-form-item label="To: " :show-feedback="false" class="!mb-[0]" :label-style="{ fontWeight: 'bold' }">
						<div class="min-w-260px text-small">
							{{ typeList.length > 0 ? typeList.join(', ') : '--' }}
						</div>
					</el-form-item>
					<el-form-item label="Subject: " :show-feedback="false" class="!mb-[0]" :label-style="{ fontWeight: 'bold' }">
						<div class="min-w-260px text-small">
							{{ form.subject || '--' }}
						</div>
					</el-form-item>
				</div>
				<preview :id="form.temp_id"></preview>
			</div>
		</div>
		<div class="mt-[16px]">
			<el-button @click="onCancel">取消</el-button>
			<el-button type="primary" @click="onConfirm">确定</el-button>
		</div>
	</el-form>
</template>

<script lang="tsx" setup>
import { useGlobalStore } from '@/store/global'
import { getRandom } from '@/utils'
import { useDataHandle, useDialog } from '@hooks/tools'
import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { addSendTask, editSendTask, sendTestMail } from '@/api/mail'
import { useHeight } from './useHeight'
import { getNumber } from '@mail/useMethod'

import TemplateSelect from './template.vue'
import SenderSelect from './sender.vue'
import TypeSelect from './type.vue'
import Preview from './preview.vue'
import { productPaymentDialog } from '@/public'
import { tempId, taskShowVisible } from '../../useMethod'

interface Props {
	row?: any
	isEdit?: boolean
	refresh: () => void
}

const props = withDefaults(defineProps<Props>(), {
	isEdit: false,
	refresh: () => {},
})

const { refresh } = props

const show = defineModel<boolean>('show')

const { payment } = useGlobalStore()

const formRef = useTemplateRef('formRef')

const containerRef = useTemplateRef('containerRef')

const { height } = useHeight(containerRef)

const form = reactive({
	task_name: getRandom(12),
	addresser: null as string | null,
	full_name: '',
	subject: '',
	temp_id: tempId.value,
	is_record: 0,
	etypes: [] as number[],
	unsubscribe: 1,
	threadsType: 0,
	threads: 1,
	start_time: null as number | null,
	pause: 0,
	remark: '',
	mail_to: '',
})

const typeList = ref<string[]>([])

const rules: any = {
	full_name: {
		trigger: ['blur', 'input'],
		validator: () => {
			if (form.full_name === '') {
				return new Error('请输入显示名称')
			}
			return true
		},
	},
	subject: {
		trigger: ['blur', 'input'],
		validator: () => {
			if (form.subject === '') {
				return new Error('请输入邮件主题')
			}
			return true
		},
	},
	etypes: {
		trigger: 'change',
		validator: () => {
			if (form.etypes.length === 0) {
				return new Error('请选择联系人')
			}
			return true
		},
	},
	temp_id: {
		trigger: 'change',
		validator: () => {
			if (form.temp_id === null) {
				return new Error('请选择邮件模板')
			}
			return true
		},
	},
	start_time: {
		validator: () => {
			if (form.pause === 1 && form.start_time === null) {
				return new Error('请选择发送时间')
			}
			return true
		},
	},
}

const onUpdateAddr = (val: string | null) => {
	form.full_name = val || ''
}

const startTimeRef = useTemplateRef('startTimeRef')

const onUpdatePause = () => {
	nextTick(() => {
		startTimeRef.value?.restoreValidation()
	})
}

const onUpdateTime = () => {
	startTimeRef.value?.validate()
}

const onShowUnsubscribeSet = () => {
	useDialog({
		title: '退订设置',
		area: 45,
		component: defineAsyncComponent(() => import('./unsubscribe.vue')),
	})
}

const onShowCase = () => {
	useDialog({
		title: '退订链接案例',
		area: 55,
		component: () => <img> </img>,
	})
}

const subjectRef = useTemplateRef('subjectRef')

const mailToRef = useTemplateRef('mailToRef')

const onSendTest = async () => {
	if (form.subject === '') {
		subjectRef.value?.focus()
		Message.error('请输入邮件主题')
		return
	}
	if (form.mail_to === '') {
		mailToRef.value?.focus()
		Message.error('请输入测试邮箱')
		return
	}
	if (form.temp_id === null) {
		Message.error('请选择邮件模板')
		return
	}
	useDataHandle({
		loading: '正在发送...',
		request: sendTestMail({ mail_from: form.addresser || '', subject: form.subject, mail_to: form.mail_to, temp_id: form.temp_id || 0 }),
		message: true,
	})
}

const getParams = () => {
	return {
		task_name: form.task_name,
		addresser: form.addresser || '',
		full_name: form.full_name,
		subject: form.subject,
		temp_id: form.temp_id || 0,
		is_record: form.is_record,
		unsubscribe: form.unsubscribe,
		threads: form.threadsType === 0 ? 0 : form.threads,
		etypes: form.etypes.join(','),
		// pause: 0,
		start_time: form.pause === 0 ? Math.floor(new Date().getTime() / 1000) : Math.floor((form.start_time || 0) / 1000),
		remark: form.remark,
	}
}

const onCancel = () => {
	if (form.subject || form.etypes.length > 0) {
		useConfirm({
			title: '提示',
			content: '确定放弃当前编辑吗？',
			onConfirm: () => {
				show.value = false
			},
		})
	} else {
		show.value = false
	}
}

const onConfirm = async () => {
	await formRef.value?.validate()
	const params = getParams()
	const { isEdit, row } = props
	useDataHandle({
		loading: '正在保存...',
		request: isEdit && row ? editSendTask({ ...params, id: row.id }) : addSendTask(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				show.value = false
				refresh?.()
			}
		},
	})
}

const initForm = () => {
	const { row, isEdit } = props
	if (row) {
		if (isEdit) {
			form.task_name = row.task_name
		} else {
			form.task_name = `${row.task_name}_${getRandom(4)}`
		}
		form.addresser = row.addresser
		form.full_name = row.full_name
		form.subject = row.subject
		form.is_record = row.is_record
		form.unsubscribe = row.unsubscribe
		form.threadsType = row.threads === 0 ? 0 : 1
		form.threads = row.threads
		form.etypes = row.etypes.split(',').map(item => getNumber(item))
		if (row.start_time * 1000 > new Date().getTime()) {
			form.pause = 1
			form.start_time = row.start_time * 1000
		}
		form.temp_id = row.temp_id
		form.remark = row.remark
	}
}

onUnmounted(() => {
	tempId.value = null
	taskShowVisible.value = false
})

initForm()
</script>

<style lang="scss" scoped>
.form-card {
	border: 1px solid var(--el-color-border-dark-tertiaryer);
	border-radius: var(--el-border-radius-base);
}
</style>

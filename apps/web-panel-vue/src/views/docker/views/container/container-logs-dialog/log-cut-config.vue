<template>
	<div class="container-dialog">
		<el-form ref="manualFormRef" size="small" :model="configForm" :rules="manualRules" class="relative w-full" label-position="right" @submit.native.prevent>
			<el-form-item prop="name" label="切割路径">
				/var/lib/docker/containers/history_logs
				<span class="bt-link text-small ml-[1rem]" @click="dirEvent">打开目录</span>
			</el-form-item>

			<el-form-item prop="split_type" label="切割方式">
				<bt-radio v-model="configForm.split_type" :options="options" />
			</el-form-item>

			<el-form-item prop="split_hour" v-show="configForm.split_type === 'day'" label="执行时间">
				<div class="flex items-center">
					<bt-input prependText="每天" type="number" :min="0" :max="23" v-model="configForm.split_hour" class="!w-[18rem] mr-[1rem]" textType="时">
						<template #prepend>每天</template>
						<template #append>时</template>
					</bt-input>
					<el-form-item prop="split_minute" class="!mb-0" label="">
						<bt-input v-model="configForm.split_minute" class="!w-[14rem]" textType="分" type="number" :min="0" :max="59">
							<template #append>分</template>
						</bt-input>
					</el-form-item>
				</div>
			</el-form-item>

			<el-form-item prop="split_size" v-show="configForm.split_type === 'size'" label="日志大小">
				<bt-input v-model="configForm.split_size" class="!w-[15rem]" textType="MB" type="number" :min="0.1">
					<template #append>MB</template>
				</bt-input>
			</el-form-item>

			<el-form-item label="保留最新" prop="save">
				<bt-input v-model="configForm.save" class="!w-[12rem]" textType="份">
					<template #append>份</template>
				</bt-input>
			</el-form-item>
		</el-form>

		<ul class="tips mt-[1.6rem] list-square ml-[2rem]">
			<li v-show="configForm.split_type === 'day'">每5分钟执行一次</li>
			<li class="mt-[.5rem]" v-show="configForm.split_type === 'size'">【日志大小】：日志文件大小超过指定大小时进行切割日志文件</li>
			<li class="mt-[.5rem]">【保留最新】：保留最新的日志文件，超过指定数量时，将自动删除旧的日志文件</li>
		</ul>
	</div>
</template>
<script setup lang="ts">
import { setCookie } from '@utils/index'
import { setContainerCutLog } from '@/api/docker'
import { Message } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
interface Props {
	compData?: any
}

interface portListItem {
	host: string
	con: string
	type: string
	key: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const emits = defineEmits(['close'])

const config = ref<any>({})

// 表单
const configForm = reactive({
	split_type: 'size',
	split_hour: 2,
	split_minute: 0,
	save: '180',
	split_size: '10.00',
})
const manualFormRef = ref()

// 验证规则
const manualRules = {
	split_hour: [{ required: true, message: '请输入小时', trigger: 'blur' }],
	split_minute: [{ required: true, message: '请输入分钟', trigger: 'blur' }],
	save: [{ required: true, message: '请输入保留数量', trigger: 'blur' }],
	split_size: [{ required: true, message: '请输入日志大小', trigger: 'blur' }],
}

// 镜像列表
const options = [
	{ value: 'size', label: '按日志大小' },
	{ value: 'day', label: '按执行时间' },
]

/**
 * @description 目录
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
const dirEvent = async (row: any): Promise<void> => {
	// const res = await getContainerDir(row)
	// 跳转文件指定目录
	setCookie('Path', '/var/lib/docker/containers/history_logs')
	window.location.href = window.location.origin + '/files'
}

onMounted(() => {
	config.value = props.compData.data.value
	configForm.split_type = config.value.split_type
	configForm.split_size = config.value.split_size
	configForm.split_hour = config.value.split_hour
	configForm.split_minute = config.value.split_minute
	configForm.save = config.value.save
})

// 提交
const onConfirm = async () => {
	if (configForm.split_type === 'size') {
		if (Number(configForm.split_hour) < 0) {
			Message.error('请填写正确的大小')
			return
		}
	} else {
		if (Number(configForm.split_hour) > 23 || Number(configForm.split_hour) < 0) {
			Message.error('请填写正确的小时')
			return
		}
		if (Number(configForm.split_minute) > 59 || Number(configForm.split_minute) < 0) {
			Message.error('请填写正确的分钟')
			return
		}
	}
	if (Number(configForm.save) > 1800 || Number(configForm.save) < 0) {
		Message.error('请填写正确的保留份数（1-1800）')
		return
	}
	useDataHandle({
		loading: '正在设置...',
		request: setContainerCutLog({
			data: JSON.stringify({
				pid: props.compData.id,
				type: 'add',
				log_path: props.compData.path,
				split_type: configForm.split_type,
				split_size: configForm.split_size,
				split_hour: configForm.split_hour,
				split_minute: configForm.split_minute,
				save: configForm.save,
			}),
		}),
		message: true,
		success: ({ status }: { status: boolean }) => {
			if (status) {
				emits('close')
			}
		},
	})
}

defineExpose({
	onConfirm,
})
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col p-[1.6rem];
}
.el-form-item {
	@apply mb-[1.6rem];
}
:deep(.el-radio-group) {
	vertical-align: middle !important;
}
</style>

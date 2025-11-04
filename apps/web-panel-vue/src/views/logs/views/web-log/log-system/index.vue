<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-button @click="sendSource = true" type="primary"> 设置发送源 </el-button>
				<el-button @click="logSystemDialog = true">日志服务系统配置</el-button>
			</template>
			<template #content>
				<BtTable max-height="360" />
				<ul class="list-disc w-[50rem] pl-[1rem] mt-[12px] text-secondary">
					<li>注意：网站被访问后才会在日志服务系统中显示</li>
				</ul>
			</template>
		</bt-table-group>
		<bt-dialog title="设置发送源" v-model="sendSource" :show-footer="true" :area="[40]" @confirm="submitSource">
			<div class="p-[2rem]">
				<BtFormSource label-width="80px" />
			</div>
		</bt-dialog>
		<bt-dialog title="日志服务系统配置" v-model="logSystemDialog" :show-footer="true" :area="[40]" @confirm="submitSystem" @cancel="onCancel()">
			<div class="p-[2rem]">
				<BtFormSystem label-width="80px" />
				<ul class="list-disc mt-[20px] pl-[28px]">
					<li class="h-[2.4rem]">
						<bt-link href="https://www.bt.cn/bbs/thread-120054-1-1.html"> 如何配置日志服务系统 </bt-link>
					</li>
					<li>端口：日志服务收集端口，请在安装“日志服务系统”的机器通过 btlogs 8 获取</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>
<script lang="tsx" setup>
import BtInputNumber from '@/components/form/bt-input-number'
import { useForm, useTable } from '@/hooks/tools'
import { FormInput, FormSelect } from '@/hooks/tools/form/form-item'
import { useOperate } from '@/hooks/tools/table/column'
import { checkIp, checkPort } from '@/utils'
import { storeToRefs } from 'pinia'
import { delLogSource, siteList, submitLogSystemConfig, submitSendSource } from '../useController'
import { LOG_SITE_STORE } from '../useStore'

const store = LOG_SITE_STORE()
const { sForm, sendSource, logSystemDialog, logSystemForm, sourceForm, logSystemData, logSystemLoad, logSysForm, logSystemList } = storeToRefs(store)

const { getLogSystemData, getLogSystemSite, sendSourceConfirm } = store

const { BtForm: BtFormSystem, submit: submitSystem } = useForm({
	data: logSystemForm.value,
	options: (formData: any) => {
		return computed(() => [
			FormInput('IP', 'ip', {
				attrs: {
					placeholder: '日志服务系统的ip',
					clearable: true,
					class: '!w-22rem',
				},
				rules: [
					{
						required: true,
						validator: (rule: any, value: any, callback: any) => {
							if (!checkIp(value)) callback(new Error('请输入正确的IP'))
							callback()
						},
						trigger: ['blur', 'change'],
					},
				],
			}),
			FormInput('端口', 'port', {
				attrs: {
					placeholder: '请输入端口号',
					clearable: true,
					'controls-position': 'right',
					class: '!w-22rem',
					type: 'number',
				},
				rules: [
					{
						required: true,
						validator: (rule: any, value: any, callback: any) => {
							if (!checkPort(value) || !value) callback(new Error('请输入正确的端口(范围为1-65535)'))
							callback()
						},
						trigger: ['blur', 'change'],
					},
				],
			}),
		])
	},
	submit: async (params: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		return await submitLogSystemConfig(params.value)
	},
})

const sourceData = ref({
	site: [],
	ip: logSystemForm.value.port ? logSystemForm.value.ip + ':' + logSystemForm.value.port : '未配置',
})

watch(
	logSystemForm,
	(val: any) => {
		logSystemList.value[0].ip
		sourceData.value.ip = val.port ? val.ip + ':' + val.port : '未配置'
	},
	{
		deep: true,
	}
)

const { BtForm: BtFormSource, submit: submitSource } = useForm({
	data: sourceData.value,
	options: (formData: any) => {
		return computed(() => [
			FormSelect('网站', 'site', siteList.value, {
				attrs: { multiple: true, collapseTags: true, class: '!w-22rem' },
				rules: [{ required: true, message: '请选择网站', trigger: 'change' }],
			}),
			FormInput('日志系统', 'ip', {
				attrs: { disabled: true, class: '!w-22rem' },
			}),
		])
	},
	submit: async (params: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		return await submitSendSource({
			...params.value,
			server_id: logSystemList.value.length ? logSystemList.value[0].id : '',
		})
	},
})

const onCancel = () => {
	logSystemDialog.value = false
	logSystemLoad.value = false
	if (logSystemList.value.length > 0) {
		Object.assign(logSystemForm.value, logSystemList.value[0])
	}
}

const { BtTable } = useTable({
	request: getLogSystemData,
	columns: [{ label: '已设置站点', prop: 'site_name' }, useOperate([{ onClick: delLogSource, title: '删除' }])],
})

onMounted(() => {
	getLogSystemSite()
})
</script>
<style lang="css" scoped>
:deep(.el-input-number .el-input input) {
	text-align: left;
}
</style>

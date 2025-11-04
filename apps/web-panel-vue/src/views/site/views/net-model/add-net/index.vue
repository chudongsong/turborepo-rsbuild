<template>
	<BtForm class="p-[20px]" label-width="100px">
		<template #project_path>
			<el-form-item label="运行路径" prop="project_path">
				<bt-input width="32rem" :disabled="isEdit" v-model="param.project_path" placeholder="项目的运行路径">
					<template v-if="!isEdit" #append>
						<bt-button @click="onPathChange">
							<bt-icon icon="el-folder-opened" class="cursor-pointer" />
						</bt-button>
					</template>
				</bt-input>
			</el-form-item>
		</template>
		<template #port>
			<el-form-item label="项目端口" prop="port">
				<div class="flex items-center">
					<bt-input width="20rem" type="number" class="mr-[12px]" v-model="param.port" placeholder="项目真实端口"></bt-input>
					<el-checkbox v-model="param.release_firewall" v-if="!isEdit">
						放行端口
						<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right">
							<i class="svgtofont-el-question-filled text-warning"></i>
						</el-tooltip>
					</el-checkbox>
				</div>
			</el-form-item>
		</template>
		<template #dotnet_version>
			<el-form-item label="Net版本" prop="dotnet_version">
				<div class="flex items-center">
					<div class="flex items-center custom-refresh-select">
						<bt-select v-model="param.dotnet_version" :disabled="!versionData.length || isEdit" :options="versionData" class="!w-[16rem]" />
						<div class="el-input-group__append !h-3rem !flex items-center">
							<bt-button title="刷新Net版本" class="!flex" @click="getVersion(true)">
								<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
							</bt-button>
						</div>
					</div>
					<bt-link class="ml-[8px]" @click="openVersionPlugin">版本管理</bt-link>
				</div>
			</el-form-item>
		</template>
		<template #other>
			<el-form-item label="开机启动">
				<el-checkbox v-model="param.is_power_on"> 是否设置开机自动启动（默认自带守护进程每120秒检测一次） </el-checkbox>
			</el-form-item>
			<el-form-item label="启动用户">
				<div class="flex items-center">
					<bt-select
						v-model="param.run_user"
						class="mr-[8px] !w-[16rem]"
						:options="[
							{ label: 'www', value: 'www' },
							{ label: 'root', value: 'root' },
						]"></bt-select>
				</div>
			</el-form-item>
			<el-form-item label="项目备注">
				<bt-input width="32rem" v-model="param.project_ps" placeholder="输入项目备注，非必填"></bt-input>
			</el-form-item>
			<el-form-item label=" " v-if="isEdit">
				<el-button type="primary" @click="submit">保存配置</el-button>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { defaultVerify, portVerify } from '@/utils'
import { getVersion, addNetSite, inputCmd, netAddForm, initNetAddForm, $resetNetAddForm, isEdit, versionData, onPathChange, openVersionPlugin } from '../useController'

const { BtForm, submit, param } = useForm({
	data: netAddForm.value,
	options: (formData: any) => {
		return computed(() => [
			{
				type: 'input',
				label: '项目名称',
				key: 'project_name',
				attrs: {
					class: '!w-[32rem]',
					placeholder: '请输入项目名称',
				},
				rules: [defaultVerify({ message: '请输入项目名称' })],
			},
			{
				type: 'slots',
				key: 'project_path',
				rules: {
					project_path: [defaultVerify({ message: '请输入项目路径' })],
				},
			},
			{
				type: 'input',
				label: '启动命令',
				key: 'project_cmd',
				attrs: {
					class: '!w-[32rem]',
					placeholder: '请输入项目的启动命令',
					onInput: val => inputCmd(val),
				},
				rules: [defaultVerify({ message: '请输入项目执行命令' })],
			},
			{
				type: 'slots',
				key: 'port',
				rules: {
					port: [portVerify()],
				},
			},
			{
				type: 'slots',
				key: 'dotnet_version',
				rules: {
					dotnet_version: [defaultVerify({ message: '请选择Net版本' })],
				},
			},
			{
				type: 'slots',
				key: 'other',
			},
		])
	},
	submit: addNetSite,
})

onMounted(initNetAddForm)

onUnmounted($resetNetAddForm)

defineExpose({
	onConfirm: submit,
	init: initNetAddForm,
})
</script>

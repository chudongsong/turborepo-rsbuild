<template>
	<div>
		<BtForm label-width="100px" class="mt-2rem">
			<template #custom>
				<el-form-item label="项目域名" prop="domain">
					<bt-input :disabled="isEdit" @input="changeName" width="32rem" v-model="javaAddForm.domain" placeholder="请输入项目域名"></bt-input>
				</el-form-item>
				<el-form-item label="项目路径" prop="project_path">
					<bt-input-icon v-model="javaAddForm.project_path" icon="el-folder-opened" @icon-click="onPathChange" width="32rem" />
				</el-form-item>
				<el-form-item label="Tomcat版本" prop="tomcat_version">
					<div class="flex items-center">
						<el-select v-model="javaAddForm.tomcat_version" class="mr-8px !w-[16rem]" :disabled="!projectData.tomcat_list.length || isEdit">
							<el-option v-for="(item, index) in projectData.tomcat_list" :key="index" :value="item.version" :label="item.name"></el-option>
						</el-select>
						<bt-link v-if="!isEdit" @click="openJdkView('newTomCat')">安装Tomcat其他版本</bt-link>
					</div>
				</el-form-item>
				<el-form-item label="项目备注">
					<bt-input width="32rem" v-model="javaAddForm.project_ps" placeholder="输入项目备注，非必填"></bt-input>
				</el-form-item>
				<el-form-item label=" " v-if="isEdit">
					<el-button type="primary" @click="submit">保存当前配置</el-button>
				</el-form-item>
			</template>
		</BtForm>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { addJavaSite, openJdkView } from '@/views/site/views/java-model/useController'
import { fileSelectionDialog } from '@/public'
import { isEdit } from '../useController'
import { useSiteStore } from '@site/useStore'
import { defaultVerify, swapString } from '@/utils'

interface Props {
	projectData: any
	editForm?: any
}
const props = withDefaults(defineProps<Props>(), {
	projectData: {},
})
const { siteInfo } = useSiteStore()

const javaAddForm = ref<any>({
	project_type: 1, // 项目类型
	project_path: '/www/wwwroot/', // 项目名称
	tomcat_version: props?.projectData?.tomcat_list[0]?.version || '', // tomcat版本
	project_ps: '', // 项目备注
	domain: '', // 项目域名
	use_project_watch: false, // 是否使用项目监控
	run_user: 'www', // 项目用户
})

const changeName = (val: string) => {
	javaAddForm.value.project_ps = val
	javaAddForm.value.project_path = `/www/wwwroot/${val}`
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'all',
		path: javaAddForm.value.project_path,
		change: (path: string) => {
			javaAddForm.value.project_path = path
			let str = path.substring(path.lastIndexOf('/') + 1).replace(/\W/g, '_')
			if (!javaAddForm.value.domain) javaAddForm.value.domain = str
			javaAddForm.value.project_ps = str
		},
	})
}

watch(
	() => props.projectData.tomcat_list.length,
	() => {
		if (javaAddForm && !isEdit.value) javaAddForm.value.tomcat_version = props.projectData.tomcat_list[0]?.version
	},
	{ immediate: true, deep: true }
)

const { BtForm, submit } = useForm({
	data: javaAddForm.value,
	options: [
		{
			type: 'slots',
			key: 'custom',
			rules: {
				domain: [defaultVerify({ message: '请输入项目域名' })],
				project_path: [defaultVerify({ message: '请输入项目路径' })],
				tomcat_version: [defaultVerify({ message: '请选择tomcat版本', trigger: 'change' })],
			},
		},
	],
	submit: async (param: any, validate: any) => {
		await validate()
		let params: any = { ...param.value }
		if (isEdit.value) {
			params.project_jar = ''
			params.project_cmd = ''
			params.project_jdk = ''
			delete params.jmx_info, params.log_conf
			delete params.logs, params.scripts
		}
		return addJavaSite(params, '内置项目')
	},
})

onMounted(() => {
	if (isEdit.value) {
		const { project_config, ps, use_project_watch, path } = siteInfo.value
		Object.assign(javaAddForm.value, {
			...project_config,
			domain: project_config.project_name,
			project_path: path,
			is_separation: project_config.is_separation === 1,
			project_ps: swapString(ps),
			debug: 0,
			use_project_watch,
			run_user: 'www',
			release_firewall: false,
			project_type: 1,
			jmx_status: false,
		})
	}
})

defineExpose({
	onConfirm: submit,
})
</script>

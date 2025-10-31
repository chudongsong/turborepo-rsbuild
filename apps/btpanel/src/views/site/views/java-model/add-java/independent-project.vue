<template>
	<div>
		<BtForm label-width="100px" class="mt-[2rem]">
			<template #custom>
				<el-form-item label="项目域名" prop="domain">
					<bt-input :disabled="isEdit" width="36rem" @input="changeName" v-model="javaAddForm.domain" placeholder="请输入项目域名"></bt-input>
				</el-form-item>
				<el-form-item label="项目路径" prop="project_path">
					<bt-input width="36rem" :disabled="isEdit" v-model="javaAddForm.project_path">
						<template v-if="!isEdit" #append>
							<bt-button @click="onPathChange">
								<bt-icon icon="el-folder-opened" class="cursor-pointer" />
							</bt-button>
						</template>
					</bt-input>
				</el-form-item>
				<el-form-item label="Tomcat版本" prop="tomcat_version">
					<div class="flex items-center">
						<el-select v-model="javaAddForm.tomcat_version" class="mr-[8px] !w-[20rem]" :disabled="isEdit">
							<el-option v-for="(item, index) in projectData.tomcat_list" :key="index" :value="item.version" :label="item.name"></el-option>
						</el-select>
						<bt-link v-if="!isEdit" @click="openJdkView('newTomCat')">安装Tomcat其他版本</bt-link>
					</div>
				</el-form-item>
				<el-form-item label="项目端口" prop="port">
					<div class="flex items-center">
						<bt-input width="20rem" type="number" @blur="checkPortUse" @change="resetChange" class="mr-[12px]" v-model="javaAddForm.port" placeholder="选择项目文件，自动获取端口"></bt-input>
						<el-checkbox v-model="javaAddForm.release_firewall" v-if="!isEdit">
							放行端口
							<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right"> <i class="svgtofont-el-question-filled text-warning"></i> </el-tooltip
						></el-checkbox>
					</div>
				</el-form-item>
				<el-form-item label="项目用户">
					<div class="flex items-center">
						<el-select v-model="javaAddForm.run_user" class="mr-[8px] !w-[20rem]" @change="resetChange"><el-option v-for="item in projectData.userList" :key="item" :value="item" :label="item"></el-option></el-select>
						<span class="text-small text-secondary">* 无特殊需求请选择www用户</span>
					</div>
				</el-form-item>
				<el-form-item label="项目JDK" prop="project_jdk">
					<div class="flex items-center custom-refresh-select">
						<el-select v-model="javaAddForm.project_jdk" class="!w-[36rem]" @change="resetChange"><el-option v-for="(item, index) in projectData.jdk_info" :key="index" :value="item.path" :label="item.name + '[' + item.path + ']'"></el-option> </el-select>
						<div class="el-input-group__append !h-3rem !flex items-center">
							<bt-button title="刷新项目JDK" class="!flex" @click="getSystemInfoEvent('项目JDK')">
								<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
							</bt-button>
						</div>
					</div>
					<bt-link class="ml-8px" @click="openJdkView()">添加JDK信息</bt-link>
				</el-form-item>
				<el-form-item label="开机启动">
					<el-checkbox v-model="javaAddForm.auth">是否设置开机自动启动（默认自带守护进程每120秒检测一次）</el-checkbox>
				</el-form-item>
				<el-form-item label="项目备注">
					<bt-input width="36rem" v-model="javaAddForm.project_ps" placeholder="输入项目备注，非必填"></bt-input>
				</el-form-item>
				<el-form-item label=" " v-if="isEdit">
					<el-button type="primary" @click="submit">保存当前配置</el-button>
				</el-form-item>
			</template>
		</BtForm>
	</div>
</template>

<script setup lang="tsx">
import { advanceCheckPort } from '@/api/site'
import { useConfirm, useForm, useMessage } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { useSiteStore } from '@site/useStore'
import { addJavaSite, openJdkView } from '@site/views/java-model/useController'
import { isEdit } from '../useController'
import { defaultVerify, isString, portVerify, swapString } from '@/utils'

interface Props {
	projectData: any
	editForm?: any
}
const props = withDefaults(defineProps<Props>(), {
	projectData: {},
})

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()

let resetTip = false // 重启提示

const javaAddForm = ref({
	project_path: '/www/wwwroot', // 项目jar路径
	project_jdk: props?.projectData?.jdk_info[0]?.path || '', // 项目jdk
	use_project_watch: false, // 监听重启
	project_ps: '', // 项目备注
	domain: '', // 绑定域名
	release_firewall: false, // 放行端口
	tomcat_version: props?.projectData?.tomcat_list[0]?.version || '', // tomcat版本
	port: '', // 项目端口
	run_user: 'root', // 项目用户
	auth: false, // 开机启动
	// access_mode: 'domain', // tomcat访问模式
})

const getSystemInfoEvent = inject('getSystemInfoEvent', (refreshStr: string) => {})

const changeName = (val: string) => {
	if (!isEdit.value) {
		javaAddForm.value.project_ps = val
		javaAddForm.value.project_path = `/www/wwwroot/${val}`
	}
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: javaAddForm.value.project_path,
		change: (path: string) => {
			javaAddForm.value.project_path = path
			let str = path.substring(path.lastIndexOf('/') + 1)?.replace(/\./g, '_')
			if (!javaAddForm.value.domain) javaAddForm.value.domain = str
			javaAddForm.value.project_ps = str
		},
	})
}
const resetChange = () => {
	resetTip = true
}

/**
 * 检查端口是否被占用
 */
const checkPortUse = async () => {
	if (!javaAddForm.value.port) return
	try {
		const res = await advanceCheckPort({ port: javaAddForm.value.port }, 'java')
		if (!res.status) {
			Message.request(res)
			javaAddForm.value.port = '' // 清空端口
		}
	} catch (error) {
		console.log(error)
	}
}

watch(
	() => props.projectData.tomcat_list.length,
	() => {
		if (javaAddForm && !isEdit.value) javaAddForm.value.tomcat_version = props.projectData.tomcat_list[0]?.version
	},
	{ immediate: true, deep: true }
)

watch(
	() => props.projectData.jdk_info.length,
	() => {
		if (javaAddForm && !isEdit.value) javaAddForm.value.project_jdk = props.projectData.jdk_info[0]?.path
	},
	{ immediate: true, deep: true }
)

const { BtForm, submit } = useForm({
	data: javaAddForm.value,
	options: () =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					domain: [defaultVerify({ message: '请输入项目域名' })],
					project_path: [defaultVerify({ message: '请输入项目路径' })],
					tomcat_version: [defaultVerify({ message: '请选择tomcat版本', trigger: 'change' })],
					port: [defaultVerify({ message: '请输入端口号', trigger: 'blur' }), portVerify()],
					project_jdk: [defaultVerify({ message: '请输入项目JDK' })],
				},
			},
		]),
	submit: async (param: any, validate: any) => {
		await validate()
		let params: any = {
			...param.value,
			project_type: 2,
		}
		if (isEdit.value) {
			resetTip &&
				(await useConfirm({
					title: `提示`,
					width: '35rem',
					icon: 'warning-filled',
					content: `更改后会重启Tomcat，是否继续？`,
				}))
			resetTip = false
			params.project_jar = ''
			params.debug = param.value.debug ? 1 : 0
			delete params.jmx_info, params.log_conf
			delete params.logs, params.scripts
		}
		return addJavaSite(params, '独立项目')
	},
})

onMounted(() => {
	if (isEdit.value) {
		const { project_config, ps, use_project_watch, path } = siteInfo.value
		Object.assign(javaAddForm.value, {
			...project_config,
			domain: project_config.project_name,
			project_path: path,
			project_jdk: project_config.project_jdk + '/bin/java',
			run_user: project_config.run_user,
			is_separation: project_config.is_separation === 1,
			debug: 0,
			use_project_watch,
			release_firewall: false,
			project_ps: swapString(ps),
			host_url: 'http://127.0.0.1:' + project_config.port,
			jmx_status: false,
		})
	}
})

defineExpose({
	onConfirm: submit,
})
</script>

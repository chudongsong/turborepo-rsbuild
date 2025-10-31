<template>
	<div>
		<BtForm label-width="100px" class="mt-[2rem]">
			<template #custom>
				<div class="flex items-center">
					<el-form-item label="项目路径" prop="project_path">
						<bt-input width="30rem" :disabled="isEdit" v-model="javaAddForm.project_path">
							<template v-if="!isEdit" #append>
								<bt-button @click="onPathChange">
									<bt-icon icon="el-folder-opened" class="cursor-pointer" />
								</bt-button>
							</template>
						</bt-input>
					</el-form-item>
					<!-- <el-form-item label="文件类型" label-width="80px" prop="file_type">
						<el-select v-model="fileType" class="!w-[10rem]" :disabled="isEdit">
							<el-option v-for="(item, index) in fileTypeList" :key="index" :value="item.value" :label="item.label"></el-option>
						</el-select>
					</el-form-item> -->
				</div>
				<el-form-item v-if="!isEdit" label="项目名称" prop="project_name">
					<div class="flex items-center justify-between">
						<bt-input @change="changeName" width="36rem" v-model="javaAddForm.project_name" placeholder="选择项目文件，自动获取名称"></bt-input>
					</div>
				</el-form-item>
				<el-form-item v-if="!isEdit" label="绑定域名" prop="domains">
					<el-popover placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
						<div class="!p-[12px] bg-primary text-white">如果需要绑定外网，请输入需要绑定的域名，该选项可为空<br />如需填写多个域名，请换行填写，每行一个域名，默认为80端口<br />泛解析添加方法 *.domain.com<br />如另加端口格式为 www.domain.com:88</div>
						<template #reference>
							<bt-input
								:rows="4"
								resize="none"
								width="40rem"
								v-model="javaAddForm.domains"
								type="textarea"
								@focus="popoverFocus = true"
								:placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'" />
						</template>
					</el-popover>
				</el-form-item>
				<!-- <el-form-item v-if="!isEdit" label="访问路由" prop="proxy_dir">
					<div class="flex items-center">
						<bt-input :disabled="isEdit" width="36rem" v-model="javaAddForm.proxy_dir" placeholder="全局Tomcat必须指定，默认为项目名">
							<template #prepend>
								<div class="max-w-[20rem] truncate" :title="prependDomain">{{ prependDomain }}</div>
							</template>
						</bt-input>
					</div>
				</el-form-item>
				<el-form-item v-if="!isEdit" label="后端路由" prop="target_dir">
					<bt-input :disabled="true" width="36rem" :value="targetDirName" @input="inputTargetDir" placeholder="请输入到达地址"></bt-input>
				</el-form-item> -->
				<!-- <span v-if="!isEdit" class="mb-[18px] ml-[122px] block text-warning">{{ urlTips }}</span> -->
				<el-form-item label="Tomcat版本" prop="tomcat_version">
					<div class="flex items-center">
						<el-select v-model="javaAddForm.tomcat_name" class="mr-[8px] !w-[20rem]" :disabled="isEdit" @change="getTomcatInfo">
							<el-option v-for="(item, index) in projectData.tomcat_list" :key="index" :value="item.name">
								<div class="flex items-center justify-between">
									<span>{{ item.name }}</span>
									<span class="text-tertiary">{{ item.path.includes('/www/server/bt_tomcat_web') ? '独立Tomcat' : '全局Tomcat' }}</span>
								</div>
							</el-option>
						</el-select>
						<bt-link @click="openJdkView('newTomCat')">安装/管理Tomcat</bt-link>
					</div>
				</el-form-item>
				<el-form-item label="Tomcat端口" prop="port">
					<div class="flex items-center">
						<bt-input width="20rem" type="number" @change="resetChange" class="mr-[12px]" v-model="javaAddForm.port" placeholder="选择Tomcat版本，自动获取端口"></bt-input>
						<!-- <el-checkbox v-model="javaAddForm.release_firewall" v-if="!isEdit">
							放行端口
							<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right"> <i class="svgtofont-el-question-filled text-warning"></i> </el-tooltip
						></el-checkbox> -->
					</div>
				</el-form-item>
				<el-form-item label="项目备注">
					<bt-input width="36rem" v-model="javaAddForm.project_ps" placeholder="输入项目备注，非必填"></bt-input>
				</el-form-item>
				<el-form-item label=" " v-if="isEdit">
					<el-button type="primary" @click="onConfirm">保存当前配置</el-button>
				</el-form-item>
			</template>
		</BtForm>
	</div>
</template>

<script setup lang="tsx">
import { advanceCheckPort, getTomcatVersion } from '@/api/site'
import { useConfirm, useDataHandle, useForm, useMessage } from '@/hooks/tools'
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
	project_ps: '', // 项目备注
	release_firewall: false, // 放行端口
	tomcat_version: props?.projectData?.tomcat_list[0]?.version || '', // tomcat版本
	port: '', // 项目端口
	project_name: '', // 项目名称
	domains: '', // 绑定域名
	proxy_dir: '/', // 访问地址
	target_dir: '/', // 到达地址
	tomcat_name: props?.projectData?.tomcat_list[0]?.name || '', // tomcat名称
	run_user: '', // 运行用户
	use_project_watch: false, // 是否使用项目监控
	// access_mode: 'domain', // tomcat访问模式
})

const popoverFocus = ref<boolean>(false) // 域名绑定提示框

const fileType = ref('file')

// 文件类型
const fileTypeList = ref([
	{
		label: '.war',
		value: 'file',
	},
	{
		label: '文件夹',
		value: 'dir',
	},
])

const prependDomain = computed(() => {
	if (javaAddForm.value.domains) {
		// 如果有域名，获取第一个域名（如果有多个域名，以换行分隔）
		const firstDomain = javaAddForm.value.domains.split('\n')[0].trim()
		return `http://${firstDomain}`
	}
	return 'http://域名'
})

// const urlTips = computed(() => {
// 	let text = `当前浏览器请求：${prependDomain.value}${javaAddForm.value.proxy_dir}，请求会被代理到服务器上的：${targetDirName.value}`
// 	return text
// })

const getSystemInfoEvent = inject('getSystemInfoEvent', (refreshStr: string) => {})

const changeName = (val: string) => {
	if (!isEdit.value) {
		javaAddForm.value.project_ps = val
		javaAddForm.value.target_dir = `/${val}`
		// 若项目路径为 /www/wwwroot/ 或者 /www/wwwroot 时，自动填充到项目路径
		if (javaAddForm.value.project_path === '/www/wwwroot' || javaAddForm.value.project_path === '/www/wwwroot/') {
			javaAddForm.value.project_path = `/www/wwwroot/${val}`
		}
	}
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
			let str = path.substring(path.lastIndexOf('/') + 1).split('.')[0]
			javaAddForm.value.project_ps = str
			if (!isEdit.value) {
				javaAddForm.value.project_name = str
				inputTargetDir(str)
			}
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

const { BtForm, validate, param } = useForm({
	data: javaAddForm.value,
	options: () =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					project_path: [defaultVerify({ message: '请输入项目路径' })],
					tomcat_version: [defaultVerify({ message: '请选择tomcat版本', trigger: 'change' })],
					port: [defaultVerify({ message: '请输入端口号', trigger: 'blur' }), portVerify()],
					project_name: [defaultVerify({ message: '请输入项目名称' })],
					domains: [defaultVerify({ message: '请输入项目域名' })],
					proxy_dir: [defaultVerify({ message: '请输入访问地址' })],
					target_dir: [defaultVerify({ message: '请输入到达地址' })],
				},
			},
		]),
})

/**
 * @description: 获取tomcat版本信息
 */
const getTomcatInfo = async (name: string) => {
	const tomcatInfo = props.projectData.tomcat_list.find((item: any) => item.name === name)
	if (tomcatInfo) {
		// 获取tomcat版本
		javaAddForm.value.tomcat_version = tomcatInfo.version
		javaAddForm.value.run_user = tomcatInfo.user
		javaAddForm.value.port = tomcatInfo.port
	}
}

const targetDirName = computed(() => {
	return `http://127.0.0.1${javaAddForm.value.port ? `:${javaAddForm.value.port}` : ''}${javaAddForm.value.target_dir}`
})

const inputTargetDir = (val: string) => {
	javaAddForm.value.target_dir = val.charAt(0) === '/' ? val : '/' + val
}

/**
 * 判断路径是文件还是目录
 * @param path 文件路径
 * @returns 'file' | 'dir'
 */
const getPathType = (path: string) => {
	if (!path) return 'dir'

	// 检查是否以斜杠结尾
	if (/[/\\]$/.test(path)) return 'dir'

	// 检查是否是war或jar文件
	const lowercasePath = path.toLowerCase()
	if (lowercasePath.endsWith('.war') || lowercasePath.endsWith('.jar')) {
		return 'file'
	}

	// 其他情况默认为目录
	return 'dir'
}

const onConfirm = async () => {
	await validate()
	let params: any = {
		...param.value,
		domains: param.value.domains.split('\n'),
		project_type: 1,
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
	return addJavaSite(params, 'tomcat')
}

watch(
	() => props.projectData.tomcat_list.length,
	() => {
		if (javaAddForm && !isEdit.value) {
			javaAddForm.value.tomcat_name = props.projectData.tomcat_list[0]?.name
			javaAddForm.value.tomcat_version = props.projectData.tomcat_list[0]?.version
			javaAddForm.value.port = props.projectData.tomcat_list[0]?.port
			getTomcatInfo(props.projectData.tomcat_list[0]?.name)
		}
		if (siteInfo.value) {
			const { project_config } = siteInfo.value
			if (!project_config.tomcat_name && isEdit.value) {
				const tomcat = props.projectData.tomcat_list.find((item: any) => {
					return item.config_path === project_config.server_xml
				})
				if (tomcat) {
					javaAddForm.value.tomcat_name = tomcat.name
					javaAddForm.value.tomcat_version = tomcat.version
				}
			}
		}
	},
	{ immediate: true, deep: true }
)

onMounted(() => {
	if (isEdit.value) {
		const { project_config, ps, path } = siteInfo.value
		Object.assign(javaAddForm.value, {
			...project_config,
			domains: project_config.domains.join('\n'),
			project_path: path,
			project_name: project_config.project_name,
			is_separation: project_config.is_separation === 1,
			debug: 0,
			release_firewall: false,
			project_ps: swapString(ps),
			host_url: 'http://127.0.0.1:' + project_config.port,
			jmx_status: false,
			proxy_dir: project_config.proxy_dir,
			target_dir: project_config.target_dir,
		})
		fileType.value = getPathType(path)
	} else {
		fileType.value = 'dir'
	}
})

defineExpose({
	onConfirm,
})
</script>

<template>
	<div>
		<BtForm class="mt-2rem" label-width="100px">
			<template #custom>
				<div class="flex items-center">
					<el-form-item label="项目路径" prop="project_path">
						<!-- :disabled="isEdit" -->
						<bt-input width="30rem" v-model="javaAddForm.project_path">
							<template #append>
								<bt-button @click="onPathChange">
									<bt-icon icon="el-folder-opened" class="cursor-pointer" />
								</bt-button>
							</template>
						</bt-input>
						<el-button class="ml-[12px]" v-if="!isEdit" type="default" @click="openProject">接管原项目</el-button>
					</el-form-item>
					<!-- <el-form-item label="文件类型" label-width="80px" prop="file_type">
						<el-select v-model="fileType" class="!w-[10rem]">
							<el-option v-for="(item, index) in fileTypeList" :key="index" :value="item.value" :label="item.label"></el-option>
						</el-select>
					</el-form-item> -->
				</div>
				<el-form-item label="项目名称" prop="project_name">
					<div class="flex items-center justify-between">
						<bt-input @change="changeName" width="32rem" v-model="javaAddForm.project_name" :disabled="isEdit" placeholder="选择项目文件，自动获取名称"></bt-input>
					</div>
				</el-form-item>
				<el-form-item label="项目JDK" prop="project_jdk">
					<div class="flex items-center">
						<div class="flex items-center custom-refresh-select">
							<el-select v-model="javaAddForm.project_jdk" @change="changeJdk" class="!w-[32rem]" :disabled="!projectData.jdk_info">
								<el-option v-for="(item, index) in projectData.jdk_info" :key="index" :value="item.path" :label="item.name + '[' + item.path + ']'"></el-option>
							</el-select>
							<div class="el-input-group__append !h-3rem !flex items-center">
								<bt-button title="刷新项目JDK" class="!flex" @click="getSystemInfoEvent('项目JDK')">
									<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
								</bt-button>
							</div>
						</div>
						<bt-link class="ml-8px" @click="openJdkView()">添加JDK信息</bt-link>
					</div>
				</el-form-item>
				<el-form-item label="项目启动命令" prop="project_cmd">
					<bt-input @blur="changeCmdValue" width="40rem" type="textarea" :rows="4" resize="none" v-model="javaAddForm.project_cmd" placeholder="选择项目jar文件，自动获取项目执行命令"></bt-input>
				</el-form-item>
				<!-- 编辑时显示 -->
				<template v-if="isEdit">
					<el-form-item label="启动用户">
						<div class="flex items-center">
							<el-select v-model="javaAddForm.run_user" class="mr-8px !w-[16rem]">
								<el-option v-for="item in projectData.userList" :key="item" :value="item" :label="item"></el-option>
							</el-select>
							<!-- <span class="text-small text-secondary">* 无特殊需求请选择www用户</span> -->
						</div>
					</el-form-item>
					<el-form-item label="项目端口" prop="port">
						<div class="flex items-center">
							<bt-input type="number" @change="returnCmdEvent(1)" width="20rem" class="mr-[1rem]" v-model="javaAddForm.port" :placeholder="portPlace"></bt-input>
							<el-checkbox v-model="javaAddForm.release_firewall" v-if="!isEdit">
								放行端口
								<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right"> <i class="svgtofont-el-question text-warning"></i> </el-tooltip>
							</el-checkbox>
						</div>
					</el-form-item>
					<el-form-item label="环境变量">
						<el-radio-group v-model="envType">
							<el-radio :label="0">无</el-radio>
							<el-radio :label="1">指定变量</el-radio>
							<el-radio :label="2">从文件加载</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="envType !== 0" label=" ">
						<bt-input v-show="envType === 1" width="40rem" type="textarea" :rows="4" resize="none" v-model="javaAddForm.env" placeholder="环境变量，1行1个，例如： JAVA_HOME=/usr/local/btjdk/jdk8"></bt-input>
						<bt-input-icon v-show="envType === 2" width="40rem" v-model="javaAddForm.envPath" placeholder="请选择环境变量文件,如:项目路径/.xx.env" icon="el-folder-opened" @icon-click="onEnvFile" />
					</el-form-item>
					<el-form-item label="项目备注">
						<bt-input width="32rem" v-model="javaAddForm.project_ps" placeholder="输入项目备注，非必填"></bt-input>
					</el-form-item>
				</template>
				<!-- 新增时显示,代码分割 -->
				<BtSettingDivider :isShowDivider="!isEdit">
					<template v-if="!isEdit" #config>
						<el-form-item label="启动用户">
							<div class="flex items-center">
								<el-select v-model="javaAddForm.run_user" class="mr-8px !w-[16rem]">
									<el-option v-for="item in projectData.userList" :key="item" :value="item" :label="item"></el-option>
								</el-select>
								<!-- <span class="text-small text-secondary">* 无特殊需求请选择www用户</span> -->
							</div>
						</el-form-item>
						<el-form-item label="项目端口" prop="port">
							<div class="flex items-center">
								<bt-input type="number" @change="returnCmdEvent(1)" width="20rem" class="mr-[1rem]" v-model="javaAddForm.port" :placeholder="portPlace"></bt-input>
								<el-checkbox v-model="javaAddForm.release_firewall" v-if="!isEdit">
									放行端口
									<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right"> <i class="svgtofont-el-question text-warning"></i> </el-tooltip>
								</el-checkbox>
							</div>
						</el-form-item>
						<el-form-item label="环境变量">
							<el-radio-group v-model="envType">
								<el-radio :label="0">无</el-radio>
								<el-radio :label="1">指定变量</el-radio>
								<el-radio :label="2">从文件加载</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item v-show="envType !== 0" label=" ">
							<bt-input v-show="envType === 1" width="40rem" type="textarea" :rows="4" resize="none" v-model="javaAddForm.env" placeholder="环境变量，1行1个，例如： JAVA_HOME=/usr/local/btjdk/jdk8"></bt-input>
							<bt-input-icon v-show="envType === 2" width="40rem" v-model="javaAddForm.envPath" placeholder="请选择环境变量文件,如:项目路径/.xx.env" icon="el-folder-opened" @icon-click="onEnvFile" />
						</el-form-item>
						<!-- <el-form-item label="守护进程">
					<el-checkbox v-model="javaAddForm.daemon_status"> 项目意外停止时自动重启 </el-checkbox>
				</el-form-item>
				<el-form-item label="jmx监控">
					<el-checkbox v-model="javaAddForm.jmx_status" @change="returnCmdEvent(4)" :disabled="!javaAddForm.project_cmd"> 设置jmx后可在性能监控中查询项目性能信息 </el-checkbox>
				</el-form-item>
				<el-form-item label="监听重启">
					<el-checkbox v-model="javaAddForm.use_project_watch">是否设置监听文件发生变化时重启</el-checkbox>
				</el-form-item> -->
						<el-form-item label="绑定域名">
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
						<el-form-item label="后端路由" prop="proxy_dir">
							<div class="flex items-center">
								<bt-input :disabled="isEdit" width="40rem" v-model="javaAddForm.proxy_dir" placeholder="请输入访问地址">
									<template #prepend>
										<div class="max-w-[20rem] truncate" :title="prependDomain">{{ prependDomain }}</div>
									</template>
								</bt-input>
							</div>
						</el-form-item>
						<!-- <el-form-item label="后端路由" prop="target_dir">
							<bt-input :disabled="isEdit" width="40rem" v-model="javaAddForm.target_dir" placeholder="请输入到达地址">
								<template #prepend>
									<div class="max-w-[20rem] truncate" :title="prependDomainProxy">{{ prependDomainProxy }}</div>
								</template>
							</bt-input>
						</el-form-item> -->
						<span v-if="!isEdit" class="mb-[18px] ml-[122px] block text-warning">{{ urlTips }}</span>
						<el-form-item label="前端资源" prop="static_dir">
							<bt-input width="40rem" :disabled="isEdit" v-model="javaAddForm.static_dir">
								<template #append>
									<bt-button @click="onStaticDirChange">
										<bt-icon icon="el-folder-opened" class="cursor-pointer" />
									</bt-button>
								</template>
							</bt-input>
						</el-form-item>
						<el-form-item label="项目备注">
							<bt-input width="32rem" v-model="javaAddForm.project_ps" placeholder="输入项目备注，非必填"></bt-input>
						</el-form-item>
					</template>
				</BtSettingDivider>

				<el-form-item label=" " v-if="isEdit">
					<el-button type="primary" @click="onConfirm">保存当前配置</el-button>
				</el-form-item>
			</template>
		</BtForm>

		<bt-dialog v-model="updatePopup" :area="50" showFooter @confirm="serviceManageEvent" title="项目更新">
			<div class="py-[1.6rem]">
				<el-form ref="javaFormRef" :model="javaForm" :disabled="formFormDisabled" label-width="9rem" :rules="rules">
					<el-form-item label="jar包路径" prop="project_jar">
						<bt-input-icon v-model="javaForm.project_jar" icon="el-folder-opened" @icon-click="onJarPathChange" width="32rem" />
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { addJavaProject, addLocalJdk, checkJavaParams, getCommand, getSpringbootPort, jarRestartJavaProject, modifyJavaProject } from '@/api/site'
import { useConfirm, useDataHandle, useDialog, useForm, useHandleError, useMessage } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { useSiteStore } from '@/views/site/useStore'
import { openJdkView } from '@/views/site/views/java-model/useController'
import { isEdit } from '../useController'
import { defaultVerify } from '@/utils'

interface Props {
	projectData: any
}
const props = withDefaults(defineProps<Props>(), {
	projectData: {},
})

const { siteInfo, isRefreshList } = useSiteStore()

const projectData = reactive<any>(props.projectData)

const Message = useMessage() // 消息提示
const javaAddForm = ref<any>({
	project_path: '/www/wwwroot', // 项目路径
	project_type: 3,
	project_jar: '', // 项目jar路径
	project_name: '', // 项目名称
	port: '', // 项目端口
	project_jdk: props.projectData.jdk_info[0]?.path || '', // 项目JDK
	project_cmd: '', // 项目执行命令
	nohup_log: true, // nohup日志
	// jmx_status: false, // jmx监控
	run_user: 'www', // 项目用户
	// use_project_watch: false, // 监听重启
	auth: false, // 开机启动
	project_ps: '', // 项目备注
	domains: '', // 绑定域名
	jmx_port: '', // jmx端口
	debug: false, // 远程调试开启
	is_separation: false, // 前后端分离
	release_firewall: false, // 放行端口
	host_url: 'http://127.0.0.1', // 前端url
	// 环境变量
	env: '',
	envPath: '/www', // 环境变量文件
	// proxyPath: '/', // 反向代理路径
	by_process: 0,
	// daemon_status: false,
	proxy_dir: '/', // 访问地址
	target_dir: '/', // 到达地址
	static_dir: '', // 关联静态资源
})

const prependDomain = computed(() => {
	if (javaAddForm.value.domains) {
		// 如果有域名，获取第一个域名（如果有多个域名，以换行分隔）
		const firstDomain = javaAddForm.value.domains.split('\n')[0].trim()
		return `http://${firstDomain}`
	}
	return 'http://域名'
})

// const prependDomainProxy = computed(() => {
// 	return `http://127.0.0.1${javaAddForm.value.port ? `:${javaAddForm.value.port}` : ''}`
// })

const envType = ref(0) // 环境变量类型

const updatePopup = ref<boolean>(false) // 更新弹窗
const oldProjectJdk = ref('') // 旧的jdk
const popoverFocus = ref<boolean>(false) // 域名绑定提示框

const javaFormRef = ref<any>() // 更新表单ref
const formFormDisabled = ref<boolean>(false) // 更新表单禁用状态
const javaForm = reactive<any>({
	project_jar: siteInfo.value?.project_config?.project_jar || '',
})
const rules = reactive({
	project_jar: [defaultVerify({ message: '请输入项目jar路径' })],
})

const getSystemInfoEvent = inject('getSystemInfoEvent', (refreshStr: string) => {})

const fileType = ref('file')

// 文件类型
const fileTypeList = ref([
	{
		label: '.jar',
		value: 'file',
	},
	{
		label: '.war',
		value: 'war',
	},
])

// const targetDirName = computed(() => {
// 	if (!javaAddForm.value.port && !javaAddForm.value.target_dir) return `http://127.0.0.1`
// 	return `http://127.0.0.1${javaAddForm.value.port ? ':' + javaAddForm.value.port : ''}${javaAddForm.value.target_dir}`
// })

const urlTips = computed(() => {
	if (javaAddForm.value.proxy_dir === '/') {
		return `当前未启用前后端分离,nginx仅代理本地java服务`
	} else if (javaAddForm.value.proxy_dir.startsWith('/')) {
		return `使用${prependDomain.value}${javaAddForm.value.proxy_dir}访问后端接口,以实现前后端分离`
	} else {
		return ``
	}
})

watch(
	() => props.projectData.jdk_info.length,
	() => {
		if (javaAddForm && !isEdit.value) {
			javaAddForm.value.project_jdk = props.projectData.jdk_info[0]?.path
			// 当jdk信息发生变化时且存在启动命令，自动更新项目启动命令
			if (javaAddForm.value.project_jdk && javaAddForm.value.project_cmd) changeJdk(javaAddForm.value.project_jdk)
		}
	},
	{ immediate: true, deep: true }
)

const {
	BtForm,
	validate,
	ref: formRef,
} = useForm({
	data: javaAddForm.value,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					project_jdk: [defaultVerify({ message: '请选择项目JDK' })],
					// port: [defaultVerify({ message: '请输入项目端口' })],
					project_path: [defaultVerify({ message: '请输入项目路径' })],
					project_jar: [defaultVerify({ message: '请输入项目jar路径' })],
					project_name: [defaultVerify({ message: '请输入项目名称' })],
					project_cmd: [defaultVerify({ message: '请输入项目执行命令' })],
					proxy_dir: [
						{
							validator: (rule: any, value: any, callback: any) => {
								if (value && javaAddForm.value.static_dir && javaAddForm.value.proxy_dir === '/') {
									callback(new Error('前端资源需使用根路由【/】,请修改合理的后端路由，用于实现前后端分离，如：/api/'))
									return false
								}
								callback()
							},
							trigger: ['blur', 'change'],
						},
					],
					static_dir: [
						{
							validator: (rule: any, value: any, callback: any) => {
								if (value) {
									formRef.value?.validateField('proxy_dir')
								}
								callback()
							},
							trigger: ['blur', 'change'],
						},
					],
				},
			},
		]),
})

/**
 * @description: 打开接管弹窗
 */
const openProject = () => {
	useDialog({
		isAsync: true,
		title: '接管已启动项目',
		area: 76,
		component: () => import('@site/views/java-model/add-java/take-over-started-project.vue'),
		compData: {
			setProject,
		},
	})
}
const changeName = (val: string) => {
	javaAddForm.value.project_ps = val
}
const changeJdk = (val: string) => {
	javaAddForm.value.project_jdk = val
	if (isEdit.value) {
		if (oldProjectJdk.value.indexOf('/bin/java') === -1) {
			oldProjectJdk.value = oldProjectJdk.value + '/bin/java'
		}
		javaAddForm.value.project_cmd = javaAddForm.value.project_cmd?.replace(oldProjectJdk.value, val)
		oldProjectJdk.value = val
	} else {
		if (javaAddForm.value.project_cmd) {
			let cmd = javaAddForm.value.project_cmd.split('-Xmx1024M -Xms256M')
			javaAddForm.value.project_cmd = javaAddForm.value.project_jdk + ' -jar' + ' -Xmx1024M -Xms256M ' + cmd[1]
		} else {
			javaAddForm.value.project_cmd = javaAddForm.value.project_jdk + ' -jar ' + ' -Xmx1024M -Xms256M ' + javaAddForm.value.project_jar
		}
	}
}

const portPlace = computed(() => {
	if (isEdit.value) {
		if (javaAddForm.value.port === '') return '未设置'
	}
	return '选择项目文件，自动获取端口'
})

/**
 * @description: 设置项目信息
 */
const setProject = async (projectInfo: any) => {
	if (!projectInfo.java_bin && !projectInfo.jar_path) {
		return Message.error('未能解析到项目信息')
	}
	javaAddForm.value.project_path = projectInfo.jar_path
	javaAddForm.value.project_jar = projectInfo.jar_path
	javaAddForm.value.port = projectInfo.port
	javaAddForm.value.project_cmd = projectInfo.cmdline
	javaAddForm.value.project_name = projectInfo.project_name
	javaAddForm.value.run_user = projectInfo.user
	if (!projectData.jdk_info.some((item: any) => item.path === projectInfo.java_bin) && projectInfo.java_bin !== '') {
		const name = projectInfo.java_bin.split('/')
		projectData.jdk_info.push({ name: name[name.length - 3], path: projectInfo.java_bin })
		await addLocalJdk({ data: JSON.stringify({ jdk: projectInfo.java_bin }) })
	}
	javaAddForm.value.project_jdk = projectInfo.java_bin || ''
	javaAddForm.value.by_process = projectInfo.pid
	returnEnv(projectInfo.env)
}

/**
 * @description: 处理环境变量
 */
const setEnv = (envStr: string) => {
	let env = envStr.split('\n').filter(item => item !== '')
	let arrs: any = []
	env.forEach(item => {
		let arr = item.split('=')
		arrs.push({
			k: arr[0],
			v: arr[1],
		})
	})
	return arrs
}

/**
 * @description: 返回env处理
 * @param {string} env
 */
const returnEnv = (env: any[]) => {
	if (!javaAddForm) return
	if (env.length === 0) return
	switch (envType.value) {
		case 0:
			// 无
			javaAddForm.value.env = env.map(item => item.k + '=' + item.v).join('\n')
			envType.value = 1
			break
		case 1:
			// 指定变量,去重添加
			let oldEnv = setEnv(javaAddForm.value.env)
			// 使用 Map 来存储已经出现过的 k 值，保留第一次出现的元素
			const map = new Map()

			// 使用 reduce 方法处理数组
			const deduplicatedArray = [...oldEnv, ...env].reduce((result, item) => {
				// 获取当前元素的 k 属性值
				const key = item.k

				// 如果 Map 中不存在该 k 值，则将当前元素添加到结果数组中，并记录到 Map 中
				if (!map.has(key)) {
					map.set(key, true) // 使用 Map 记录已经出现过的 k 值
					result.push(item) // 将当前元素添加到结果数组中
				}

				return result
			}, [])
			javaAddForm.value.env = deduplicatedArray?.map((item: any) => item.k + '=' + item.v).join('\n')
			break
	}
}

/**
 * @description 环境变量文件目录
 */
const onEnvFile = () => {
	fileSelectionDialog({
		type: 'file',
		path: javaAddForm.value.envPath,
		change: (path: string) => {
			javaAddForm.value.envPath = path
		},
	})
}

/**
 * @description: 项目启动命令 失去焦点
 */
const changeCmdValue = () => {
	if (!javaAddForm) return
	if (isEdit.value) return
	// 匹配字符串中的端口，路径 赋值
	let port = javaAddForm.value.project_cmd.match(/--server.port=(\d+)/)
	if (port) javaAddForm.value.port = port[1]
	// 匹配路径 暂未实现
}

/**
 * @description: 返回命令
 */
const returnCmdEvent = async (type: number) => {
	if (!javaAddForm) return
	// 0: 项目jar路径 1: 项目端口 2: 项目JDK 3: 远程调试开启 4: jmx监控
	// javaAddForm.value.debug = false
	/*if (type === 3) {
		vm.$confirm({
			title: '警告',
			message:
				'此功能为远程调试配合IDEA使用，不建议在生产环境使用，调试端口随机生成，端口号请查看生成的命令,默认不开放此端口,需自行开放。',
			icon: 'warning-filled',
		})
		javaAddForm.value.debug = true
	}*/
	if (type === 1 && javaAddForm.value.project_jar === '/www/wwwroot') return
	try {
		let params = {
			type: type,
			project_name: javaAddForm.value.project_name,
			project_cmd: javaAddForm.value.project_cmd,
			project_jar: javaAddForm.value.project_jar,
			project_jdk: javaAddForm.value.project_jdk,
			// jmx_status: javaAddForm.value.jmx_status ? 1 : 0,
			port: javaAddForm.value.port,
		}
		const { data: res } = await getCommand(params)
		if (!res.status) return Message.request(res)
		javaAddForm.value.project_cmd = res.data
		// 截取最后四位数字为端口
		// if (!isEdit.value) {
		if (res.data.match(/--server.port=(\d+)/)) {
			const port = res.data.match(/--server.port=(\d+)/)[1]
			if (port !== javaAddForm.value.port) {
				javaAddForm.value.project_cmd = javaAddForm.value.project_cmd.replace(/--server.port=(\d+)/, '--server.port=' + javaAddForm.value.port)
			}
			// javaAddForm.value.port = res.data.match(/--server.port=(\d+)/)[1]
		} else {
			javaAddForm.value.project_cmd = javaAddForm.value.project_cmd + ' --server.port=' + javaAddForm.value.port
		}
		javaAddForm.value.host_url = `http://127.0.0.1:${javaAddForm.value.port}`
		let port_msg = 'Dcom.sun.management.jmxremote.port'
		javaAddForm.value.jmx_port = res.data.substr(res.data.indexOf(port_msg) + port_msg.length + 1, 4)
		// }
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	if (!javaAddForm) return
	fileSelectionDialog({
		type: 'file',
		path: javaAddForm.value.project_jar,
		change: async (path: string) => {
			if (!isEdit.value) {
				let str = path.substring(path.lastIndexOf('/') + 1).split('.')[0]
				javaAddForm.value.project_name = str
				javaAddForm.value.project_ps = str
				javaAddForm.value.project_cmd = javaAddForm.value.project_jdk + ' -jar ' + ' -Xmx1024M -Xms256M ' + path
				const { data: res } = await getSpringbootPort({ jar_path: path })
				res.status && (javaAddForm.value.port = res.data.port)
			} else {
				if (javaAddForm.value.project_cmd) javaAddForm.value.project_cmd = javaAddForm.value.project_cmd?.replace(javaAddForm.value.project_jar, path)
			}
			javaAddForm.value.project_jar = path
			javaAddForm.value.project_path = path
			// returnCmdEvent(0)
		},
	})
}

/**
 * @description: 触发静态资源目录选择
 */
const onStaticDirChange = () => {
	if (!javaAddForm) return
	fileSelectionDialog({
		type: 'dir',
		path: javaAddForm.value.static_dir,
		change: (path: string) => {
			javaAddForm.value.static_dir = path
		},
	})
}

/**
 * @description: 触发目录选择
 */
const onJarPathChange = () => {
	if (!javaAddForm) return
	fileSelectionDialog({
		type: 'file',
		path: javaForm.project_jar,
		change: (path: string) => {
			javaForm.project_jar = path
		},
	})
}

const serviceManageEvent = async () => {
	await javaFormRef.value.validate()
	const { name: project_name } = siteInfo.value
	await useConfirm({
		title: '更新项目',
		content: `将要重启项目【${project_name}】，是否继续？`,
	})
	const params = {
		project_name,
		project_jar: javaForm.project_jar,
	}
	try {
		const res = await jarRestartJavaProject(params)
		Message.msg({
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: res.status ? 'success' : 'error',
			duration: res.status ? 2000 : 0,
			showClose: !res.status,
		}) // 提示错误信息
		if (res.status) {
			// emits('closeEvent')
			isRefreshList.value = true
			updatePopup.value = false
		}
	} catch (error) {
		useHandleError(error)
	}
}
let checkPopup: any = null // 检查弹窗

/**
 * @description: 检查参数
 */
const checkParams = async (confirmEvent: AnyFunction) => {
	try {
		let env = javaAddForm.value.env
		if (envType.value === 1) {
			// 环境变量
			env = setEnv(env)
		}
		let params = {
			project_jar: javaAddForm.value.project_jar,
			project_cmd: javaAddForm.value.project_cmd,
			by_process: javaAddForm.value.by_process,
			env_file: envType.value === 2 ? javaAddForm.value.envPath : '',
			env_list: JSON.stringify(envType.value === 1 ? env : []),
		}
		const res = await checkJavaParams(params)
		if (res.status && res.data.length > 0) {
			checkPopup = await useDialog({
				isAsync: true,
				title: '项目帮助',
				area: 76,
				component: () => import('@site/views/java-model/add-java/springboot-check-list.vue'),
				compData: {
					data: res.data,
					params,
					confirmEvent,
				},
				btn: '继续创建',
				onConfirm: confirmEvent,
				cancel: () => {
					checkPopup = null
				},
			})
		} else {
			return confirmEvent()
		}
	} catch (error) {
		useHandleError(error)
	}
}

const onSubmitEvent = async (param: any, validate: any, close: any) => {
	await validate()
	let env = param.env
	if (envType.value === 1) {
		// 环境变量
		env = setEnv(env)
	}
	let params: any = {
		project_type: 0,
		domains: param.domains ? param.domains.split('\n') : [], // 如果domains为空字符串，则返回空数组
		project_jar: param.project_jar,
		project_jdk: param.project_jdk,
		project_name: param.project_name,
		project_cmd: param.project_cmd,
		project_ps: param.project_ps,
		run_user: param.run_user,
		env_file: envType.value === 2 ? param.envPath : '',
		env_list: envType.value === 1 ? env : [],
		// jmx_status: param.jmx_status,
		// watch_file: param.use_project_watch,
		ps: param.project_ps,
		port: param.port,
		project_path: param.project_path,
		proxy_dir: param.proxy_dir,
		target_dir: param.target_dir,
		static_dir: param.static_dir,
		// daemon_status: param.daemon_status,
	}
	if (isEdit.value) {
		// params.daemon_status = param.daemon_status
		params.project_id = siteInfo.value.id
	} else {
		params.by_process = param.by_process
		params.release_firewall = param.release_firewall
	}
	const requestFun = isEdit.value ? modifyJavaProject : addJavaProject
	const res: AnyObject = await useDataHandle({
		loading: '正在操作，请稍后...',
		request: requestFun({
			data: JSON.stringify(params),
		}),
		message: true,
	})
	if (res.status) {
		isRefreshList.value = true
		if (!isEdit.value) {
			close()
		}
	}
	return res.status
}

const onConfirm = async (close: any) => {
	await validate()
	return isEdit.value
		? await onSubmitEvent(javaAddForm.value, validate, close)
		: checkParams(async () => {
				if (checkPopup) {
					const popup = await checkPopup
					popup?.unmount()
					checkPopup = null
				}
				return await onSubmitEvent(javaAddForm.value, validate, close)
		  })
}

/**
 * @description 检测端口
 */
const checkServerPort = (str: string) => {
	try {
		// 项目类型为springboot时才进行判断
		const regex = /--server\.port=(\d+)/
		const match = str.match(regex)

		if (match) {
			const port = match[1]
			// console.log(`匹配到的端口是: ${port}`)
			return port
		} else {
			// console.log('未匹配到端口')
			return false
		}
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	if (isEdit.value) {
		const { ps, project_config } = siteInfo.value
		const { project_jar, project_jdk, run_user, project_cmd, jmx_status, java_type, watch_file, env_file, env_list } = project_config
		oldProjectJdk.value = project_jdk
		envType.value = env_list?.length ? 1 : env_file ? 2 : 0
		const port = java_type === 'springboot' ? checkServerPort(project_cmd) || project_config.port : false // 检测端口
		Object.assign(javaAddForm.value, {
			project_ps: ps,
			// use_project_watch: watch_file,
			project_jar,
			project_jdk: project_jdk?.indexOf('/bin/java') === -1 ? project_jdk + '/bin/java' : project_jdk,
			project_name: project_config.project_name,
			project_cmd,
			run_user,
			env_file,
			env_list,
			proxy_path: project_config.proxy_path,
			// jmx_status,
			watch_file,
			domains: project_config.domains.join('\n'),
			// daemon_status: project_config.daemon_status,
			envPath: env_file,
			env: env_list?.map((item: any) => item.k + '=' + item.v).join('\n'),
			port: port || '',
			project_path: project_config.project_jar,
			proxy_dir: project_config.proxy_dir,
			target_dir: project_config.target_dir,
			static_dir: project_config.static_dir,
		})
	}
})

defineExpose({
	onConfirm,
})
</script>

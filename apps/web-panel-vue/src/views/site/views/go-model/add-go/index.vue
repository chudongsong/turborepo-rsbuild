<template>
	<BtForm label-width="100px" class="p-[20px]">
		<template #custom>
			<el-form-item label="项目执行文件" prop="project_exe">
				<bt-input-icon v-model="goAddForm.project_exe" icon="el-folder-opened" placeholder="请选择项目可执行文件" @icon-click="onPathChange" width="32rem" />
			</el-form-item>
			<el-form-item label="项目名称" prop="project_name">
				<bt-input @input="changeName" width="32rem" :disabled="isEdit" v-model="goAddForm.project_name" placeholder="请输入GO项目名称"></bt-input>
			</el-form-item>
			<el-form-item label="项目端口" prop="port">
				<div class="flex items-center">
					<bt-input width="20rem" type="number" @blur="checkPortUse" class="mr-[12px]" v-model="goAddForm.port" placeholder="请输入项目的真实端口"></bt-input>
					<el-checkbox v-model="goAddForm.release_firewall" v-if="!isEdit">
						放行端口
						<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right"> <i class="svgtofont-el-question-filled text-warning"></i> </el-tooltip
					></el-checkbox>
				</div>
			</el-form-item>
			<el-form-item label="执行命令" prop="project_cmd">
				<bt-input v-model="goAddForm.project_cmd" placeholder="请输入项目的执行命令" width="32rem"></bt-input>
			</el-form-item>
			<el-form-item label="环境变量" class="mt-[1.6rem]">
				<el-radio-group v-model="envType">
					<el-radio :label="0">无</el-radio>
					<el-radio :label="1">指定变量</el-radio>
					<el-radio :label="2">从文件加载</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-show="envType !== 0" label=" ">
				<bt-input v-show="envType === 1" width="40rem" type="textarea" :rows="3" resize="none" v-model="goAddForm.env" placeholder="环境变量，1行1个，例如： JAVA_HOME=/usr/local/btjdk/jdk8"></bt-input>
				<bt-input-icon v-show="envType === 2" v-model="goAddForm.envPath" icon="el-folder-opened" placeholder="请选择环境变量文件" @icon-click="onEnvFile" width="32rem" />
			</el-form-item>
			<el-form-item label="运行用户">
				<div class="flex items-center">
					<bt-select v-model="goAddForm.run_user" :options="userList" class="mr-[8px] !w-[16rem]"></bt-select>
					<span class="text-small text-secondary">* 无特殊需求请选择www用户</span>
				</div>
			</el-form-item>
			<el-form-item label="开机启动">
				<el-checkbox v-model="goAddForm.is_power_on">是否设置开机自动启动（默认自带守护进程每120秒检测一次）</el-checkbox>
			</el-form-item>
			<el-form-item label="项目备注">
				<bt-input width="32rem" v-model="goAddForm.project_ps" placeholder="输入项目备注，非必填"></bt-input>
			</el-form-item>
			<el-form-item label="绑定域名" v-if="!isEdit">
				<el-popover placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
					<div class="!p-[12px] bg-primary text-white">
						如需填写多个域名，请换行填写，每行一个域名，默认为80端口<br />
						IP地址格式：192.168.1.199<br />
						泛解析添加方法 *.domain.com<br />
						如另加端口格式为 www.domain.com:88
					</div>
					<template #reference>
						<bt-input
							:rows="4"
							resize="none"
							width="40rem"
							v-model="goAddForm.domains"
							type="textarea"
							@focus="popoverFocus = true"
							:placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'" />
					</template>
				</el-popover>
			</el-form-item>

			<el-form-item label=" " v-if="isEdit">
				<el-button type="primary" @click="submit">保存配置</el-button>
			</el-form-item>
			<el-form-item label="" v-else>
				<bt-help :options="helpList"></bt-help>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="tsx">
import { advanceCheckPort } from '@/api/site'
import { useForm, useMessage } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { defaultVerify, portVerify, swapString } from '@/utils'
import { useSiteStore, SITE_STORE } from '@site/useStore'
import BtLink from '@/components/base/bt-link'
import { addGoConfirm } from '../useController'

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()
const { getRootUser, getProjectConfig } = SITE_STORE()

const isEdit = ref(!!siteInfo.value)
const userList = ref([]) // 系统用户列表
const popoverFocus = ref(false) // 域名popover
const envType = ref(0) // 环境变量类型

const goAddForm = ref({
	project_exe: '', // 项目jar路径
	project_name: '', // 项目名称
	port: '', // 项目端口
	project_cmd: '', // 项目执行命令
	run_user: 'www', // 项目用户
	project_ps: '', // 项目备注
	domains: '', // 绑定域名
	release_firewall: false, // 放行端口
	is_power_on: false, // 是否开机启动
	bind_extranet: false, // 是否绑定外网
	env: '', // 环境变量
	envPath: '', // 环境变量文件路径
})

const helpList = [
	{ content: '执行命令：请输入项目需要携带的参数，默认请输入执行文件名' },
	{
		content: () => (
			<span>
				项目教程可参考:
				<BtLink target="_blank" href="https://www.bt.cn/bbs/thread-93034-1-1.html">
					https://www.bt.cn/bbs/thread-93034-1-1.html
				</BtLink>
			</span>
		),
	},
]

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: goAddForm.value.project_exe,
		change: (path: string) => {
			goAddForm.value.project_exe = path
			goAddForm.value.project_cmd = path?.replace(/\/\//g, '/')
			let str = path.substring(path.lastIndexOf('/') + 1)?.replace(/\./g, '_')
			if (!isEdit.value) {
				goAddForm.value.project_name = str
			}
			goAddForm.value.project_ps = str.replace(/\./g, '_')
		},
	})
}

const changeName = (val: string) => {
	goAddForm.value.project_ps = val
}

/**
 * 检查端口是否被占用
 */
const checkPortUse = async () => {
	if (!goAddForm.value.port) return
	try {
		const res = await advanceCheckPort({ port: goAddForm.value.port }, 'go')
		if (!res.status) {
			Message.request(res)
			goAddForm.value.port = '' // 清空端口
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 环境变量文件目录
 */
const onEnvFile = () => {
	fileSelectionDialog({
		type: 'file',
		path: goAddForm.value.envPath,
		change: path => {
			goAddForm.value.envPath = path
		},
	})
}

const { BtForm, submit } = useForm({
	data: goAddForm.value,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					project_exe: [defaultVerify({ message: '请选择项目可执行文件' })],
					project_name: [defaultVerify({ message: '请输入项目名称' })],
					port: [defaultVerify({ message: '请输入端口号', trigger: ['change'] }), portVerify()],
					project_cmd: [defaultVerify({ message: '请输入项目执行命令' })],
				},
			},
		]),
	submit: async (param: any, validate: any) => {
		return await addGoConfirm(param, validate, envType.value)
	},
})

const init = async () => {
	const user = await getRootUser()
	userList.value = user.data.map((item: any) => ({ label: item, value: item }))
	Object.assign(goAddForm.value, {
		// 初始化数据
		project_exe: '',
		project_name: '',
		port: '',
		project_cmd: '',
		run_user: 'www',
		project_ps: '',
		domains: '',
		release_firewall: false,
		is_power_on: false,
		bind_extranet: false,
		env: '',
		envPath: '',
	})
	if (isEdit.value) {
		// 编辑
		const { data } = await getProjectConfig({ data: JSON.stringify({ project_name: siteInfo.value.name }) })
		const { env_list, env_file } = data.project_config
		if (env_file) envType.value = 2
		if (env_list?.length > 0) envType.value = 1
		Object.assign(goAddForm.value, {
			...data?.project_config,
			project_ps: swapString(data?.ps),
			is_power_on: data?.project_config.is_power_on ? true : false,
			not_install_pkg: data?.project_config.not_install_pkg ? true : false,
			envPath: env_file || '',
			env: env_list?.length && Array.isArray(env_list) ? env_list.map(item => item.k + '=' + item.v).join('\n') : '',
		})
	}
}

onMounted(init)

defineExpose({
	onConfirm: submit,
})
</script>

<template>
	<BtForm label-width="100px" class="p-2rem">
		<template #custom>
			<el-form-item label="项目名称" prop="pjname">
				<div class="flex items-center">
					<bt-input :disabled="isEdit" width="22rem" v-model="pyAddForm.pjname" placeholder="请输入Python项目名称"></bt-input>
					<el-form-item v-show="pyAddForm.stype !== 'command'" label="项目端口" prop="port" label-width="7rem">
						<bt-input width="18rem" type="number" v-model="pyAddForm.port" placeholder="项目的真实端口"></bt-input>
						<div v-if="pyAddForm.listenMsg && pyAddForm.stype !== 'command'" class="absolute top-[26px] text-small text-[red]">
							{{ pyAddForm.listenMsg }}
						</div>
					</el-form-item>
				</div>
			</el-form-item>

			<!-- <el-form-item label="Python版本">
				<div class="flex items-center">
					<div class="flex items-center" :class="isEdit ? '' : 'custom-refresh-select'">
						<el-select v-model="pyAddForm.version" class="!w-[16rem]" :disabled="isEdit">
							<el-option v-for="item in versionData" :key="item" :value="item" :label="item"></el-option>
						</el-select>
						<div v-if="!isEdit" class="el-input-group__append !h-3rem !flex items-center">
							<bt-button title="刷新Python版本" class="!flex" @click="getVersion(true)">
								<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
							</bt-button>
						</div>
					</div>
					<span class="text-small ml-8px"> * 如需安装Python版本，请点击<bt-link @click="openEnvVersionView('py', getVersion)">版本管理</bt-link> </span>
				</div>
			</el-form-item> -->
			<el-form-item label="Python环境" prop="python_bin">
				<div class="flex items-center">
					<div class="flex items-center" :class="isEdit ? '' : 'custom-refresh-select'">
						<el-select v-model="pyAddForm.python_bin" filterable class="!w-[24rem]" popper-class="env-select" :disabled="isEdit">
							<template #empty>
								<div class="text-small text-tertiary flex items-center justify-center">暂无Python环境,<span class="bt-link" @click="openPythonEnvManageView(getPythonEnv)">点击添加</span></div>
							</template>
							<el-option v-for="item in envList" :key="item.bin_path" :value="item.bin_path" :label="item.name">
								<div class="relative pt-[1rem]" :title="item.name">
									<div v-if="!!item.project_name.length" class="absolute top-[50%] right-[-1rem] translate-y-[-50%] flex items-center">
										<span class="text-small text-tertiary truncate max-w-[6rem]">{{ item.project_name[0] }}</span>
										<span class="text-small text-tertiary">{{ `等${item.project_name.length}个项目正在使用` }}</span>
									</div>
									<div class="flex items-center">
										<div class="truncate text-medium max-w-[13rem]">{{ item.name }}</div>
										<span class="text-small ml-[8px] px-[.5rem] rounded-base border" :class="`tag-${item.type}`">{{ getPythonEnvStatus(item.type) }}</span>
									</div>
									<div class="text-small text-tertiary mt-[.5rem]">{{ item.version }}</div>
								</div>
							</el-option>
						</el-select>
						<!-- <div v-if="!isEdit" class="el-input-group__append !h-3rem !flex items-center">
							<bt-button title="刷新Python版本" class="!flex" @click="getVersion(true)">
								<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
							</bt-button>
						</div> -->
					</div>
					<span class="text-small ml-8px"> * 如需添加Python环境，请点击<bt-link @click="openPythonEnvManageView(getPythonEnv)">环境管理</bt-link> </span>
				</div>
			</el-form-item>

			<el-form-item label="启动方式">
				<!-- @change="stypeChange" -->
				<el-radio-group v-model="pyAddForm.stype">
					<el-radio-button label="command">命令行启动</el-radio-button>
					<el-radio-button label="uwsgi">uwsgi</el-radio-button>
					<el-radio-button label="gunicorn">gunicorn</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="项目路径" prop="path">
				<bt-input width="42rem" :icon-type="isEdit ? false : 'folder'" :disabled="isEdit" placeholder="项目的根路径" @folder="onRootPathChange" @change="getPathInfo" v-model="pyAddForm.path">
					<template v-if="!isEdit" #append>
						<bt-button @click="onRootPathChange">
							<bt-icon icon="el-folder-opened" class="cursor-pointer" />
						</bt-button>
					</template>
				</bt-input>
			</el-form-item>
			<div v-show="pyAddForm.framework" class="mt-[1rem] ml-[12rem]">当前框架：{{ pyAddForm.framework }}</div>
			<div v-show="pyAddForm.stype === 'command'" class="mt-[1.6rem]">
				<el-form-item label="启动命令" prop="parm">
					<bt-input v-model="pyAddForm.parm" placeholder="请输入启动命令" width="42rem"></bt-input>
				</el-form-item>
			</div>
			<div v-show="pyAddForm.stype !== 'command'" class="mt-[1.6rem]">
				<el-form-item label="入口文件">
					<bt-input-icon placeholder="项目的入口文件" v-model="pyAddForm.rfile" icon="el-folder-opened" @icon-click="onPathChange(pyAddForm)" @change="getAppInfo(pyAddForm)" width="42rem" />
				</el-form-item>
				<el-form-item label="通讯协议">
					<div class="flex">
						<el-select v-model="pyAddForm.xsgi" class="!w-[15rem]">
							<el-option label="wsgi" value="wsgi"></el-option>
							<el-option label="asgi" value="asgi"></el-option>
						</el-select>
						<el-form-item label="应用名称">
							<bt-input v-model="pyAddForm.app" placeholder="请输入应用名称" width="22rem"></bt-input>
						</el-form-item>
					</div>
				</el-form-item>
			</div>
			<el-form-item label="环境变量" class="mt-[1.6rem]">
				<el-radio-group v-model="pyAddForm.envType">
					<el-radio :label="0">无</el-radio>
					<el-radio :label="1">指定变量</el-radio>
					<el-radio :label="2">从文件加载</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-show="pyAddForm.envType !== 0" label=" ">
				<bt-input v-show="pyAddForm.envType === 1" width="40rem" type="textarea" :rows="4" resize="none" v-model="pyAddForm.env" placeholder="环境变量，1行1个，例如： JAVA_HOME=/usr/local/btjdk/jdk8"></bt-input>
				<bt-input-icon v-show="pyAddForm.envType === 2" v-model="pyAddForm.envPath" placeholder="请选择环境变量文件" icon="el-folder-opened" @icon-click="onEnvFile" width="42rem" />
			</el-form-item>
			<el-form-item label="启动用户">
				<el-select v-model="pyAddForm.user" class="!w-[16rem]">
					<el-option v-for="user in userList" :key="user" :label="user" :value="user"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="开机启动" v-if="isEdit">
				<el-checkbox v-model="pyAddForm.auto_run"> 是否设置开机自动启动（默认自带守护进程每120秒检测一次） </el-checkbox>
			</el-form-item>
			<el-form-item v-if="!isEdit" label="安装依赖包">
				<bt-input width="42rem" :icon-type="'folder'" placeholder="安装依赖包路径（非必填）" @folder="onRequirementPathChange" v-model="pyAddForm.requirement_path">
					<template #append>
						<bt-button @click="onRequirementPathChange">
							<bt-icon icon="el-folder-opened" class="cursor-pointer" />
						</bt-button>
					</template>
				</bt-input>
			</el-form-item>
			<div v-if="isEdit" class="my-[20px]">
				<el-form-item label="进程数" prop="processes" v-if="pyAddForm.stype != 'command'">
					<div class="flex items-center">
						<bt-input width="16rem" v-model="pyAddForm.processes"></bt-input>
						<el-form-item label="线程数" prop="threads">
							<bt-input width="16rem" v-model="pyAddForm.threads"></bt-input>
						</el-form-item>
					</div>
				</el-form-item>
				<el-form-item label="通信方式" v-if="isEdit && pyAddForm.stype === 'uwsgi'">
					<el-select v-model="pyAddForm.is_http" class="w-[16rem]">
						<el-option label="http" :value="true"></el-option>
						<el-option label="socket" :value="false"></el-option>
					</el-select>
				</el-form-item>
			</div>
			<template v-if="!isEdit">
				<div class="more flex items-center cursor-pointer pl-[10rem] my-[2rem] px-[2rem]" @click="isAdv = !isAdv">
					<i :class="isAdv ? 'svgtofont-el-arrow-down' : 'svgtofont-el-arrow-right'"></i>
					<div class="ml-[1rem] text-primary w-[16rem] select-none">
						{{ `更多设置，${isAdv ? '点击收回' : '点击查看'}` }}
					</div>
				</div>
				<div v-show="isAdv" class="pt-[0]">
					<el-form-item label="项目初始化命令" prop="initialize">
						<bt-input :rows="3" v-model="pyAddForm.initialize" type="textarea" name="initialize" width="42rem" placeholder="此处填写用于初始化项目的命令或脚本，常见的有项目数据库初始化操作等。例如：django常使用python manage.py makemigrations 和 python manage.py migrate 初始化数据库"></bt-input>
					</el-form-item>
				</div>
				<ul class="mt-[20px] leading-8 text-small list-disc ml-48px">
					<li>执行命令：请输入项目需要携带的参数，默认请输入执行文件名</li>
					<li>
						通讯协议：wsgi：同步通讯，一次处理一个请求， asgi：异步处理，并发处理请求
						<br />
						根据项目情况具体选择，例如: 传统Flask就是wsgi, Fastapi框架就是asgi, Django两者都可以支持
					</li>
					<li>项目初始化命令：初始化脚本会在创建虚拟环境，安装依赖库之后执行</li>
				</ul>
			</template>
			<el-form-item label=" " v-if="isEdit">
				<el-button type="primary" @click="submit">保存配置</el-button>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { defaultVerify } from '@/utils'
import { SITE_STORE, useSiteStore } from '@/views/site/useStore'
import { openEnvVersionView } from '@site/useController'
import { pyAddForm, getPythonEnv, getAppInfo, getPathInfo, initPy, $resetPyAddForm, isEdit, onEnvFile, onPathChange, onRootPathChange, submitPySite, userList, envList, openPythonEnvManageView, getPythonEnvStatus, requirementPath, onRequirementPathChange } from '../useController'

const isAdv = ref<boolean>(false) // 是否高级设置

const { BtForm, submit } = useForm({
	data: pyAddForm.value,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					pjname: [defaultVerify({ message: '请输入项目名称' })],
					port: [
						{
							validator: (rule: any, value: any, callback: any) => {
								if (pyAddForm.value.stype !== 'command' && (!/^\d+$/.test(value) || value < 0 || value > 65535)) {
									if (pyAddForm.value.listenMsg) {
										callback(new Error(' '))
									} else {
										callback(new Error('端口号范围为0-65535'))
									}
								} else {
									callback()
								}
							},
							tirgger: ['blur', 'change'],
						},
					],
					path: [defaultVerify({ message: '请选择路径' })],
					processes: [defaultVerify({ message: '请输入进程数' })],
					threads: [defaultVerify({ message: '请输入线程数' })],
					python_bin: [defaultVerify({ message: '请选择Python环境' })],
					parm: [
						{
							validator: (rule: any, value: any, callback: any) => {
								if (pyAddForm.value.stype === 'command' && value === '') {
									callback(new Error('请输入启动命令'))
								} else {
									callback()
								}
							},
							tirgger: ['blur', 'change'],
						},
					],
				},
			},
		]),
	submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
		await validate()
		return await submitPySite(param.value)
	},
})

onMounted(() => {
	initPy()
})

onUnmounted($resetPyAddForm)

defineExpose({
	onConfirm: submit,
})
</script>

<style>
.tag-venv {
	border-color: var(--el-color-primary);
	color: var(--el-color-primary);
}

.tag-conda {
	border-color: var(--el-color-primary);
	color: var(--el-color-primary);
}

.tag-system {
	border-color: var(--el-color-warning-light-9);
	color: var(--el-color-warning-light-3);
}

.env-select .el-select-dropdown__item {
	height: 6rem !important;
	line-height: 1.5 !important;
}
.env-select .el-select-dropdown {
	max-width: 50rem !important;
	width: 45rem !important;
}
.env-select .el-select-dropdown__item.is-selected {
	background-color: var(--el-color-success-light-9) !important;
}
</style>

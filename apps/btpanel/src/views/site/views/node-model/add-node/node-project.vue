<template>
	<div
		class="overflow-auto"
		:style="{
			'max-height': isEdit ? '76rem' : '50rem',
		}">
		<BtForm label-width="80px">
			<template #custom>
				<el-form-item label="项目目录" prop="project_cwd">
					<div>
						<bt-input-icon v-model="nodeFormData.project_cwd" readOnly icon="el-folder-opened" placeholder="请选择Node项目目录" @icon-click="onPathChange" width="32rem" />
						<div class="ml-8px text-small text-danger leading-[2rem]" v-if="notPackage">* 文件夹中未检测到package.json文件，建议前往传统项目进行项目添加</div>
					</div>
				</el-form-item>
				<el-form-item label="项目名称" prop="project_name">
					<bt-input :disabled="isEdit" v-model="nodeFormData.project_name" width="32rem" placeholder="请输入Node项目名称"></bt-input>
				</el-form-item>

				<el-form-item label="启动选项" prop="project_script">
					<div class="flex items-center">
						<el-select placeholder="请选择项目目录进行操作" v-model="nodeFormData.project_script" class="!w-[30rem]" :disabled="nodeFormData.project_cwd === '/www/wwwroot/' || nodeFormData.project_cwd === '/www/wwwroot'">
							<el-option label="自定义启动命令" value="0"></el-option>
							<el-option v-for="item in runList" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
						<span class="ml-8px text-small">* 自动获取package.json文件中的启动模式</span>
					</div>
				</el-form-item>
				<el-form-item label=" " v-if="nodeFormData.project_script === '0'">
					<bt-input-icon v-model="nodeFormData.userCmd" placeholder="请输入自定义启动命令" icon="el-folder-opened" @icon-click="onSelectCmd" width="32rem" />
				</el-form-item>
				<el-form-item label="Node版本" prop="nodejs_version">
					<div class="flex items-center">
						<div class="flex items-center custom-refresh-select">
							<el-select v-model="nodeFormData.nodejs_version" class="!w-[16rem]" @change="changeNodeVersionCheck">
								<el-option v-for="item in nodejs_versions" :key="item" :label="item" :value="item"></el-option>
							</el-select>
							<div class="el-input-group__append !h-3rem !flex items-center">
								<bt-button title="刷新Node版本" class="!flex" @click="refeshNode">
									<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
								</bt-button>
							</div>
						</div>
						<span class="ml-8px text-small text-secondary">* 请根据项目选择合适的Node版本，</span>
						<bt-link @click="openNodeVersionEvent">安装其他版本</bt-link>
					</div>
				</el-form-item>

				<el-form-item label="包管理器">
					<div class="flex items-center">
						<el-select v-model="nodeFormData.pkg_manager" class="!w-[16rem]">
							<el-option v-for="(item, index) in package_managers" :key="index" :label="item" :value="item"></el-option>
						</el-select>
						<span class="text-small text-[#666 mx-8px">* 请选择项目的包管理器</span>
						<el-checkbox v-if="!isEdit" v-model="nodeFormData.not_install_pkg"> 不安装node_module </el-checkbox>
					</div>
				</el-form-item>
			</template>
		</BtForm>

		<BtSettingDivider :isShowDivider="!isEdit">
			<template #config>
				<AdvancedConfig ref="advancedConfigRef" label-width="80px" type="node" :rowData="{ ...siteInfo?.project_config, listen: siteInfo?.listen }" :ps="ps"> </AdvancedConfig>
			</template>
		</BtSettingDivider>

		<div v-if="isEdit" class="pl-[12rem]">
			<el-button type="primary" @click="saveEdit">保存修改</el-button>
		</div>
		<ul class="mt-[8px] leading-8 text-small list-disc ml-32px">
			<li>【启动选项】：默认读取package.json中的scripts列表，也可以选择[自定义启动命令]选项来手动输入启动命令</li>
			<li>【自定义启动命令】：可以选择启动文件，或直接输入启动命令，支持的启动方式：例：npm/node/pm2/yarn</li>
			<li>【项目端口】：错误的端口会导致访问502，若不知道端口，可先随意填写，启动项目后再改为正确端口</li>
			<li>【运行用户】：为了安全考虑，默认使用www用户运行，root用户运行可能带来安全风险</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import { useDataHandle, useForm } from '@/hooks/tools'
import { useSiteStore } from '@/views/site/useStore'
import AdvancedConfig from './advanced-config.vue'
import { checkVariable, defaultVerify } from '@/utils'
import { fileSelectionDialog } from '@/public'
import { getNodeConfig, nodeData, isEdit, openNodeVersionEvent, submitEditNodeData, useCheckNodeVersionNpm } from '../useController'
import { checkPathStatus, getRunList } from '@/api/site'

const { siteInfo } = useSiteStore()

const notPackage = ref(false) // 是否存在package.json
const runList = ref<any[]>([]) // 启动选项列表
const ps = ref<string>('') // 项目备注
// const nodeData = inject<any>('nodeData', {
// 	nodejs_versions: [], // Node版本
// 	package_managers: [], // 包管理器
// 	user_list: [], // 运行用户
// }) // 配置信息
const nodejs_versions = ref(nodeData.value.nodejs_versions) // Node
const package_managers = ref(nodeData.value.package_managers) // 包管理器
const advancedConfigRef = ref() // 高级配置实例

const getNodeData = inject<any>('getNodeData', (isRefresh: boolean) => {})

const refeshNode = async () => {
	console.log('刷新Node版本', await getNodeData(true))
	const res = await getNodeData(true)
	nodejs_versions.value = res.nodejs_versions
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: nodeFormData.value.project_cwd,
		change: async (path: string) => {
			nodeFormData.value.project_cwd = path
			if (!isEdit.value) {
				// 截取最后一个/后的字符串
				let str = path.substring(path.lastIndexOf('/') + 1)?.replace(/\W/g, '_')
				// 项目名称为空时，赋值
				if (!nodeFormData.value.project_name) nodeFormData.value.project_name = str
				ps.value = str
				const form = await getRunListEvent(nodeFormData.value.project_cwd) // 获取启动选项
				Object.assign(nodeFormData.value, form)
				// 获取目录配置
				const res = await checkPathConfig(path)
				// 是否存在node_modules,存在则勾选不安装node_module
				if (res.node_modules) nodeFormData.value.not_install_pkg = true
				notPackage.value = !res.package_json // 是否存在package.json
			}
		},
	})
}

/**
 * @description 检查路径配置
 * @param path
 * @returns
 */
const checkPathConfig = async (path: string) => {
	const { data }: any = await useDataHandle({
		request: checkPathStatus({ path }),
	})
	return data
}

/**
 * @description: 选择自定义启动命令
 */
const onSelectCmd = () => {
	fileSelectionDialog({
		type: 'file',
		path: nodeFormData.value.project_cwd,
		change: (path: string) => {
			nodeFormData.value.userCmd = path
		},
	})
}

/**
 * @description 切换Node版本
 * @param val
 */
const changeNodeVersionCheck = async (val: string) => {
	const res = await useCheckNodeVersionNpm(val)
	// 将包管理替换为该版本适用的包管理
	package_managers.value = res
	nodeFormData.value.pkg_manager = res[0] || ''
}

/**
 * @description 获取启动选项
 */
const getRunListEvent = async (project_cwd: string) => {
	let form: any = {}
	try {
		const res = await getRunList({
			data: JSON.stringify({ project_cwd }),
		})
		const obj = checkVariable(res.data, 'object', {})
		if (Object.keys(obj).length === 0) {
			form.project_script = '0'
		} else {
			let data = Object.keys(obj)
			runList.value = data.map((item: string) => ({
				label: item + ':' + obj[item],
				value: item,
			}))
			form.project_script = data[0] || ''
		}
		if (isEdit.value) {
			let cmd = siteInfo.value.project_config.project_script
			form.project_script = cmd
			form.userCmd = cmd
			// 若列表中没有该命令，则设置为自定义命令
			let isHaveCmd = !runList.value.find(item => item.value === cmd)
			if (isHaveCmd) form.project_script = '0'
		}
		return form
	} catch (error) {
		console.log(error)
		return form
	}
}

const {
	BtForm,
	submit,
	param: nodeFormData,
} = useForm({
	data: async () => {
		await getNodeConfig()
		package_managers.value = nodeData.value.package_managers
		nodejs_versions.value = nodeData.value.nodejs_versions
		if (isEdit.value) {
			const { project_config, ps: project_ps } = siteInfo.value
			const form = await getRunListEvent(project_config.project_cwd)
			ps.value = project_ps
			return {
				...project_config,
				project_type: project_config.project_type || 'nodejs',
				userCmd: '',
				...form,
			}
		}
		return {
			project_name: '', // 项目名称
			project_script: '', // 启动选项
			project_cwd: '/www/wwwroot', // 项目目录
			project_type: 'nodejs', // 项目类型
			pkg_manager: package_managers.value?.at(0) || '', // 包管理器
			not_install_pkg: false, // 是否安装node_module
			run_user: 'www', // 运行用户
			nodejs_version: nodejs_versions.value?.at(0) || '', // Node版本
			userCmd: '', // 自定义启动命令
		}
	},
	options: (formData: any) =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					project_cwd: [defaultVerify({ message: '请输入项目启动目录' })],
					project_name: [defaultVerify({ message: '请输入项目名称' })],
					nodejs_version: [{ required: true, message: '请选择Node版本', trigger: ['blur', 'change'] }],
					project_script: [defaultVerify({ message: '请选择项目启动脚本' })],
				},
			},
		]),
	submit: async (param: any, validate: any) => {
		await validate()
		const adForm = advancedConfigRef.value.formData // 高级配置表单数据
		return {
			...param.value,
			project_script: param.value.project_script === '0' ? param.value.userCmd : param.value.project_script,
			...adForm,
			domains: adForm.domains ? adForm.domains.split('\n') : [],
		}
	},
})

/**
 * @description: 保存修改
 */
const saveEdit = async () => {
	const params = await submit()
	submitEditNodeData(params)
}

defineExpose({
	submit,
})
</script>

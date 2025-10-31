<template>
	<div
		class="overflow-auto"
		:style="{
			'max-height': isEdit ? '68rem' : '50rem',
		}">
		<BtForm label-width="90px">
			<template #custom>
				<el-form-item label="项目名称" prop="project_name">
					<bt-input v-model="pmFormData.project_name" width="32rem" :disabled="isEdit" placeholder="请输入Node项目名称"></bt-input>
				</el-form-item>
				<el-form-item label="PM2服务名" v-if="isEdit && pmFormData.pm2_name">
					<bt-input v-model="pmFormData.pm2_name" width="32rem" disabled></bt-input>
				</el-form-item>
				<el-form-item label="Node版本" prop="nodejs_version">
					<div class="flex items-center">
						<div class="flex items-center custom-refresh-select">
							<el-select @change="changeNodeVersionCheck" v-model="pmFormData.nodejs_version" class="!w-[16rem]">
								<el-option v-for="item in nodejs_versions" :key="item" :label="item" :value="item"></el-option>
							</el-select>
							<div class="el-input-group__append !h-3rem !flex items-center">
								<bt-button title="刷新Node版本" class="!flex" @click="getNodeData(true)">
									<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
								</bt-button>
							</div>
						</div>
						<span class="ml-8px text-small text-secondary">* 请根据项目选择合适的Node版本，</span>
						<bt-link @click="openNodeVersionEvent">安装其他版本</bt-link>
					</div>
				</el-form-item>

				<el-form-item label="添加方式" prop="add_type" v-if="!isEdit">
					<el-radio-group v-model="pmFormData.add_type" @change="onChangeAddType">
						<el-radio-button :label="0">自定义添加</el-radio-button>
						<el-radio-button :label="1">从文件/内容添加</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<div v-if="pmFormData.add_type === 0" class="mt-2rem">
					<el-form-item label="启动文件" prop="project_file">
						<bt-input-icon v-model="pmFormData.project_file" readOnly icon="el-folder-opened" placeholder="请选择项目启动文件" @icon-click="onSelectFile('file', 'file')" width="32rem" />
					</el-form-item>
					<el-form-item label="运行目录" prop="project_cwd">
						<bt-input-icon v-model="pmFormData.project_cwd" readOnly icon="el-folder-opened" placeholder="请选择项目运行目录" @icon-click="onSelectFile('cwd', 'dir')" width="32rem" />
					</el-form-item>

					<el-form-item label="负载实例数量" prop="cluster">
						<div class="flex items-center">
							<bt-input width="10rem" class="!w-[10rem]" type="number" v-model="pmFormData.cluster" :min="1"></bt-input>
							<span class="text-small text-secondary ml-[0.8rem]">* 若实例数量大于1，则开启集群模式</span>
						</div>
					</el-form-item>

					<el-form-item label="内存上限" prop="max_memory_limit">
						<div class="flex items-center">
							<bt-input width="16rem" class="!w-[16rem]" type="number" text-type="MB" :min="1" v-model="pmFormData.max_memory_limit"></bt-input>
							<span class="text-small text-secondary ml-[0.8rem]">* 超过上限PM2会自动重启项目，系统最大可用内存为[{{ nodeData.maximum_memory }}MB]</span>
						</div>
					</el-form-item>

					<el-form-item label="自动重载">
						<el-switch v-model="pmFormData.watch"></el-switch>
					</el-form-item>

					<el-form-item label="包管理器">
						<div class="flex items-center">
							<el-select v-model="pmFormData.pkg_manager" class="!w-[16rem]">
								<el-option v-for="(item, index) in package_managers" :key="index" :label="item" :value="item"></el-option>
							</el-select>
							<span class="text-small text-[#666 mx-8px">* 请选择项目的包管理器</span>
							<el-checkbox v-if="!isEdit" v-model="pmFormData.not_install_pkg"> 不安装node_module </el-checkbox>
						</div>
					</el-form-item>
				</div>

				<div class="mt-2rem" v-else>
					<el-form-item label="配置文件">
						<div class="flex items-center">
							<bt-input-icon v-model="pmFormData.config_file" readOnly icon="el-folder-opened" placeholder="请选择项目配置文件" @icon-click="onSelectFile('config_file', 'file')" width="32rem" />

							<span class="text-small text-tertiary leading-[18px] ml-4px">* 请选择pm2的ecosystem配置文件或粘贴内容</span>
						</div>
					</el-form-item>
					<el-form-item label="运行目录" prop="project_cwd">
						<bt-input-icon v-model="pmFormData.project_cwd" readOnly icon="el-folder-opened" placeholder="请选择项目运行目录" @icon-click="onSelectFile('cwd', 'dir')" width="30rem" />
					</el-form-item>

					<el-form-item label="内容" prop="config_body">
						<bt-editor v-model="pmFormData.config_body" style="height: 24rem" class="!h-[24rem] w-[58rem]"></bt-editor>
					</el-form-item>
				</div>

				<BtSettingDivider :is-show-divider="!isEdit">
					<template #config>
						<!-- 自定义添加特殊配置 -->
						<div v-if="pmFormData.add_type === 0" class="mb-[2rem]">
							<el-form-item label="参数">
								<bt-input width="32rem " placeholder="请输入项目参数" v-model="pmFormData.project_args"></bt-input>
							</el-form-item>

							<el-form-item label="环境变量">
								<bt-input width="32rem" placeholder="请输入项目环境变量，一行一个" resize="none" :rows="3" v-model="pmFormData.env" type="textarea"></bt-input>
							</el-form-item>
						</div>

						<!-- 其他通用高级配置 -->
						<AdvancedConfig ref="advanceConfigRef" label-width="90px" :rowData="siteInfo?.project_config" :ps="ps"> </AdvancedConfig>
					</template>
				</BtSettingDivider>
			</template>
		</BtForm>

		<el-button v-if="isEdit" type="primary" class="!mt-[1.2rem] !ml-10rem" @click="saveEdit"> 保存修改 </el-button>
		<ul class="mt-[8px] leading-8 text-small list-disc ml-32px" :class="{ 'mb-[20px]': isEdit }">
			<li>【启动文件】用于启动nodejs项目的启动文件，通常是一个js文件</li>
			<li>【配置文件】用于pm2直接启动服务的文件，通常是名为ecosystem.config.cjs</li>
			<li>【运行目录】运行项目时默认的运行目录，通常为启动文件或配置文件所在目录</li>
			<li>【负载实例数】集群模式，有些项目可能不支持，实例数量>1时为开启集群模式</li>
			<li>【负载均衡】开启集群模式后将根据实例数自动负载均衡</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { useSiteStore } from '@/views/site/useStore'
import AdvancedConfig from './advanced-config.vue'
import { defaultVerify, swapString } from '@/utils'
import { getNodeConfig, nodeData, isEdit, openNodeVersionEvent, submitEditNodeData, useCheckNodeVersionNpm } from '../useController'
import { fileSelectionDialog } from '@/public'
import { getFileBody } from '@/api/global'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isEdit: false,
	}),
})

const { siteInfo } = useSiteStore()
// const nodeData = inject<any>('nodeData', {
// 	nodejs_versions: [], // Node版本
// 	package_managers: [], // 包管理器
// 	user_list: [], // 运行用户
// 	maximum_memory: 1024, // 最大内存
// }) // 配置信息
const nodejs_versions = ref(nodeData.value.nodejs_versions) // Node
const package_managers = ref(nodeData.value.package_managers) // 包管理器
const ps = computed(() => {
	if (isEdit.value) return siteInfo.value.ps
	return pmFormData.value.project_name
}) // 项目备注
const advanceConfigRef = ref() // 高级配置ref

const getNodeData = inject<any>('getNodeData', (isRefresh: boolean) => {})

/**
 * @description 获取文件内容
 * @param path  文件路径
 */
const getFileBodyEvent = async (path: string) => {
	try {
		const { data: res } = await getFileBody({ path })
		return res.data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 选择文件
 * @param val
 */
const onSelectFile = (val: any, type: 'file' | 'dir') => {
	fileSelectionDialog({
		type: type,
		path: val === 'file' ? pmFormData.value.project_file : pmFormData.value.project_cwd,
		change: async (path: string) => {
			const name = pmFormData.value.project_name // 项目名称
			// 若为运行目录，填充项目名称
			if (val === 'cwd') {
				pmFormData.value.project_cwd = path
				let str = path.substring(path.lastIndexOf('/') + 1)?.replace(/\W/g, '_')
				if (!name) pmFormData.value.project_name = str
			} else {
				// 若为启动文件，填充运行目录+项目名称
				pmFormData.value.project_cwd = path.substring(0, path.lastIndexOf('/'))
				let str = pmFormData.value.project_cwd.substring(pmFormData.value.project_cwd.lastIndexOf('/') + 1)?.replace(/\W/g, '_')
				// 使用运行目录填充项目名称
				if (!name) pmFormData.value.project_name = str
				if (val === 'file') {
					pmFormData.value.project_file = path
				}
				if (val === 'config_file') {
					pmFormData.value.config_file = path
					const res = await getFileBodyEvent(path) // 读取文件内容
					pmFormData.value.config_body = res // 填充
				}
			}
		},
	})
}

/**
 * @description 清除表单校验
 * @param val
 */
const onChangeAddType = (val: string) => {
	// 	清除表单校验
	clearValidate()
}

/**
 * @description 切换Node版本
 * @param val
 */
const changeNodeVersionCheck = async (val: string) => {
	const res = await useCheckNodeVersionNpm(val)
	// 将包管理替换为该版本适用的包管理
	package_managers.value = res
	pmFormData.value.pkg_manager = res[0] || ''
}

const {
	BtForm,
	submit,
	param: pmFormData,
	clearValidate,
} = useForm({
	data: async () => {
		await getNodeConfig()
		package_managers.value = nodeData.value.package_managers
		nodejs_versions.value = nodeData.value.nodejs_versions
		if (isEdit.value) {
			const { project_config, ps } = siteInfo.value
			return {
				...project_config,
				project_ps: swapString(ps),
				watch: project_config.watch === 'true',
			}
		}
		return {
			add_type: 0, // 添加方式

			project_name: '', // 项目名称
			project_type: 'pm2',
			project_cwd: '', // 项目目录
			project_file: '', // 启动文件

			pkg_manager: package_managers.value?.at(0) || 'yarn', // 包管理器
			not_install_pkg: false, // 是否安装node_module
			nodejs_version: nodejs_versions.value?.at(0) || '', // Node版本

			cluster: 1, // 实例数量
			max_memory_limit: 1024, // 内存上限
			watch: false, // 自动重载

			config_file: '', // 配置文件
			config_body: '', // 配置内容

			project_args: '', // 参数
			env: '', // 环境变量
		}
	},
	options: () =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					project_name: [defaultVerify({ message: '请输入项目名称' })],
					project_file: [{ required: true, message: '请输入项目启动文件', trigger: ['blur', 'change'] }],
					nodejs_version: [{ required: true, message: '请选择Node版本', trigger: ['blur', 'change'] }],
					project_cwd: [defaultVerify({ message: '请输入项目启动目录' })],
					cluster: [{ required: true, message: '请输入负载实例数量', trigger: ['blur', 'change'] }],
					max_memory_limit: [{ required: true, message: '请输入内存上限', trigger: ['blur', 'change'] }],
				},
			},
		]),
	submit: async (param: any, validate: any) => {
		await validate()
		let params: any
		let a_form = advanceConfigRef.value.formData // 高级配置表单数据
		params = {
			...param.value,
			...a_form,
			domains: a_form.domains ? a_form.domains.split('\n') : [],
		}
		if (params.add_type === 0) delete params.config_file, delete params.config_body
		delete params.add_type
		return params
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

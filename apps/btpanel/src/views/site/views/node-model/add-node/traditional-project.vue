<template>
	<div
		class="overflow-auto"
		:style="{
			'max-height': isEdit ? '76rem' : '52rem',
		}">
		<BtForm label-width="80px">
			<template #custom>
				<el-form-item label="项目名称" prop="project_name">
					<bt-input v-model="traditionalForm.project_name" width="32rem" :disabled="isEdit" placeholder="请输入项目名称"></bt-input>
				</el-form-item>

				<el-form-item label="Node版本" prop="nodejs_version">
					<div class="flex items-center">
						<div class="flex items-center custom-refresh-select">
							<el-select v-model="traditionalForm.nodejs_version" class="!w-[16rem]">
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
				<el-form-item label="启动文件" prop="project_file">
					<bt-input-icon v-model="traditionalForm.project_file" readOnly placeholder="请选择项目启动文件" icon="el-folder-opened" @icon-click="openFileSelectView('file', 'file')" width="32rem" />
				</el-form-item>
				<el-form-item label="运行目录" prop="project_cwd">
					<bt-input-icon v-model="traditionalForm.project_cwd" readOnly placeholder="请选择项目运行目录" icon="el-folder-opened" @icon-click="openFileSelectView('cwd', 'dir')" width="32rem" />
				</el-form-item>
				<el-form-item label="参数">
					<bt-input width="32rem " placeholder="请输入项目参数" v-model="traditionalForm.project_args"></bt-input>
				</el-form-item>
				<el-form-item label="环境变量">
					<bt-input width="32rem" placeholder="请输入项目环境变量，一行一个，格式参照key=value" resize="none" :rows="3" v-model="traditionalForm.env" type="textarea"></bt-input>
				</el-form-item>
			</template>
		</BtForm>

		<!-- 高级配置 -->
		<BtSettingDivider :is-show-divider="!isEdit">
			<template #config>
				<AdvancedConfig ref="advanceConfigRef" label-width="80px" :rowData="{ ...siteInfo?.project_config, listen: siteInfo?.listen }" :ps="traditionalForm.project_name"> </AdvancedConfig>
			</template>
		</BtSettingDivider>

		<el-button v-if="isEdit" type="primary" class="!mt-[1.2rem] !ml-10rem" @click="saveEdit"> 保存修改 </el-button>
		<ul class="mt-8px leading-8 text-small list-disc ml-32px">
			<li>【启动文件】用于启动nodejs项目的启动文件，通常是一个js文件</li>
			<li>【运行目录】运行项目时默认的运行目录，通常为启动文件或配置文件所在目录</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { useSiteStore } from '@/views/site/useStore'
import AdvancedConfig from './advanced-config.vue'
import { defaultVerify } from '@/utils'
import { getNodeConfig, nodeData, isEdit, openNodeVersionEvent, submitEditNodeData } from '../useController'
import { fileSelectionDialog } from '@/public'

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
const advanceConfigRef = ref() // 高级配置实例

const getNodeData = inject<any>('getNodeData', (isRefresh: boolean) => {})

/**
 * 打开文件选择器 -启动参数
 */
const openFileSelectView = async (val: any, type: 'file' | 'dir') => {
	fileSelectionDialog({
		type: type,
		path: val === 'file' ? traditionalForm.value.project_file : traditionalForm.value.project_cwd,
		change: async (path: string) => {
			val === 'file' ? (traditionalForm.value.project_file = path) : (traditionalForm.value.project_cwd = path)
			const name = traditionalForm.value.project_name // 项目名称
			// 若为运行目录且项目名称为空，填充项目名称
			if (val === 'cwd' && name === '') {
				let str = path.substring(path.lastIndexOf('/') + 1)?.replace(/\W/g, '_')
				traditionalForm.value.project_name = str
			}
			// 若为启动文件，填充运行目录+项目名称
			if (val === 'file') {
				traditionalForm.value.project_cwd = path.substring(0, path.lastIndexOf('/'))
				// 使用运行目录填充项目名称
				let str = traditionalForm.value.project_cwd.substring(traditionalForm.value.project_cwd.lastIndexOf('/') + 1)?.replace(/\W/g, '_')
				// 若项目名称为空，则填充项目名称
				if (name === '') traditionalForm.value.project_name = str
			}
		},
	})
}

const {
	BtForm,
	submit,
	param: traditionalForm,
} = useForm({
	data: async () => {
		await getNodeConfig()
		nodejs_versions.value = nodeData.value.nodejs_versions
		if (isEdit.value) {
			return siteInfo.value?.project_config
		}
		return {
			project_name: '', // 项目名称
			nodejs_version: nodejs_versions.value?.at(0) || '', // Node版本
			project_file: '', // 启动文件
			project_cwd: '', // 项目目录
			project_type: 'general', // 项目类型
			project_args: '', // 项目参数
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
					nodejs_version: [{ required: true, message: '请选择Node版本', trigger: ['blur', 'change'] }],
					project_file: [{ required: true, message: '请输入项目启动文件', trigger: ['blur', 'change'] }],
					project_cwd: [defaultVerify({ message: '请输入项目启动目录' })],
				},
			},
		]),
	submit: async (param: any, validate: any) => {
		let params: any = false
		await validate()
		let a_form = advanceConfigRef.value.formData // 高级配置表单数据
		params = {
			...param.value,
			...a_form,
			domains: a_form.domains ? a_form.domains.split('\n') : [],
		}
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

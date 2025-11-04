<template>
	<div class="p-2rem max-h-[60rem] overflow-y-auto" v-bt-loading="isLoading">
		<el-form ref="packFormRef" :model="packForm" :rules="rules" label-width="120px">
			<el-form-item label="名称" prop="name">
				<bt-input v-model="packForm.name" width="35rem"></bt-input>
			</el-form-item>
			<el-form-item label="版本" prop="version">
				<bt-input v-model="packForm.version" width="35rem" placeholder="版本"></bt-input>
			</el-form-item>
			<el-form-item label="PHP" prop="phpVersion">
				<bt-select v-model="packForm.phpVersion" multiple collapse-tags collapse-tags-tooltip clearable class="w-[35rem]" placeholder="请选择PHP版本" :options="phpOptions"></bt-select>
			</el-form-item>
			<el-form-item label="需要解禁的函数">
				<bt-input v-model="packForm.function" type="textarea" width="35rem" resize="none" :rows="2" placeholder="多个请用 , 逗号隔开"></bt-input>
			</el-form-item>
			<el-form-item label="部署成功后访问的URL" prop="path">
				<bt-input v-model="packForm.path" width="35rem" placeholder="例如：/index.php"></bt-input>
			</el-form-item>
			<el-form-item label="Mysql" prop="mysqlVersion">
				<bt-select v-model="packForm.mysqlVersion" multiple clearable class="w-[35rem]" placeholder="请选择Mysql版本" :options="mysqlOptions"></bt-select>
			</el-form-item>
			<el-form-item label="数据库配置文件">
				<div>
					<div v-for="file in packForm.initFile" :key="file.file" class="flex items-center">
						<div class="inline-block max-w-[48rem] truncate">
							<bt-ellipsis-tooltip :text="file.file"></bt-ellipsis-tooltip>
						</div>
						<span class="ml-[1rem] text-danger cursor-pointer" @click="delFileEvent(file.file)">删除</span>
					</div>
					<div class="flex items-center">
						<el-button @click="addFileEvent">添加配置文件</el-button>
						<el-tooltip class="item" effect="dark" content="如果自动识别有误，请从服务器选择.php格式的数据配置文件，部署时会自动填充新的数据库账号信息" placement="top">
							<span class="svgtofont-el-warning-filled text-warning text-medium ml-[1rem]"></span>
						</el-tooltip>
					</div>
				</div>
			</el-form-item>
			<el-form-item label=" ">
				<el-checkbox v-model="packForm.init">将当前网站关联的数据库当作初始化数据</el-checkbox>
			</el-form-item>
			<el-form-item v-show="packForm.init" label="关联数据库" prop="databaseId">
				<bt-select v-model="packForm.databaseId" class="w-[35rem]" placeholder="请选择关联数据库" :options="dbOptions"></bt-select>
			</el-form-item>
			<el-form-item label="需要排除的目录">
				<bt-input v-model="packForm.dir" type="textarea" width="35rem" resize="none" :rows="2" placeholder="一行一个，只支持绝对路径"></bt-input>
			</el-form-item>
			<el-form-item label="更新日志">
				<bt-input v-model="packForm.log" type="textarea" width="35rem" resize="none" :rows="2"></bt-input>
			</el-form-item>
		</el-form>
		<bt-help :options="helpList" class="pl-[5rem]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { createPhpApp, getPhpEnvInfo } from '@/api/site'
import { useDataHandle, useMessage } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { defaultVerify } from '@/utils'
import { useSiteStore } from '@site/useStore'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()

const isLoading = ref<boolean>(false) // 加载状态
const packFormRef = ref<any>() // 表单实例
const packForm = reactive({
	// 表单数据
	name: '',
	version: '',
	path: '',
	phpVersion: [] as string[],
	function: '',
	mysqlVersion: [] as string[],
	databaseName: '',
	databaseId: '',
	dir: '',
	log: '',
	init: false, // 当前网站关联数据库是否当作初始化数据
	initFile: [] as { file: string; body: string }[],
	initData: '',
})

const phpOptions = ref<any[]>([]) // php版本选项
const mysqlOptions = ref<any[]>([]) // mysql版本选项
const dbOptions = ref<any[]>([]) // 数据库选项

const helpList = [
	{ content: '如果您的应用有多个需要支持php或mysql版本，请添加' },
	{ content: '打包时会将当前使用PHP版本的所有扩展记录，应用部署时会自动安装' },
	{
		content: `如果您有需要自动填充数据库的数据库配置文件，请到配置文件中将数据库的信息修改成如下值再进行打包<br >
		数据库名：BT_APP_PACKAGE_DB_NAME<br >
		数据库账户：BT_APP_PACKAGE_DB_USER<br >
		数据库密码：BT_APP_PACKAGE_DB_PASS`,
		isHtml: true,
	},
]

const rules = reactive({
	// 表单验证规则
	name: [defaultVerify({ message: '请输入名称' })],
	version: [defaultVerify({ message: '请输入版本' })],
	phpVersion: [defaultVerify({ message: '请选择php版本', trigger: 'change' })],
})

/**
 * @description 添加配置文件
 * @param {string} file 配置文件路径
 */
const addFileEvent = () => {
	fileSelectionDialog({
		type: 'file',
		change: (path: string) => {
			// 如果不是.php后缀
			if (!path.endsWith('.php')) {
				Message.error('请选择.php格式的数据配置文件')
				return
			}
			// 如果已经存在
			if (packForm.initFile.some(item => item.file === path)) {
				Message.error('文件已存在')
				return
			}

			packForm.initFile.push({
				file: path,
				body: '',
			})
		},
	})
}

/**
 * @description 删除配置文件
 * @param {string} file 配置文件路径
 */
const delFileEvent = (file: string) => {
	packForm.initFile = packForm.initFile.filter(item => item.file !== file)
}

/**
 * @description 设置数据
 * @param {any} data 数据
 */
const setData = (data: any) => {
	// php版本选项
	phpOptions.value = data.php.versions.map((version: any) => ({
		value: version,
		label: `PHP-${version}`,
	}))
	// php版本默认选中
	packForm.phpVersion = data.php.last_php_versions !== '' ? data.php.last_php_versions : data.php.used === '00' ? [] : [data.php.used]

	// mysql版本选项
	mysqlOptions.value = data.mysql.versions.map((version: any) => ({
		value: version,
		label: `Mysql-${version}`,
	}))
	// mysql版本默认选中
	packForm.mysqlVersion = data.mysql.last_mysql_versions !== '' ? data.mysql.last_mysql_versions : [data.mysql.used]

	// 数据库选项
	dbOptions.value = data.db.all.map((database: any) => ({
		value: database.id,
		label: `${database.name}`,
	}))
	// 数据库默认信息
	packForm.databaseId = data.mysql.last_db_id || data.db.used.id
	packForm.databaseName = data.mysql.last_db_name || data.db.used.name

	// 是否关联数据库
	packForm.init = !!(data.mysql.last_db_config_files.length > 0 && data.mysql.last_db_id) || !!(data.db_config_file.length > 0 && data.db.used.name)

	// 初始数据库配置文件
	packForm.initFile = data.mysql.last_db_config_files.length > 0 ? data.mysql.last_db_config_files : data.db_config_file

	// 初始php函数
	packForm.function = data.last_php_functions
}

/**
 * @description 获取选项数据
 */
const getOptionsData = async () => {
	useDataHandle({
		loading: isLoading,
		request: getPhpEnvInfo({ site_name: siteInfo.value.name }),
		success: (res: any) => {
			if (res.status) setData(res.data)
		},
	})
}

/**
 * @description 获取表单参数
 */
const getParams = () => {
	let params: any = {
		site_name: siteInfo.value.name,
		app_name: packForm.name,
		app_version: packForm.version,
		php_versions: packForm.phpVersion.join(','),
		init_sql: packForm.init ? 1 : 0,
		success_url: packForm.path,
		db_config_files: JSON.stringify(packForm.initFile.map(item => item.file)),
	}
	if (packForm.init) {
		params.db_id = packForm.databaseId
		params.db_name = dbOptions.value.find(item => item.value === packForm.databaseId)?.label || ''
	}
	if (packForm.function !== '') {
		params.php_functions = packForm.function
	}
	if (packForm.mysqlVersion.length > 0) {
		params.mysql_versions = packForm.mysqlVersion.join(',')
	}
	if (packForm.dir !== '') {
		params.exclude_dir = packForm.dir
	}
	if (packForm.log !== '') {
		params.update_log = packForm.log
	}
	return params
}

/**
 * @description 创建应用环境包
 */
const onConfirm = (close: any) => {
	packFormRef.value.validate(async (valid: boolean) => {
		if (!valid) return
		const params: any = getParams()

		useDataHandle({
			loading: '正在创建，请稍后...',
			request: createPhpApp(params),
			message: true,
			success: (res: any) => {
				if (res.status) {
					props.compData.refreshEvent()
					close()
				}
			},
		})
	})
}

onMounted(() => getOptionsData())

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>

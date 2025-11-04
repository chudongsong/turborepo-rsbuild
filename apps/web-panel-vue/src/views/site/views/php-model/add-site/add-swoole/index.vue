<template>
	<div>
		<el-form ref="addSwooleSiteFormRef" :disabled="formDisabled" :model="addSiteForm" :rules="rules">
			<el-form-item label="绑定域名" prop="domains">
				<el-popover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
					<div class="!p-[12px] bg-primary text-white">
						如需填写多个域名，请换行填写，每行一个域名，默认为80端口
						<br />
						IP地址格式：192.168.1.199
						<br />
						泛解析添加方法 *.domain.com
						<br />
						如另加端口格式为 www.domain.com:88
					</div>
					<template #reference>
						<bt-input
							@input="handleInputName"
							v-model="addSiteForm.domains"
							type="textarea"
							width="52rem"
							v-popover:popover
							:rows="4"
							resize="none"
							@focus="popoverFocus = true"
							:placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'"></bt-input>
					</template>
				</el-popover>
			</el-form-item>
			<el-form-item label="项目目录" prop="site_path">
				<bt-input-icon v-model="addSiteForm.site_path" placeholder="请输入项目目录" icon="el-folder-opened" width="52rem" @focus="isSelect = true" @blur="checkInstallVersion" @icon-click="onPathChange"></bt-input-icon>
			</el-form-item>
			<el-form-item label="swoole版本">
				<div class="flex">
					<div>
						<el-select v-model="addSiteForm.swoole_version" class="!w-[8rem]" @change="changeSwooleVersion">
							<el-option label="2.x" :value="2"></el-option>
							<el-option label="4.x" :value="4"></el-option>
							<el-option label="5.x" :value="5"></el-option>
						</el-select>
					</div>
					<el-form-item label="PHP版本" prop="php_version">
						<div class="flex items-center h-3.2rem">
							<el-select v-model="addSiteForm.php_version" placeholder="请选择PHP版本" class="!w-[14rem]" @change="changeVersion">
								<el-option v-for="(item, index) in versionOptions" :key="index" :disabled="!item.setup_status" :label="`PHP-${item.php_version}`" :value="item.php_version">
									<span>PHP-{{ item.php_version }}</span>
									<template v-if="!item.setup_status">
										[
										<span class="mx-[4px] bt-link" @click="installPlugin(item.php_version)">未安装</span>
										]
									</template>
								</el-option>
							</el-select>
							<template v-if="addSiteForm.php_version">
								<span v-if="!currentPhp?.swoole_status" class="text-small ml-[8px] flex items-center">
									当前php未安装swoole扩展
									<bt-link class="ml-[4px]" @click="openPlugin">>>立即安装</bt-link>
								</span>
								<span v-else-if="!currentPhp?.setup_swoole_isactive && currentPhp?.swoole_version" class="text-small ml-[8px] flex items-center">
									当前php未安装swoole{{ addSiteForm.swoole_version }}扩展
									<bt-link class="ml-[4px]" @click="openPlugin">>>立即安装</bt-link>
								</span>
							</template>
						</div>
					</el-form-item>
				</div>
			</el-form-item>
			<el-form-item label="数据库">
				<div class="flex items-center">
					<el-select class="!w-[16rem]" v-model="addSiteForm.sql" :disabled="!softStatus.database">
						<el-option label="不创建" :value="false"></el-option>
						<el-option label="MySQL" value="MYSQL"></el-option>
					</el-select>
					<span v-if="!softStatus.database" @click="installPlugin('mysql')" class="ml-[4px] text-danger cursor-pointer !text-small">未安装数据库，点击安装</span>
					<el-select class="!w-[16rem] ml-[8px]" v-if="addSiteForm.sql" v-model="addSiteForm.codeing">
						<el-option label="utf8mb4" value="utf8mb4"></el-option>
						<el-option label="utf8" value="utf8"></el-option>
						<el-option label="gbk" value="gbk"></el-option>
						<el-option label="big5" value="big5"></el-option>
					</el-select>
				</div>
			</el-form-item>
			<el-form-item label="数据库账号" v-if="addSiteForm.sql">
				<div class="flex items-center mb-[4px]">
					<el-form-item prop="datauser"><bt-input placeholder="创建数据库账号" class="w-[24rem]" v-model="addSiteForm.datauser"></bt-input></el-form-item>
					<el-form-item label="密码" class="!mt-0">
						<bt-input placeholder="数据库密码" class="w-[24rem]" v-model="addSiteForm.datapassword"></bt-input>
					</el-form-item>
				</div>
				<span class="text-tertiary text-small">创建站点的同时，为站点创建一个对应的数据库帐户，方便不同站点使用不同数据库。</span>
			</el-form-item>
			<el-form-item label="运行用户">
				<el-select class="!w-[16rem]" v-model="addSiteForm.run_user">
					<el-option v-for="item in systemUserOptions" :key="item" :label="item" :value="item"></el-option>
				</el-select>
				<span class="text-tertiary text-small ml-[.4rem]">* 无特殊需求请选择www用户</span>
			</el-form-item>
			<el-form-item label="启动命令" prop="project_cmd">
				<bt-input v-model="addSiteForm.project_cmd" width="52rem" placeholder="请输入项目的启动命令，例：php serve.php"></bt-input>
			</el-form-item>
			<el-form-item label="依赖安装">
				<el-select class="!w-[16rem]" v-model="addSiteForm.composer_version" :empty-values="[null, undefined]" @change="changeComposer">
					<el-option label="不安装" value=""></el-option>
					<el-option label="用composer2.7.3安装" value="2.7.3"></el-option>
					<el-option label="用composer1.10.27安装" value="1.10.27"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="addSiteForm.project_ps" placeholder="请输入备注,可为空" width="52rem"></bt-input>
			</el-form-item>
		</el-form>
		<bt-help class="mt-2rem pl-1rem" :options="helpList"> </bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { fileSelectionDialog, openPluginView, pluginInstallDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { getRandomChart } from '@/utils'
import { checkVariable } from '@/utils/check'
import { getPluginInfo } from '@api/global'
import { GetPHPVersion, checkAutoInstall, checkInstallAsync, createAsync, getSwooleCorrespondencePhp, getSystemUserListAsync } from '@api/site'
import { useSiteStore } from '@site/useStore'
import { rules } from '@site/views/php-model/useController'
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { panel } = useGlobalStore()
const { isRefreshList } = useSiteStore()

const Message = useMessage() // 消息提示

const softStatus = reactive({
	database: false,
})
const addSwooleSiteFormRef = ref<any>()
const formDisabled = ref(false)
const addSiteForm = ref({
	site_path: '/www/wwwroot',
	project_cmd: '',
	install_dependence: 0,
	php_version: '',
	swoole_version: 4,
	domains: '',
	sql: false,
	project_ps: '',
	project_port: '',
	codeing: 'utf8mb4',
	open_proxy: false,
	project_proxy_path: '',
	datauser: '',
	datapassword: '',
	run_user: 'www',
	composer_version: '',
})

const popoverFocus = ref(false) // 域名popover
const versionOptions = ref<any>([])
const systemUserOptions = ref<any>([])
const checkInfo = ref<any>({})
const isSelect = ref<boolean>(false)
const currentPhp = ref<AnyObject>({})
let defaultPathValue = '/www/wwwroot/'

const helpList = [
	{ content: '当前仅支持nginx服务器使用' },
	{ content: '【swoole版本】开启自动安装依赖时会给对应版本的php安装swoole' },
	{
		content: (
			<>
				【自动安装项目依赖】只尝试
				<span class="text-danger">composer install</span>
				进行安装依赖，最终安装结果请前往 项目-日志-安装依赖日志 进行确认，若安装依赖不成功，项目会
				<span class="text-danger">启动失败</span>
			</>
		),
	},
	{ content: '安装依赖不成功，可能和composer版本有关，可尝试切换composer版本' },
]

/**
 * @description: 安装插件
 */
const installPlugin = async (version: string) => {
	const name = version === 'mysql' ? version : 'php-' + (Number(version) / 10).toFixed(1)
	const { data } = await getPluginInfo({ sName: name })
	pluginInstallDialog({
		name: data.name,
		type: 'i',
		pluginInfo: data,
	})
}

const changeInstall = (val: any) => {
	addSiteForm.value.install_dependence = val
	if (!val) Message.warn('关闭自动安装项目依赖后，项目启动可能会失败')
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: addSiteForm.value.site_path.replace(/\/$/, ''),
		change: (path: any) => {
			const str = checkVariable(path, 'string', '')
			addSiteForm.value.site_path = path
			isSelect.value = true
			// defaultPathValue = (str + '/')?.replace(/\/\//g, '/')
			checkInstallVersion()
		},
	})
}

/**
 * @description: 检查是否安装依赖
 */
const checkInstallVersion = async () => {
	try {
		const res = await checkAutoInstall({
			path: addSiteForm.value.site_path,
		})
		addSiteForm.value.composer_version = res.data ? '2.7.3' : ''
		addSiteForm.value.install_dependence = res.data ? 1 : 0
	} catch (error) {
		console.log(error)
	}
}

const installOtherPhp = async () => {
	try {
		const { data } = await getPluginInfo({ sName: 'php-8.2' })
		// pluginInstallDialog({
		// 	name: 'php-8.2',
		// 	type: 'i',
		// 	pluginInfo: data,
		// 	softData: data,
		// })
		// 处理数据格式
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取php版本
 */
const getPHPVersion = async () => {
	try {
		const res = await GetPHPVersion()
		//排除纯静态
		versionOptions.value = res.data.filter((item: any) => item.name !== '纯静态')
		// 倒叙排列
		versionOptions.value = versionOptions.value.reverse()
		addSiteForm.value.php_version = versionOptions.value?.length ? versionOptions.value[0].version : ''
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 检查是否安装swoole
 */
const checkInstall = async (isLoad: boolean = false) => {
	try {
		let load: any
		if (isLoad) load = Message.load('正在检查安装信息，请稍后...')
		const res = await checkInstallAsync({
			name: 'swoole',
			php_version: addSiteForm.value.php_version,
		})
		if (isLoad) load.close()
		checkInfo.value = res
	} catch (error) {}
}

/**
 * @description 打开插件
 */
const openPlugin = async () => {
	try {
		const version = 'php-' + (Number(addSiteForm.value.php_version) / 10).toFixed(1)
		if (version) {
			openPluginView({ name: version })
		}
	} catch (error) {}
}

/**
 * @description: 切换php版本
 * @param val
 */
const changeVersion = async (val: any) => {
	addSiteForm.value.php_version = val
	currentPhp.value = versionOptions.value.find((item: any) => item.php_version === val) ?? {}
}

const handleInputName = (val: any) => {
	// addSiteForm.value.domains = val
	if (typeof val !== 'string') return
	if (!addSiteForm.value.site_path || addSiteForm.value.site_path === defaultPathValue.replace(/\/$/, '')) isSelect.value = false
	if (!isSelect.value) addSiteForm.value.site_path = defaultPathValue?.replace(/\/\//g, '/') + val.split('\n')[0]?.replace(/:/g, '_')?.trim()
	addSiteForm.value.datauser = val.split('\n')[0]?.replace(/\W/g, '_')?.substr(0, 16)
	addSiteForm.value.datapassword = getRandomChart(16)
	addSiteForm.value.project_ps = val.split('\n')[0]
}

const changeComposer = (val: any) => {
	addSiteForm.value.composer_version = val
	addSiteForm.value.install_dependence = !val ? 0 : 1
}

const handleData = (data: any) => {
	let params: any = {
		...data,
		sql_user: data.datauser,
		sql_pwd: data.datapassword,
		sql_codeing: data.codeing,
		install_dependence: data.install_dependence,
		open_proxy: data.open_proxy ? 1 : 0,
		webname: {
			domain: '',
			domainlist: [],
			count: 0,
		},
	}

	let webList = data.domains?.split('\n')
	webList.forEach((item: any, index: number) => {
		// let temps = item.replace(/\r\n/, '').split(':')
		if (index === 0) {
			params.webname.domain = item
		} else {
			params.webname.domainlist.push(webList[index])
		}
	})
	params.webname.count = params.webname.domainlist.length
	params.webname = JSON.stringify(params.webname)
	delete params.domains
	delete params.datauser
	delete params.datapassword
	delete params.codeing
	return params
}

const onConfirm = async (close: any) => {
	await addSwooleSiteFormRef.value.validate()
	if (!currentPhp.value?.swoole_status) {
		await useConfirm({
			width: 50,
			title: `提示`,
			isHtml: true,
			content: '当前版本PHP-安装扩展未安装swoole，可能导致项目无法启动，是否继续操作？',
			icon: 'warning-filled',
		})
	}
	const params: any = handleData(addSiteForm.value)
	const res: AnyObject = await useDataHandle({
		request: createAsync(params),
		message: true,
	})
	if (res?.status) {
		isRefreshList.value = true
		close()
	}
}

const getSystemUserListData = async () => {
	try {
		const res = await getSystemUserListAsync()
		systemUserOptions.value = res.data
	} catch (error) {}
}

const changeSwooleVersion = async (val: any) => {
	addSiteForm.value.swoole_version = val
	await getSwoolePhp()
}

/**
 * @description 获取对应swoole版本的php版本
 */
const getSwoolePhp = async () => {
	try {
		const res = await getSwooleCorrespondencePhp({
			swoole_version: addSiteForm.value.swoole_version,
		})
		if (res.status) {
			versionOptions.value = res.data
			const arr = versionOptions.value?.filter((item: any) => item.setup_status)
			addSiteForm.value.php_version = arr[0]?.php_version
			currentPhp.value = arr[0] ?? {}
		}
	} catch (error) {}
}

// 初始化
const init = async () => {
	const res = await props.compData.getStatus()
	softStatus.database = res.mysql
	// 获取当前站点默认建站路径
	const defaultPath = panel.value.sitePath
	if (defaultPath) {
		addSiteForm.value.site_path = defaultPath
		defaultPathValue = (defaultPath + '/')?.replace(/\/\//g, '/')
	}
	getSwoolePhp()
	getSystemUserListData()
}

onMounted(init)

defineExpose({
	init,
	onConfirm,
})
</script>

<style lang="css" scoped>
:deep(.el-popover.el-popper[x-placement].white-tips-popover .popper__arrow::after) {
	border-top-color: var(--el-color-primary) !important;
	border-bottom-color: var(--el-color-primary) !important;
}
</style>

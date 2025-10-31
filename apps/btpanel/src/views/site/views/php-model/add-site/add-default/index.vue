<template>
	<div class="">
		<el-form :model="addSiteForm" :rules="rules" :disabled="formDisabled" ref="addSiteFormRef">
			<el-form-item label="域名" prop="webname">
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
							v-model="addSiteForm.webname"
							type="textarea"
							width="52rem"
							v-popover:popover
							:rows="7"
							resize="none"
							@focus="popoverFocus = true"
							:placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'" />
					</template>
				</el-popover>
			</el-form-item>
			<!-- 测试版功能 -->
			<!-- <el-form-item label=" ">
				<el-checkbox v-model="addSiteForm.add_dns_record">使用DNS一键解析</el-checkbox>
			</el-form-item> -->
			<el-form-item label="备注">
				<bt-input v-model="addSiteForm.ps" placeholder="请输入备注,可为空" width="52rem"></bt-input>
			</el-form-item>
			<el-form-item label="根目录" prop="path">
				<bt-input-icon v-model="addSiteForm.path" placeholder="请输入根目录" icon="el-folder-opened" width="52rem" @icon-click="onPathChange"></bt-input-icon>
			</el-form-item>

			<el-form-item label="FTP">
				<div class="items-center flex">
					<el-select class="!w-[15rem]" v-model="addSiteForm.ftp" :disabled="!softStatus.ftp">
						<el-option label="不创建" :value="false"></el-option>
						<el-option label="创建" :value="true"></el-option>
					</el-select>
					<span v-if="!softStatus.ftp" @click="installPlugin('pureftpd')" class="ml-[4px] text-danger cursor-pointer !text-small">未安装FTP，点击安装</span>
				</div>
			</el-form-item>
			<el-form-item label="FTP账号" v-if="addSiteForm.ftp">
				<div class="flex items-center mb-[8px]">
					<el-form-item prop="ftp_username"><bt-input placeholder="创建FTP账号" v-model="addSiteForm.ftp_username" width="24rem"></bt-input></el-form-item>

					<el-form-item label="密码" class="!mt-0">
						<bt-input placeholder="FTP密码" v-model="addSiteForm.ftp_password" width="24rem"></bt-input>
					</el-form-item>
				</div>
				<span class="text-tertiary text-small">创建站点的同时，为站点创建一个对应FTP帐户，并且FTP目录指向站点所在目录。</span>
			</el-form-item>

			<el-form-item label="数据库">
				<div class="flex items-center">
					<el-select class="!w-[15rem]" v-model="addSiteForm.sql" :disabled="!softStatus.database">
						<el-option label="不创建" :value="false"></el-option>
						<el-option label="MySQL" value="MySQL"></el-option>
					</el-select>
					<span v-if="!softStatus.database" @click="installPlugin('mysql')" class="ml-[4px] text-danger cursor-pointer !text-small">未安装数据库，点击安装</span>
					<el-select class="ml-[8px] !w-[15rem]" v-if="addSiteForm.sql" v-model="addSiteForm.codeing">
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

			<el-form-item label="PHP版本">
				<el-select class="!w-[15rem]" v-model="addSiteForm.version">
					<el-option v-for="item in versionOptions" :key="item.value" :label="item.name" :value="item.version"></el-option>
				</el-select>
				<!-- <bt-link class="ml-[8px]" @click="installOtherPhp" v-if="!isRelease">安装其他版本</bt-link> -->
			</el-form-item>
			<el-form-item label="网站分类">
				<bt-select v-model="addSiteForm.type_id" :options="typeList" class="!w-[15rem]"></bt-select>
				<bt-link class="ml-[8px]" @click="setClassEvent">分类设置</bt-link>
			</el-form-item>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { getPluginInfo } from '@/api/global'
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { fileSelectionDialog, pluginInstallDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { checkVariable, getRandomChart } from '@/utils'
import { GetPHPVersion, addPhpSite } from '@api/site'
import { useSiteStore } from '@site/useStore'
import { classList, rules, categoryRefs } from '@site/views/php-model/useController'

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
	ftp: false,
})
const popupClose = inject<any>('popupClose') //     弹窗关闭

const formDisabled = ref(false) // 表单是否禁用
const addSiteFormRef = ref<any>() // 表单ref
const popoverFocus = ref(false) // 域名popover

const addSiteForm = ref({
	menuType: 'addDefault',
	path: '/www/wwwroot',
	ftp: false,
	type: 'PHP',
	type_id: 0,
	ps: '',
	port: '',
	version: '',
	need_index: 0,
	need_404: 0,
	sql: false,
	codeing: 'utf8mb4',
	webname: '',
	add_dns_record: false,
	ftp_username: '',
	ftp_password: '',
	datauser: '',
	datapassword: '',
})

const resultData = ref({
	ftp: true,
	ftpStatus: true,
	ftpData: {
		username: '',
		password: '',
	},
	sql: true,
	databaseStatus: true,
	sqlData: {
		username: '',
		password: '',
	},
	siteStatus: false,
	site: {
		name: false,
	},
	dns: [],
	title: '',
})
let defaultPathValue = '/www/wwwroot/'
const versionOptions = ref<any>([])

const typeList = computed(() => classList.value.filter((item: any) => item.value !== 'all' && Number(item.value) >= 0))

/**
 * @description: 设置分类事件
 */
const setClassEvent = () => {
	if (categoryRefs.value?.setClassManage) categoryRefs.value.setClassManage()
	// classSettingDialog({
	// 	type: 'site',
	// 	refresh: getTypeList,
	// });
}

/**
 * @description: 安装插件
 * @param {string} name 插件名称
 */
const installPlugin = async (name: string) => {
	const { data } = await getPluginInfo({ sName: name })
	pluginInstallDialog({
		name: data.name,
		type: 'i',
		pluginInfo: data,
	})
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: addSiteForm.value.path,
		change: (path: any) => {
			const str = checkVariable(path, 'string', '')
			addSiteForm.value.path = str
			defaultPathValue = (str + '/')?.replace(/\/\//g, '/')
		},
	})
}

/**
 * @description 获取php版本
 */
const getPHPVersion = async () => {
	try {
		const res = await GetPHPVersion()
		//排除纯静态
		versionOptions.value = res.data
		// 默认选中版本号最大的
		let version: any = '00'
		versionOptions.value?.forEach((item: any) => {
			if (Number(item.version) > Number(version)) {
				version = item.version
			}
		})
		addSiteForm.value.version = version
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

const handleInputName = (val: any) => {
	// addSiteForm.value.webname = val
	if (typeof val === 'string') {
		addSiteForm.value.ps = val.split('\n')[0]
		addSiteForm.value.path = defaultPathValue?.replace(/\/\//g, '/') + val.split('\n')[0]?.replace(/:/g, '_')?.trim()
		addSiteForm.value.ftp_username = val.split('\n')[0]?.replace(/\W/g, '_')
		addSiteForm.value.ftp_password = getRandomChart(16)
		addSiteForm.value.datauser = val.split('\n')[0]?.replace(/\W/g, '_')?.substr(0, 16)
		addSiteForm.value.datapassword = getRandomChart(16)
	}
}

const onConfirm = async (close?: any) => {
	let params: any = Object.assign({}, addSiteForm.value)
	if (!params.ftp) {
		delete params.ftp_username
		delete params.ftp_password
		resultData.value.ftp = false
	} else {
		resultData.value.ftpData.username = params.ftp_username
		resultData.value.ftpData.password = params.ftp_password
	}
	if (!params.sql) {
		delete params.datauser
		delete params.datapassword
		resultData.value.sql = false
	} else {
		resultData.value.sqlData.username = params.datauser
		resultData.value.sqlData.password = params.datapassword
	}
	// 默认端口为80，当输入的第一行域名含有端口数据时（最后以:xx结尾）,则端口为xx
	if (params.webname.split('\n')[0].indexOf(':') !== -1) {
		params.port = params.webname.split('\n')[0].split(':')[1]
	} else {
		params.port = 80
	}
	// 获取webname除开第一行外的所有域名
	let name_list = params.webname.split('\n')
	const domains = name_list?.map((item: any) => item.split(':')[0])
	name_list.shift()
	params.webname = JSON.stringify({
		domain: params.webname.split('\n')[0],
		domainlist: name_list,
		count: name_list.length,
	})
	delete params.menuType

	await addSiteFormRef.value.validate()
	try {
		formDisabled.value = true
		const res = await addPhpSite(params)
		if (addSiteForm.value.add_dns_record && res.status) {
			resultData.value.dns = domains
				.filter((item: any) => item.length)
				.map((item: any) => {
					return {
						domain: item,
						status: false,
						msg: '',
					}
				})
			resultData.value.title = res.status ? '添加网站成功' : res.msg
		}
		if (res.status) popupClose()
		if (params.ftp || params.sql || resultData.value.dns.length) {
			resultData.value.ftpStatus = res.data.ftpStatus
			resultData.value.databaseStatus = res.data.databaseStatus
			resultData.value.siteStatus = res.data.siteStatus
			resultData.value.site.name = false
			useDialog({
				isAsync: true,
				title: '网站添加结果',
				area: 46,
				component: () => import('@site/views/php-model/add-site/add-default/add-result.vue'),
				compData: resultData.value,
			})
		} else {
			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: res.status ? '添加网站成功' : res.msg,
				type: res.status ? 'success' : 'error',
				duration: res.status ? 3000 : 0,
				showClose: res.status ? false : true,
			}) // 提示错误信息
		}

		isRefreshList.value = true
	} catch (error) {
		useHandleError(error)
	} finally {
		formDisabled.value = false
	}
}

// 初始化
const init = async () => {
	const res = await props.compData.getStatus()
	softStatus.database = res.mysql
	softStatus.ftp = res.ftp
	addSiteForm.value.type_id = typeList.value[0]?.value
	await getPHPVersion()
	// 获取当前站点默认建站路径
	const defaultPath = panel.value.sitePath
	if (defaultPath) {
		addSiteForm.value.path = defaultPath
		defaultPathValue = (defaultPath + '/')?.replace(/\/\//g, '/')
	}
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

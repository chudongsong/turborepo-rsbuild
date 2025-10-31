<template>
	<div class="pb-0 w-full">
		<span class="py-[8px] px-[12px] text-secondary bg-[var(--el-color-success-light-9)] !w-full block flex items-center">
			快速的部署网站程序，商城、论坛、博客、框架等程序，
			<bt-link href="https://www.bt.cn/bbs/thread-33063-1-1.html"> 免费入驻平台 </bt-link>
		</span>
		<el-form :model="addDeploySiteForm" :rules="rules" class="pt-[12px]" ref="addDeploySiteFormRef">
			<el-form-item label="模板部署" class="">
				<div class="inline-grid grid-cols-3 text-small gap-x-6 gap-y-2 !w-[60rem] !h-[12.3rem]">
					<!-- v-bt-loading="columnLoad" -->
					<div v-for="(item, index) in templateList" :key="item.id" :class="{ 'template-focus': templateId === item.id }" v-show="index < 5" @click="hansleSelected(item)" class="mb-[4px] w-full flex items-center border border-darker py-[4px] px-[8px] rounded-base cursor-pointer template-hover">
						<el-popover ref="popover" placement="top-start" width="200" popper-class="white-tips-popover" trigger="hover">
							<div class="flex flex-col text-secondary">
								<span>名称：{{ item.title }}</span>
								<span>版本：{{ item.version }}</span>
								<span>简介：{{ item.ps.split('<')[0] }}</span>
								<span
									>官网：<bt-link :href="item.official" target="_blank"> {{ item.official }} </bt-link></span
								>
								<span>评价：{{ item.score }}</span>
							</div>
							<!-- <bt-svg-icon ></bt-svg-icon> -->
							<template #reference>
								<div class="w-full flex items-center">
									<!-- <i class="el-icon-success text-iconLarge mr-[8px]"></i> -->
									<bt-image :src="`/site_dep_ico/${item.name.toLowerCase()}.png`" class="w-[3.6rem] mr-[4px]"></bt-image>
									<div class="flex flex-col items-start leading-9 w-full">
										<span class="truncate font-bold"> {{ item.title }} {{ item.version }} </span>
										<span class="w-[14rem] truncate">
											{{ item.ps.split('<')[0] }}
										</span>
									</div>
								</div>
							</template>
						</el-popover>
					</div>

					<div
						@click="openOtherTemplate"
						:class="{
							'justify-center': selectedTemplate.id ? false : true,
							'template-focus': selectedTemplate.id,
						}"
						class="mb-[4px] w-full flex items-center border border-darker py-[4px] px-[12px] rounded-base cursor-pointer template-hover">
						<div class="flex items-center">
							<i class="svgtofont-el-success-filled text-iconLarge mr-[8px]" v-if="selectedTemplate?.id"></i>
							<div class="flex flex-col items-start leading-9 w-full">
								<span class="truncate font-bold" v-if="selectedTemplate?.id"> {{ selectedTemplate.title }} {{ selectedTemplate.version }} </span>
								<bt-link>更多模板 >></bt-link>
							</div>
						</div>
					</div>
				</div>
			</el-form-item>
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
							v-model="addDeploySiteForm.webname"
							type="textarea"
							width="52rem"
							v-popover:popover
							:rows="4"
							resize="none"
							@focus="popoverFocus = true"
							:placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'" />
					</template>
				</el-popover>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="addDeploySiteForm.ps" placeholder="请输入备注,可为空" width="52rem"></bt-input>
			</el-form-item>
			<el-form-item label="根目录" prop="path">
				<bt-input-icon v-model="addDeploySiteForm.path" placeholder="请输入根目录" icon="el-folder-opened" width="52rem" @icon-click="onPathChange"></bt-input-icon>
			</el-form-item>
			<el-form-item label="其他配置" prop="other">
				<div class="flex flex-col bg-light p-[12px] px-[16px] text-small w-full">
					<div class="flex items-center justify-between">
						<span :class="{ 'text-danger': !configData.isSetup }"> 数据库：{{ configData.isSetup ? 'MySQL数据库' : '数据库未安装！' }} </span>
						<span>编码：{{ configData.code }}</span>
						<span>账号：{{ addDeploySiteForm.datauser }}</span>
						<span>密码：{{ addDeploySiteForm.datapassword }}</span>
						<span>PHP版本：{{ configData.version }}</span>
					</div>
					<!-- <div>
						<span>PHP版本：{{ configData.version }}</span>
					</div> -->
				</div>
				<span class="text-tertiary flex items-center text-small p-[12px] px-[16px]">
					其他配置初始状态为默认选择的配置项，如需修改请点击
					<bt-link @click="handleOpen">编辑配置</bt-link>
				</span>
			</el-form-item>
		</el-form>

		<bt-dialog title="编辑配置" v-model="editPopup" showFooter :area="62" @confirm="onConfirmConfig">
			<div class="p-[20px]">
				<el-form :model="editForm" :rules="rules" ref="editFormRef">
					<el-form-item label="数据库">
						<el-select class="!w-[16rem]" v-model="addDeploySiteForm.sql">
							<el-option label="MySQL" value="MySQL"></el-option>
						</el-select>
						<el-select v-model="editForm.code" class="ml-[8px] !w-[16rem]">
							<el-option label="utf8mb4" value="utf8mb4"></el-option>
							<el-option label="utf8" value="utf8"></el-option>
							<el-option label="gbk" value="gbk"></el-option>
							<el-option label="big5" value="big5"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="数据库账号">
						<div class="flex items-center mb-[4px]">
							<el-form-item prop="datauser" label="">
								<bt-input placeholder="创建数据库账号" v-model="editForm.datauser" width="17rem"></bt-input>
							</el-form-item>
							<el-form-item label="" class="!mt-0">
								<bt-input class="ml-[8px]" width="16rem" placeholder="数据库密码" v-model="editForm.datapassword"></bt-input>
							</el-form-item>
						</div>
						<span class="text-tertiary text-small"> 创建站点的同时，为站点创建一个对应的数据库帐户，方便不同站点使用不同数据库。 </span>
					</el-form-item>
					<el-form-item label="PHP版本">
						<el-select class="!w-[16rem]" v-model="editForm.version">
							<el-option v-for="item in activeVersionList" :key="item.value" :label="item.name" :disabled="!item.status" :value="item.version">
								<span>{{ item.name }}</span>
								<!-- @click="installOtherPhp(item.version)" -->
								<template v-if="!item.status"> [ <bt-link class="my-4px" @click="installOtherPhp(item.version)">未安装</bt-link> ] </template>
							</el-option>
						</el-select>
						<span class="text-tertiary text-small ml-1rem">* 仅显示选中模板所支持的PHP版本</span>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { fileSelectionDialog, pluginInstallDialog } from '@/public'
import { checkVariable, getRandomChart } from '@/utils'
import { GetPHPVersion, addPhpSite, getDeploymentList, getPluginInfo, setDeploymentInfo } from '@api/site'
import { rules } from '@site/views/php-model/useController'

import { useSiteStore } from '@site/useStore'
import { useGlobalStore } from '@/store/global'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { panel } = useGlobalStore()
const { isRefreshList } = useSiteStore()

const Message = useMessage() // 消息提示

const tempList = ref<any>([]) // 模板列表
const templateId = ref<any>(0) // 模板id

const formDisabled = ref(false) // 表单提交状态
const addDeploySiteFormRef = ref<any>() // 表单ref
const popoverFocus = ref(false) // 域名popover

const popupClose = inject<any>('popupClose') //     弹窗关闭
let defaultPathValue = '/www/wwwroot/'
// addPhpSiteForm: addDeploySiteForm,

const addDeploySiteForm = ref<any>({
	menuType: 'addDeployment',
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
	// add_dns_record: false,
	ftp_username: '',
	ftp_password: '',
	datauser: '',
	datapassword: '',
})

const resultData = ref({
	ftp: true,
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
		name: '',
	},
})

const configData = ref<any>({
	isSetup: false,
	versions: [],
	version: '',
	code: 'utf8mb4',
})

const selectedTemplate = ref<any>({
	title: '111',
	version: '222',
})

const editForm = reactive({
	datauser: '',
	datapassword: '',
	type: 'MySQL',
	code: 'utf8mb4',
	version: '',
})

const templateData = ref<any>(null) // 模板数据
const templateList = ref<any>([]) // 模板列表
const editPopup = ref(false) // 编辑配置弹窗
const columnLoad = ref(false) // 模板列表加载状态
const activeVersionList = ref<any>([]) // 选中模板的 PHP版本列表

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: addDeploySiteForm.value.path,
		change: (path: any) => {
			addDeploySiteForm.value.path = path
		},
	})
}

const handleInputName = (val: any) => {
	// addDeploySiteForm.value.webname = val;
	if (typeof val !== 'string') return
	addDeploySiteForm.value.ps = val.split('\n')[0]
	addDeploySiteForm.value.path = defaultPathValue?.replace(/\/\//g, '/') + val.split('\n')[0]?.replace(/:/g, '_')?.trim()
	addDeploySiteForm.value.datapassword = getRandomChart()
	addDeploySiteForm.value.datauser = val.split('\n')[0]?.replace(/\W/g, '_').substring(0, 16)
}

/**
 * @description 安装其他PHP版本
 * @param version
 */
const installOtherPhp = async (version: any) => {
	try {
		const sName = 'php-' + (Number(version) / 10).toFixed(1)
		const { data } = await getPluginInfo({ sName: sName })
		pluginInstallDialog({
			name: sName,
			type: 'i',
			pluginInfo: data,
		})
		// 处理数据格式
	} catch (error) {
		console.log(error)
	}
}

const getTemplateList = async () => {
	try {
		const { data } = await getDeploymentList()
		tempList.value = data.list
		templateList.value = data.list
		templateData.value = data
	} catch (error) {
		console.log(error)
	}
}

const hansleSelected = (item: any) => {
	templateId.value = item.id
	selectTemplate(item.id)
}

const openOtherTemplate = () => {
	// 打开更多模板
	useDialog({
		isAsync: true,
		title: '模板',
		area: 84,
		component: () => import('@site/views/php-model/add-site/add-deployment/other-template.vue'),
		compData: {
			templateData: templateData.value,
			templateId: templateId.value,
			selectTemplate,
		},
	})
}

const handleOpen = () => {
	editPopup.value = true
	editForm.datauser = addDeploySiteForm.value.datauser
	editForm.datapassword = addDeploySiteForm.value.datapassword
	editForm.version = configData.value.version
}

const getPhpVersion = async (data: any) => {
	// let phpArr: any = []
	const phpVersion = data?.php.split(',')
	const phpArr = configData.value.versions.filter((item: any) => phpVersion.includes(item.version)).map((item: any) => item.version)

	activeVersionList.value = phpVersion.map((item: any) => ({
		name: 'PHP-' + item,
		version: item,
		status: phpArr.includes(item),
	}))

	configData.value.version = phpArr[phpArr.length - 1]
	editForm.version = configData.value.version
	addDeploySiteForm.value.version = configData.value.version
}

const getConfig = async () => {
	// 获取配置
	try {
		const data = await props.compData.getStatus()
		// const { data } = await getPluginInfo({ sName: 'mysql' })
		const res = await GetPHPVersion()
		configData.value.isSetup = data.mysql
		configData.value.versions = res.data.filter((item: any) => item.version !== '00')
	} catch (error) {
		console.log(error)
	}
}

const onConfirmConfig = async () => {
	// 编辑配置
	editPopup.value = false
	addDeploySiteForm.value.datauser = editForm.datauser
	addDeploySiteForm.value.datapassword = editForm.datapassword
	addDeploySiteForm.value.codeing = editForm.code
	configData.value.version = editForm.version
	configData.value.code = editForm.code
	addDeploySiteForm.value.version = configData.value.version
}

const onConfirm = async (close: any) => {
	let params: any = Object.assign({}, addDeploySiteForm.value)
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
		resultData.value.sqlData.username = params.user
		resultData.value.sqlData.password = params.password
	}
	// 默认端口为80，当输入的第一行域名含有端口数据时（最后以:xx结尾）,则端口为xx
	if (params.webname.split('\n')[0].indexOf(':') !== -1) {
		params.port = params.webname.split('\n')[0].split(':')[1]
	} else {
		params.port = 80
	}

	// 获取webname除开第一行外的所有域名
	let name_list = params.webname.split('\n')
	name_list.shift()
	params.webname = JSON.stringify({
		domain: params.webname.split('\n')[0],
		domainlist: name_list,
		count: name_list.length,
	})
	delete params.menuType
	let loading = null

	await addDeploySiteFormRef.value.validate()
	try {
		formDisabled.value = true
		loading = Message.load('正在部署中...')
		const res = await addPhpSite(params)
		if (res.data.status === false) {
			return Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: res.status ? '添加网站成功' : res.msg,
				type: res.status ? 'success' : 'error',
				duration: res.status ? 3000 : 0,
				showClose: res.status ? false : true,
			}) // 提示错误信息
		}
		if (res.status) popupClose()
		// 部署开始
		const { data: rdata } = await setDeploymentInfo({
			source: 1,
			site_name: JSON.parse(params.webname).domain,
			php_version: params.version,
			dname: tempList.value.find((item: any) => item.id === templateId.value).name,
		})
		loading.close()
		if (res.data.siteStatus) {
			resultData.value.siteStatus = true
			resultData.value.site.name = JSON.parse(params.webname).domain + rdata.msg.success_url
		}
		if (params.ftp || params.sql) {
			resultData.value.sqlData.username = params.datauser
			resultData.value.sqlData.password = params.datapassword
			resultData.value.databaseStatus = res.data.databaseStatus
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
				message: res.data.status ? '添加网站成功' : res.data.msg,
				type: res.data.status ? 'success' : 'error',
				duration: res.data.status ? 3000 : 0,
				showClose: res.data.status ? false : true,
			}) // 提示错误信息
		}
		isRefreshList.value = true
	} catch (error) {
		useHandleError(error)
	} finally {
		loading?.close()
		formDisabled.value = false
	}
}

/**
 * @description  选择模板
 * @param val
 */
const selectTemplate = (val: any) => {
	templateId.value = val
	// 若模板id是templateList.value前五的其中之一，则选中该模板，否则则赋值给selectedTemplate
	const index = templateList.value.findIndex((item: any) => item.id === val)
	if (index < 5) {
		selectedTemplate.value = {}
		getPhpVersion(templateList.value[index])
	} else {
		selectedTemplate.value = templateList.value.find((item: any) => item.id === val)
		getPhpVersion(selectedTemplate.value)
	}
	addDeploySiteForm.value.datauser = 'sql' + getRandomChart(6)
	addDeploySiteForm.value.datapassword = getRandomChart(6, 'password')
	// 将模板支持的php版本与当前安装的php版本做对比，若没有安装支持的版本，则将当前模板的php版本置为false
	// 若安装了支持的版本，则将当前模板的php版本置为已安装的且支持的第一个版本
}

watch(
	() => configData.value.version,
	() => {
		addDeploySiteForm.value.version = configData.value.version
	}
)

// 初始化
const init = async () => {
	try {
		columnLoad.value = true
		await getConfig()
		await getTemplateList()
		templateId.value = templateList.value[0]?.id
		await getPhpVersion(templateList.value[0])
		selectTemplate(templateList.value[0]?.id)
		columnLoad.value = false
		addDeploySiteForm.value.sql = 'MySQL'
		selectedTemplate.value = {}

		// 获取当前站点默认建站路径
		const defaultPath = panel.value.sitePath
		if (defaultPath) {
			addDeploySiteForm.value.path = defaultPath
			defaultPathValue = (defaultPath + '/')?.replace(/\/\//g, '/')
		}
	} catch (error) {
		columnLoad.value = false
	}
}

onMounted(init)

defineExpose({
	init,
	onConfirm,
})
</script>

<style lang="css" scoped>
.template-hover:hover {
	background-color: var(--el-fill-color-light);
	cursor: pointer;
	transition: all 0.3s;
}
.template-focus {
	@apply border-primary bg-[var(--el-color-success-light-9)];
}
</style>

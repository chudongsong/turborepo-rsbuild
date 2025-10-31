<template>
	<div class="py-[1.6rem] relative w-[90%] mx-[auto]">
		<el-form class="mb-[2rem]">
			<el-form-item label="验证方法">
				<el-radio-group v-model="form.resource" @change="changeRadioSite">
					<el-radio label="0" value="0">文件验证</el-radio>
					<el-radio label="1" value="1">DNS验证(支持通配符)</el-radio>
				</el-radio-group>
			</el-form-item>
			<template v-if="form.resource == '1'">
				<el-form-item label=" " class="!mt-[-.3rem]">
					<el-checkbox v-model="form.auth_to"> 手动解析</el-checkbox>
				</el-form-item>
				<el-form-item label=" " class="!mt-[-.3rem] !mb-[2rem]">
					<el-checkbox v-model="form.autoWildcard"> 自动组合泛域名</el-checkbox>
					<div class="text-small">* 如需申请通配符域名请勾选此项，且不要在下方域名列表中选中泛域名</div>
				</el-form-item>
			</template>
			<el-form-item label="网站">
				<div>
					<div v-if="form.resource == '1'">
						<bt-select :multiple="true" filterable :model-value="siteNameArr" class="mr-[.8rem] !w-[22rem] max-h-[100px] overflow-auto" :key="form.resource" @change="siteChange">
							<div class="!max-h-[20rem] overflow-auto">
								<el-option v-for="(item, index) in siteList" :key="index" :label="item.name" :value="item.id">
									<span class="!w-[22rem] truncate" :title="item.name" style="float: left">{{ item.name }}</span>
								</el-option>
							</div>
						</bt-select>
					</div>
					<div v-else>
						<el-select filterable :model-value="siteName" class="mr-[.8rem] !w-[22rem]" :key="form.resource" @change="siteChange">
							<div class="!max-h-[20rem] overflow-auto">
								<el-option v-for="(item, index) in siteList" :key="index" :label="item.name" :value="item.id">
									<span class="!w-[22rem] truncate" :title="item.name" style="float: left">{{ item.name }}</span>
								</el-option>
							</div>
						</el-select>
					</div>
					<div class="text-small mt-[.5rem]">* 根据网站筛选下方域名</div>
				</div>
			</el-form-item>
			<el-form-item label="域名">
				<div class="w-[60rem] !relative border-[1px] border-light" :class="mainHeight > 1000 ? 'h-[52rem]' : 'h-[31rem]'">
					<bt-input-search class="!absolute right-[1rem] top-[.7rem] z-99 !w-[200px]" v-model="domainName" @search="handleSerach" @clear="clearSerach" @blur="handleBlur" placeholder="搜索域名" />
					<bt-table-group>
						<template #content>
							<el-table
								ref="domainTable"
								class="!mb-[1rem] mt-[-1.2rem]"
								:row-class-name="rowClassName"
								@selection-change="handleSelectionChange"
								@select-all="handleSelectionAll"
								:data="domains"
								:max-height="mainHeight < 1000 ? 290 : 500"
								:description="'列表为空'"
								v-bt-loading="isLoading"
								v-bt-loading:title="'正在加载域名列表，请稍后...'">
								<el-table-column type="selection" width="35"> </el-table-column>
								<el-table-column prop="name" label="域名">
									<template v-slot="scope">
										<el-popover placement="top-start" trigger="hover" :offset="-100" v-if="scope.row.apply_ssl">
											<div class="flex flex-col">
												<span>Let's Encrypt证书不支持申请IP证书</span>
												<span>请选择【商用证书】的多域名SSL证书申请</span>
											</div>
											<template #reference>
												<span>{{ scope.row.name }}</span>
											</template>
										</el-popover>
									</template>
								</el-table-column>
								<el-table-column align="right">
									<template v-slot="scope">
										<el-button v-if="form.resource === '1' && scope.row.status === 0 && !form.auth_to" size="small" type="primary" class="ml-auto" @click="dnsStatusDialog(scope.row)">配置DNS</el-button>
									</template>
								</el-table-column>
							</el-table>
						</template>
					</bt-table-group>
				</div>
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="onSubmit">申请证书</el-button>
			</el-form-item>
		</el-form>
		<bt-help :options="helpList" class="pl-2rem"></bt-help>
		<bt-dialog v-model="verifyDialog" :area="70" :title="`手动${rowData.auth_type === 'dns' ? '解析TXT记录' : '创建验证文件'}`">
			<div class="p-[1.5rem]">
				请按以下列表做TXT解析:
				<span class="ml-[.4rem] text-danger">{{ errorMsg }}</span>
				<bt-table-group>
					<template #content>
						<div class="max-h-[38rem] overflow-auto">
							<template v-for="(item, index) in newTableData">
								<div v-if="item.data.length" :key="index">
									<span>验证域名：{{ item.domain }}</span>
									<bt-table class="my-[1rem]" :column="verifyTableColumns" :data="item.data"></bt-table>
									<div v-if="isError" class="flex justify-end">
										<el-button type="default" @click="verifySeparatelyEvent(item)">验证</el-button>
									</div>
								</div>
							</template>
						</div>
						<!-- <bt-table :maxHeight="260" :column="verifyTableColumns" :data="verifyTableData"></bt-table> -->
					</template>

					<template #footer-right>
						<el-button v-if="!isError" type="default" @click="handleVerifyEvent">验证</el-button>
					</template>
				</bt-table-group>
				<bt-help :list="tableHelpList" listStyle="disc" class="ml-[20px]" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { authDomainApi, downloadCertToLocal, setCertToSite, validateDomain } from '@/api/site'
import { useGlobalStore } from '@store/global'
import { getDomainConfigList, getSiteList, applyBuyCert, setBatchCertToSite } from '@api/ssl'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { LetsTableProps } from '@/types/site'
import { useMessage } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { isString, copyText } from '@utils/index'
import { useSiteStore } from '@site/useStore'
import { useSiteSSLStore } from '@site/public/ssl-arrange/useStore'
import { getSslStore } from '@ssl/useStore'
import { dnsStatusDialog, resultDialog } from '@ssl/useMethod'
import { showErrorSslDetail, useDeployResult, letsEncryptProgress } from '@site/public/ssl-arrange/useController'
import { ElPopover } from 'element-plus'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { encryptIsRefresh } = storeToRefs(useCertificateStore())

const { mainHeight } = useGlobalStore()

const Message = useMessage() // 消息提示

const emit = defineEmits(['close'])

const { siteInfo } = useSiteStore()

const { setApplyInfo, letApplyInfo } = useSiteSSLStore()
const {
	refs: { isRefreshDomainConfigList },
} = getSslStore()

const form = reactive({
	resource: '0',
	autoWildcard: false,
	auth_to: false,
	checkAll: false,
	domain: [],
	checkList: [] as any[],
})

const isLoading = ref<boolean>(false) // 加载状态
const tableData = ref<LetsTableProps[]>([]) // 表格数据
const verifyTableData = ref<any[]>([]) // 验证表格数据
const rowData = reactive({} as LetsTableProps) // 表格行数据
const verifyDialog = ref<boolean>(false) // 验证弹窗

const helpList = [
	{
		content: '注意：请勿将SSL证书用于非法网站',
		class: 'text-danger',
	},
	{
		content: '如开启后无法使用HTTPS访问，请检查安全组是否正确放行443端口',
	},
	{
		content: '在DNS验证中，我们提供了多种自动化DNS-API，并提供了手动模式',
	},
	{
		content: '使用DNS接口申请证书可自动续期，手动模式下证书到期后需重新申请',
	},
]

// 验证表格列
const verifyTableColumns = ref<TableColumnProps[]>([
	{ label: '解析域名', prop: 'domain' },
	{
		label: '记录值',
		prop: 'auth_value',
		render(row: any, index: number) {
			const str = rowData.auth_type === 'dns' ? row.auth_value : row.file_path
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{str}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: str })}></span>
				</div>
			)
		},
	},
	{
		label: '类型',
		prop: 'type',
		render: (row: any, index: number) => {
			if (rowData.auth_type === 'dns') {
				return <span>{row.type}</span>
			}
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{row.content}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: row.content })}></span>
				</div>
			)
		},
	},
	{ label: '必需', prop: 'must', width: 100 },
])

const newTableData = ref<any>([])
const isError = ref<boolean>(false)
const errorMsg = ref<string>('')

// 帮助提示
const tableHelpList = ref([
	{
		text: '解析域名需要一定时间来生效,完成所以上所有解析操作后,请等待1分钟后再点击验证按钮',
	},
	{ text: '' },
	{
		text: '若您使用的是宝塔云解析插件,阿里云DNS,DnsPod作为DNS,可使用DNS接口自动解析',
	},
])

/**
 * @description 手动验证事件
 * @param index 表格行索引
 */
const handleVerifyEvent = async () => {
	const progress: any = await letsEncryptProgress()
	const data: any = await useDataHandle({
		request: validateDomain({ index: rowData.index }),
		message: false,
	})
	progress._props.onCancel()
	if (data.status === true) {
		verifyDialog.value = false
		deployCertEvent(data, true) // 部署证书
	} else {
		showErrorSslDetail(data, verifyTableData.value, rowData)
	}
}

/**
 * @description 验证单个域名
 * @param {string} item.domain 域名
 */
const verifySeparatelyEvent = async (item: AnyObject) => {
	const progress: any = await letsEncryptProgress()
	const { data } = await authDomainApi({
		index: rowData.index,
		domain: item.domain,
	})
	progress._props.onCancel()
	if (data.status === 'valid') {
		Message.success('验证成功')
	} else if (data.status === true) {
		verifyDialog.value = false //关闭解析记录弹窗
		deployCertEvent(data, true) // 部署证书
	} else {
		showErrorSslDetail(data, item.data, rowData)
	}
}

/**
 * @description 部署证书
 */
const deployCertEvent = async ({ index }: LetsTableProps, isAutoDeploy: boolean = false, siteName: string = siteInfo.value.name) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在部署证书，请稍候...',
		request: setCertToSite({ index, siteName }),
		message: false,
		data: {
			status: Boolean,
			msg: String,
		},
	})

	// 处理结果
	useDeployResult(res, isAutoDeploy)
}

const siteNameArr = ref<any[]>([])
const siteName = ref<any>('')
const domains = ref<any[]>([])
const domainTable = ref<any>(null)
const siteList = ref<any[]>([])
const isFirstRefresh = ref(true) // 是否第一次刷新
const domainName = ref('')
const isSearch = ref(false)

const getDomainData = async (isSearch = false) => {
	let load
	try {
		let params = {
			site_id: form.resource === '1' ? siteNameArr.value.join(',') : siteName.value,
		}
		isLoading.value = true
		load = Message.load('正在获取域名列表，请稍后...')
		const { data } = await getDomainConfigList(params)
		form.domain = data.map((item: any) => item.name)
		domains.value = data
		if (form.resource === '1') {
			// 过滤出 form.checkList 中符合条件的项
			const filteredCheckList = form.checkList.filter(checkItem => siteNameArr.value.includes(checkItem.site_id))

			// 使用 nextTick 批量处理
			await nextTick()
			filteredCheckList.forEach(item => {
				const domain = domains.value.find(domainsItem => domainsItem.name === item.name)
				if (domain) {
					domainTable.value.toggleRowSelection(domain, true)
				}
			})
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
		isLoading.value = false
	}
}

const getSiteListData = async () => {
	let load
	try {
		load = Message.load('正在获取站点列表，请稍后...')
		const { data } = await getSiteList()
		if (data.length) {
			siteList.value = data
			if (isFirstRefresh.value) {
				siteNameArr.value[0] = data[0].id
				siteName.value = data[0].id
				isFirstRefresh.value = false
			}
			await getDomainData()
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

const rowClassName = ({ row }: any) => {
	if (!row.name.includes(domainName.value) && isSearch.value) {
		return '!hidden'
	}
}

const handleSelectionChange = (val: any) => {
	form.checkList = val
}

const handleSelectionAll = (val: any) => {
	form.checkList = val
}

const changeRadioSite = async () => {
	await getDomainData()
}

const siteChange = async (val: any) => {
	if (form.resource === '1') {
		siteNameArr.value = val
	} else {
		siteName.value = val
	}
	await getDomainData()
}

const handleSerach = (val: any) => {
	isSearch.value = true
	domainName.value = val
}

const handleBlur = () => {
	isSearch.value = true
}

const clearSerach = () => {
	domainName.value = ''
	isSearch.value = false
}

// 判断是否有未设置DNS的域名
const hasStatusZero = (arr: any) => arr.some((item: any) => item.status === 0)
// 获取已选中的域名
const getDomainName = (arr: any) => arr.map((item: any) => item.name)

// 申请证书
const onSubmit = async () => {
	if (form.checkList.length === 0) {
		Message.error('请选择一个域名')
		return
	}
	if (form.resource === '1' && hasStatusZero(form.checkList) && !form.auth_to) {
		Message.error('选中的域名存在未设置DNS接口配置')
		return
	}
	if (form.resource === '1' && form.autoWildcard && form.checkList.some(item => item.name.indexOf('*') !== -1)) {
		Message.error('开启自动组合泛域名时不能选择泛域名')
		return
	}
	let param = {
		domains: JSON.stringify(getDomainName(form.checkList)),
		auth_type: form.resource == '1' ? 'dns' : 'http',
		auth_to: JSON.stringify(getDomainName(form.checkList)),
		auto_wildcard: form.autoWildcard ? '1' : '0',
	}
	// DNS验证方式 且非手动模式
	if (form.resource == '1') {
		param.auth_to = form.auth_to ? 'dns' : JSON.stringify(getDomainName(form.checkList))
	}
	try {
		// 是否设置密钥
		const progress: any = await letsEncryptProgress()
		const ress = await applyBuyCert(param)
		// Message.request(ress)
		// 关闭进度窗口
		progress._props.onCancel()
		if (ress.status) {
			emit('close')
			encryptIsRefresh.value = true
		}
		// 申请结果
		applyLetResult(ress.data, param)
		tableHelpList.value[1].text = `可通过CMD命令来手动验证域名解析是否生效: nslookup -q=txt _acme-challenge.${getDomainName(form.checkList)[0].replace('*.', '')}`
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 申请let's encrypt证书
 */
const applyLetResult = (data: AnyObject, param: AnyObject) => {
	// 申请信息错误 - 直接返回
	if (data.status === false && data.hasOwnProperty('msg') && isString(data.msg)) {
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: data.msg,
			type: 'error',
			showClose: true,
			duration: 0,
		}) // 提示错误信息
		return
	}
	// 验证中/验证通过
	if (data.status === true || data.status === 'pending' || data?.save_path !== undefined) {
		// 验证中》开启验证窗口
		if (data.status === 'pending' && param.auth_type === 'dns') {
			newTableData.value = []
			for (let i = 0; i < data.auths.length; i++) {
				let _body = []
				const _domain = data.auths[i].domain.replace('*.', '')
				_body.push({
					domain: `_acme-challenge.${_domain}`,
					type: 'TXT',
					auth_value: data.auths[i].auth_value,
					must: '是',
					force: '是',
				})
				_body.push({
					domain: _domain,
					type: 'CAA',
					auth_value: '0 issue "letsencrypt.org"',
					must: '否',
					force: '否',
				})
				newTableData.value.push({
					domain: data.auths[i].domain,
					data: _body,
				})
			}
			if (data.hasOwnProperty('error')) {
				isError.value = data.error
			} else {
				isError.value = false
			}
			setApplyInfo(data, param) // 设置申请信息
			verifyDialog.value = true
			return
		}
		// 验证通过》部署证书
		sslDeploy(data)
		return
	}
	// 申请失败【500错误】
	showErrorSslDetail(data, letApplyInfo.value.dnsTable, letApplyInfo.value.info)
}

// 部署证书
const sslDeploy = async (data: AnyObject) => {
	let load
	try {
		load = Message.load('正在部署证书，请稍后...')
		let BatchInfo = []
		if (form.resource === '1') {
			BatchInfo = siteNameArr.value
				.map(id => siteList.value.find(site => site.id === id))
				.filter(site => site) // 过滤掉没有匹配上的项
				.map(site => {
					return {
						siteName: site.name,
					}
				})
		} else {
			BatchInfo = [
				{
					siteName: siteList.value.find(site => site.id === siteName.value).name,
				},
			]
		}

		const ress: any = await useDataHandle({
			request: setBatchCertToSite({
				BatchInfo: JSON.stringify(BatchInfo),
				privkey: data.private_key,
				fullchain: data.cert + data.root,
			}),
		})

		let resultData = {
			resultData: [...ress.data.faildList, ...ress.data.successList],
			resultTitle: '部署结果',
			resultColumn: [
				{
					label: '站点名称',
					prop: 'siteName',
				},
				{
					label: '操作结果',
					render: (row: any) => {
						return (
							<div class={row.status ? 'text-primary' : 'text-danger'}>
								{row.status ? (
									'操作成功'
								) : (
									<span class="flex items-center">
										操作失败，
										<ElPopover
											popperClass="el-popover-shadow el-light-popover"
											trigger="hover"
											placement="top-start"
											enterable={false}
											open-delay={400}
											close-delay={0}
											v-slots={{
												reference: () => <span class="text-primary cursor-pointer">详情</span>,
											}}>
											<span class="inline-block" v-html={row.error_msg || '暂无详情'}></span>
										</ElPopover>
									</span>
								)}
							</div>
						)
					},
				},
			],
		}
		await resultDialog(resultData)
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

watch(
	isRefreshDomainConfigList,
	val => {
		if (val) {
			getSiteListData()
			isRefreshDomainConfigList.value = false
		}
	},
	{ immediate: true }
)

onMounted(() => {
	isRefreshDomainConfigList.value = true
})
</script>

<style scoped></style>

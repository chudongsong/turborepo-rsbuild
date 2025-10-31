import { applyBuyCert } from '@/api/ssl'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { copyText, isArray, isString } from '@/utils'
import { showErrorSslDetail } from '@/views/site/public/ssl-arrange/useController'
import { letsEncryptProgress } from '@/views/ssl/views/certificate-manger/useMethod'
import { storeToRefs } from 'pinia'
import { useSiteSSLStore } from '@site/public/ssl-arrange/useStore'
import { authDomainApi, getCertList, validateDomain } from '@/api/site'
import { folderDeployCert, setDomainCert } from '@/api/mail'
import { getList } from '@mail/views/domain/method'
const { setApplyInfo, letApplyInfo } = useSiteSSLStore()

export const popupClose = ref<any>(null) //     弹窗关闭
export const newTableData = ref<any>([])
export const isError = ref<boolean>(false)
export const errorMsg = ref<string>('')
export const isIndeterminate = ref(false)
export const domains = ref<any>([]) // 域名列表
export const form = reactive({
	resource: '1',
	auth_to: false,
	autoWildcard: false,
	domain: [],
	checkList: [] as string[],
})
export const verifyDialog = ref<boolean>(false) // 验证弹窗
const index = ref('') // 索引

/**
 * @description 获取Let's Encrypt站点数据
 */
export const getLetsDomainData = async () => {
	const { MAIL_DOMAIN_SSL } = await import('@mail/views/domain/ssl/store')
	const mailDomainSSL = MAIL_DOMAIN_SSL()
	const { menuData } = storeToRefs(mailDomainSSL)
	domains.value = []
	domains.value.push(menuData.value.row.domain)
	form.checkList = domains.value
}

/**
 * @description DNS状态配置弹窗
 * @param {object} site 当前站点信息
 */
export const dnsStatusDialog = (site: any) => {
	useDialog({
		isAsync: true,
		title: `配置DNS接口`,
		area: 50,
		component: () => import('@site/public/ssl-arrange/lets-encrypt-cert/set-domain-dns.vue'),
		compData: {
			row: site,
			refresh: getLetsDomainData,
		},
		showFooter: true,
	})
}

export const onSubmitLetCert = async (param: any) => {
	const { MAIL_DOMAIN_SSL } = await import('@mail/views/domain/ssl/store')
	const mailDomainSSL = MAIL_DOMAIN_SSL()
	const { menuData } = storeToRefs(mailDomainSSL)
	if (param.value.checkList.length === 0) {
		Message.error('请选择一个域名')
		return false
	}
	if (!menuData.value?.row?.dns_id && !param.value.auth_to) {
		Message.error('选中的域名存在未设置DNS接口配置')
		return false
	}

	let params = {
		domains: JSON.stringify(param.value.checkList),
		auth_type: 'dns',
		auth_to: param.value.auth_to ? 'dns' : JSON.stringify(param.value.checkList),
		auto_wildcard: param.value.autoWildcard ? '1' : '0',
	}

	try {
		// 是否设置密钥
		const progress: any = await letsEncryptProgress()
		const ress = await applyBuyCert(params)
		index.value = ress.data.index
		// Message.request(ress)
		// 关闭进度窗口
		progress._props.onCancel()
		// 申请结果
		applyLetResult(ress.data, { auth_type: 'dns', ...param.value })
		tableHelpList.value[1].text = `可通过CMD命令来手动验证域名解析是否生效: nslookup -q=txt _acme-challenge.${form.checkList[0].replace('*.', '')}`
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
		deployCertEvent(data)
		return
	}
	// 申请失败【500错误】
	showErrorSslDetail(data, letApplyInfo.value.dnsTable, letApplyInfo.value.info)
}

/**
 * @description 验证单个域名
 * @param {string} item.domain 域名
 */
export const verifySeparatelyEvent = async (item: AnyObject) => {
	const progress: any = await letsEncryptProgress()
	const { data } = await authDomainApi({
		index: index.value,
		domain: item.domain,
	})
	progress._props.onCancel()
	verifyDialog.value = false //关闭解析记录弹窗
	if (data.status === 'valid') {
		Message.success('验证成功')
	} else if (data.status === true) {
		deployCertEvent(data) // 部署证书
	} else {
		showErrorSslDetail(data, item.data, { auth_type: 'dns' })
	}
}

/**
 * @description 手动验证事件
 * @param index 表格行索引
 */
export const handleVerifyEvent = async () => {
	const progress: any = await letsEncryptProgress()
	const data: any = await useDataHandle({
		request: validateDomain({ index: index.value }),
		message: false,
	})
	progress._props.onCancel()
	verifyDialog.value = false
	if (data.status === true) {
		deployCertEvent(data) // 部署证书
	} else {
		showErrorSslDetail({ msg: data.data }, [], { auth_type: 'dns' })
	}
}

/**
 * @description 部署证书
 */
const deployCertEvent = async (data: any) => {
	useDataHandle({
		loading: '正在部署证书，请稍候...',
		request: setDomainCert({
			domain: data.domains[0],
			key: data.private_key,
			csr: data.cert + data.root,
		}),
		message: true,
		success: (res: any) => {
			if (res.status === true) {
				Message.success('证书部署成功')
				popupClose.value()
				getList()
			}
		},
	})
}

// 验证表格列
export const verifyTableColumns = ref<any[]>([
	{ label: '解析域名', prop: 'domain' },
	{
		label: '记录值',
		prop: 'auth_value',
		render(row: any, index: number) {
			const str = row.auth_value
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
			;<span>{row.type}</span>
		},
	},
	{ label: '必需', prop: 'must', width: 100 },
])

// 帮助提示
export const tableHelpList = ref([
	{
		text: '解析域名需要一定时间来生效,完成所以上所有解析操作后,请等待1分钟后再点击验证按钮',
	},
	{ text: '' },
	{
		text: '若您使用的是宝塔云解析插件,阿里云DNS,DnsPod作为DNS,可使用DNS接口自动解析',
	},
])

export const resetForm = () => {
	form.checkList = []
	form.auth_to = false
	form.autoWildcard = false
	form.domain = []
}

/**
 * @description 获取证书列表
 * @param isRefresh 是否刷新
 */
export const getListData = async (param: any) => {
	try {
		const params = {
			search_limit: param.search_limit || 0,
			search_name: param.search || '',
			force_refresh: 1,
		}
		const { data } = await useDataHandle({
			request: getCertList(params),
		})
		if (!isArray(data)) Message.request(data)
		return { data: data, total: 0, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 证书夹部署证书
 */
export const folderDeployCertEvent = async (data: any) => {
	const { MAIL_DOMAIN_SSL } = await import('@mail/views/domain/ssl/store')
	const mailDomainSSL = MAIL_DOMAIN_SSL()
	const { menuData } = storeToRefs(mailDomainSSL)
	useDataHandle({
		loading: '正在部署证书，请稍候...',
		message: true,
		request: folderDeployCert({ ssl_hash: data.hash, domain: menuData.value?.row.domain as string }),
		success: async (res: any) => {
			if (res.status) {
				getList()
				popupClose.value()
			}
		},
	})
}

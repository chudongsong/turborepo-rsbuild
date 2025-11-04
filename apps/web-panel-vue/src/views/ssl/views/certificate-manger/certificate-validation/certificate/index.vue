<template>
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
								<el-button type="default" @click="verifySeparatelyEvent(item.domain)">验证</el-button>
							</div>
						</div>
					</template>
				</div>
				<!-- <bt-table :maxHeight="260" :column="verifyTableColumns" :data="verifyTableData"></bt-table> -->
			</template>
			<template #footer-right>
				<el-button type="primary" v-if="!isError" @click="handleVerify">验证</el-button>
			</template>
		</bt-table-group>
		<bt-help :list="tableHelpList" listStyle="disc" class="ml-[2rem]" />
		<bt-dialog :visible.sync="applyDialog" :area="[50, 25]" :show-close="false">
			<div class="h-full overflow-auto bg-[#222] text-white">
				<pre v-html="applyLog" class="whitespace-pre-wrap p-[1rem]"></pre>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { validateDomain, getComposerLine, getOrderDetail, authDomainApi } from '@api/site'
import { copyText } from '@utils/index'
import { useMessage } from '@/hooks/tools'
import { letsEncryptProgress } from '@/views/site/public/ssl-arrange/useController'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const Message = useMessage()

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

const emits = defineEmits(['close'])

const resultInfo = ref<any>({})
const verifyTableData = ref<any>([])
const applyDialog = ref(false)
const applyLog = ref('')
const applyTimer = ref() // 申请证书定时器
const newTableData = ref<any>([])
const isError = ref<boolean>(false)
const errorMsg = ref<string>('')

const tableHelpList = ref([
	{
		text: '解析域名需要一定时间来生效,完成所以上所有解析操作后,请等待1分钟后再点击验证按钮',
	},
	{ text: '' },
	{
		text: '若您使用的是宝塔云解析插件,阿里云DNS,DnsPod作为DNS,可使用DNS接口自动解析',
	},
])

const verifyTableColumns = ref([
	{ label: '解析域名', prop: 'domain', showOverflowTooltip: true },
	{
		label: '记录值',
		prop: 'auth_value',
		showOverflowTooltip: true,
		render(row: any, index: number) {
			const str = resultInfo.value.auth_type === 'dns' ? row.auth_value : row.file_path
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
		showOverflowTooltip: true,
		render: (row: any, index: number) => {
			if (resultInfo.value.auth_type === 'dns') {
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

// 显示错误信息
const showErrorSslDetail = (res: any) => {
	let err_info = ''
	if (res[1].challenges === undefined) {
		err_info += '<p><span>响应状态：</span>' + res[1].status + '</p>'
		err_info += '<p><span>错误类型：</span>' + res[1].type + '</p>'
		err_info += "<p><span>错误来源：</span><a class='bt-link' href='https://letsencrypt.org/' target='_blank' rel='noreferrer noopener'>Let's Encrypt官网</a></p>"
		err_info += '<div class="flex flex-col">错误代码：<pre class="!text-white  !bg-darkPrimary !inline-block  ! ml-[4px] ">' + res[1].detail + '</pre></div>'
	} else {
		if (!res[1].challenges[1]) {
			if (res[1].challenges[0]) {
				res[1].challenges[1] = res[1].challenges[0]
			}
		}
		if (res[1].status === 'invalid') {
			let dns_value = ''
			for (let imd = 0; imd < verifyTableData.value.length; imd++) {
				if (verifyTableData.value[imd].outerText?.indexOf(res[1].identifier.value) == -1) continue
				let s_tmp = verifyTableData.value[imd].outerText?.split('\t')
				if (s_tmp?.length > 1) {
					dns_value = s_tmp[1]
					break
				}
			}

			err_info += '<p><span>验证域名：</span>' + res[1].identifier.value + '</p>'
			if (resultInfo.value.type === 'dns') {
				let check_url = '_acme-challenge.' + res[1].identifier.value
				err_info += '<p><span>验证解析：</span>' + check_url + '</p>'
				err_info += '<p><span>验证内容：</span>' + dns_value + '</p>'
				err_info += '<div class="flex flex-col">错误代码：<pre class="!text-white  !bg-darkPrimary !inline-block  ! ml-[4px] ">' + res[1].challenges[1].error.detail + '</pre></div>'
			} else {
				let check_url = 'http://' + res[1].identifier.value + '/.well-known/acme-challenge/' + res[1].challenges[0].token
				err_info += "<p><span>验证URL：</span><a class='bt-link' href='" + check_url + "' target='_blank' rel='noreferrer noopener'>点击查看</a></p>"
				err_info += '<p><span>验证内容：</span>' + res[1].challenges[0].token + '</p>'
				err_info += '<div class="flex flex-col">错误代码：<pre class="!text-white !bg-darkPrimary !inline-block  ! ml-[4px] ">' + res[1].challenges[0].error.detail + '</pre></div>'
			}
			err_info += "<p><span>验证结果：</span> <a style='color:red;'>验证失败</a></p>"
		}
	}
	Message.msg({
		customClass: 'bt-message-error-html',
		dangerouslyUseHTMLString: true,
		icon: 'x',
		message:
			'<div class="flex items-center justify-center mt-[8px] mb-[20px]"><i class="svgtofont-el-circle-close-filled mr-[8px] text-[var(--el-color-error-light-8)] text-iconLarge"></i><a class="text-danger text-medium">' +
			res[0] +
			'</a></div>' +
			'<div class="p-[20px] border border-1 border-color-dark !rounded-base !mb-[12px] !leading-[26px] bg-light">' +
			err_info +
			'</div>',
		showClose: true,
		duration: 0,
	}) // 提示错误信息
}

// 手动验证事件
const handleVerify = async () => {
	try {
		applyDialog.value = true
		const progress: any = await letsEncryptProgress()
		const { data } = await validateDomain({ index: resultInfo.value.index })
		progress._props.onCancel()
		applyDialog.value = false
		if (data.status === true) {
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			emits('close')
		} else {
			if (typeof data?.msg === 'string') {
				return Message.error(data.msg)
			} else {
				showErrorSslDetail(data)
			}
		}
	} catch (e) {
		console.log(e)
	}
}

/**
 * @description 验证单个域名
 * @param {string} domain 域名
 */
const verifySeparatelyEvent = async (domain: string) => {
	try {
		applyDialog.value = true
		const progress: any = await letsEncryptProgress()
		const { data } = await authDomainApi({
			index: resultInfo.value.index,
			domain,
		})
		progress._props.onCancel()
		applyDialog.value = false
		if (data.status === 'valid') {
			Message.success('验证成功')
		} else if (data.status === true) {
			emits('close') //关闭解析记录弹窗
			// deployCert(data, true) // 部署证书
		} else {
			if (typeof data?.msg === 'string') {
				return Message.error(data.msg)
			} else {
				showErrorSslDetail(data)
			}
		}
	} catch (e) {
		console.log(e)
	}
}

/**
 * @description 验证域名
 */
const verifyDomain = async (row: any) => {
	let load: any = null
	try {
		load = Message.load('正在验证证书申请状态，请稍后...')
		const res = await getOrderDetail({
			index: row.index,
		})
		if (!res.status) {
			Message.request(res)
			emits('close')
		} else {
			newTableData.value = res.data.auths
			if (res.data.hasOwnProperty('error')) {
				isError.value = res.data.error
				errorMsg.value = res.data.error_msg
			} else {
				isError.value = false
				errorMsg.value = ''
			}
			resultInfo.value = row
			verifyTableColumns.value[1].label = row.auth_type === 'dns' ? '记录值' : '文件路径'
			verifyTableColumns.value[1].prop = row.auth_type === 'dns' ? 'auth_value' : 'file_path'
			verifyTableColumns.value[2].label = row.auth_type === 'dns' ? '类型' : '文件内容'
			verifyTableColumns.value[2].prop = row.auth_type === 'dns' ? 'type' : 'content'
			tableHelpList.value[1].text = `可通过CMD命令来手动验证域名解析是否生效: nslookup -q=txt _acme-challenge.${verifyTableData.value[0]?.domain?.replace('*.', '')}`
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

onMounted(() => {
	verifyDomain(props.compData.row)
})
</script>

<style scoped></style>

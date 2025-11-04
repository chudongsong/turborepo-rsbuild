<template>
	<div class="php-site-form" v-bt-loading="loading">
		<el-form :model="addSiteForm" :rules="customRules" :disabled="formDisabled" ref="addSiteFormRef">
			<el-form-item label="域名" class="!mb-0">
				<div class="domain-input-container">
					<div v-for="(domain, index) in addSiteForm.domains" :key="index" class="domain-item">
						<div class="domain-input-group">
							<el-input
								v-model="domain.name"
								placeholder="请输入子域名 (不支持通配符)"
								class="domain-name-input"
								@input="() => handleDomainInput(index, addSiteForm)"
							/>
							<el-select
								v-model="domain.suffix"
								placeholder="选择后缀"
								class="domain-suffix-select"
								@change="() => handleDomainInput(index, addSiteForm)"
							>
								<el-option
									v-for="suffix in domainSuffixes"
									:key="suffix.value"
									:label="suffix.label"
									:value="suffix.value"
								/>
							</el-select>
							<div class="domain-actions">
								<bt-link 
									v-if="index === addSiteForm.domains.length - 1 && addSiteForm.domains.length < 10" 
									@click="() => addDomain(addSiteForm, domainSuffixes)"
									class="text-primary"
								>
									添加
								</bt-link>
								<bt-link 
									v-if="addSiteForm.domains.length > 1" 
									@click="() => removeDomain(index, addSiteForm)"
									class="text-danger"
								>
									移除
								</bt-link>
							</div>
						</div>
						<div class="domain-hint" :class="getDomainHintClass(domain.status)">
							{{ domain.hint }}
						</div>
					</div>
				</div>
			</el-form-item>
			
			<el-form-item label="SSL证书配置">
				<el-radio-group v-model="addSiteForm.ssl_type" @change="handleSslTypeChange">
					<el-radio value="false">不使用SSL</el-radio>
					<el-radio value="certificate">证书夹</el-radio>
				</el-radio-group>
			</el-form-item>
			
			<el-form-item label="选择证书" v-if="addSiteForm.ssl_type === 'certificate'">
				<el-select 
					v-model="addSiteForm.ssl_cert" 
					placeholder="请选择证书"
					class="!w-[52rem]"
				>
				<el-option 
					v-for="cert in sslCertificates" 
					:key="cert.value" 
					:label="cert.label" 
					:value="cert.value"
					class="cert-option !h-[5.4rem] !leading-auto !line-height-normal flex flex-col justify-center"
				>
					<div class="cert-option-content">
						<div class="cert-name text-base font-500 mb-3">{{ cert.label.split(' - ')[0] }}</div>
						<div class="cert-sublabel text-small">{{ cert.subLabel }}</div>
					</div>
				</el-option>
				</el-select>
			</el-form-item>
			
			<el-form-item label="强制HTTPS访问" v-if="addSiteForm.ssl_type === 'certificate'">
				<el-checkbox v-model="addSiteForm.force_https">启用强制HTTPS访问</el-checkbox>
			</el-form-item>

			<el-form-item label="备注">
				<bt-input v-model="addSiteForm.ps" placeholder="请输入备注,可为空" width="52rem"></bt-input>
			</el-form-item>
			
			<el-form-item label="根目录" prop="path">
				<bt-input-icon v-model="addSiteForm.path" placeholder="请输入根目录" icon="el-folder-opened" width="52rem" @icon-click="() => onPathChange(addSiteForm)"></bt-input-icon>
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
			</el-form-item>
			
			<el-form-item label="网站分类">
				<bt-select v-model="addSiteForm.type_id" :options="typeList" class="!w-[15rem]"></bt-select>
				<bt-link class="ml-[8px]" @click="setClassEvent(classList, getClassList, activeType)">分类设置</bt-link>
			</el-form-item>

			<el-form-item label=" ">
				<bt-help :options="[{ content: '堡塔后台开启密保验证功能，无法添加解析记录' }]"></bt-help>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="tsx">
import { storeToRefs } from 'pinia'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { classList } from '@/views/site/views/php-model/useController'
import { getCertList } from '@/api/domain'
import { getDomainRegisterList } from '@domain/views/domain-register/useController'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import { useSiteAddStore } from '@domain/views/domain-register/site-add/useStore'
import { 
	handleDomainInput, 
	addDomain, 
	removeDomain, 
	onPathChange, 
	installPlugin, 
	getPHPVersion, 
	getClassListData, 
	getDomainList, 
	setClassEvent, 
	onConfirm,
	getStatus,
} from './useController'

interface Props {
	compData?: {
		domainId?: number,
		domainName?: string
	}
}

const { activeType } = useSiteStore()
const { getClassList } = SITE_STORE()
const { getDomainHintClass } = useSiteAddStore()
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
        domainId: 0
    })
})
// 响应式数据
const loading = ref(false)
const formDisabled = ref(false)
const addSiteFormRef = ref()

const softStatus = reactive({
	database: false,
	ftp: false,
})

const addSiteForm = reactive({
	domains: [
		{
			name: '',
			suffix: '',
			fullDomain: '',
			status: '',
			hint: ''
		}
	],
	ps: '', // 备注
	path: '/www/wwwroot/', // 根目录
	ftp: false, // FTP
	ftp_username: '', // FTP账号
	ftp_password: '', // FTP密码
	sql: false, // 数据库
	codeing: 'utf8mb4', // 数据库编码
	datauser: '', // 数据库账号
	datapassword: '', // 数据库密码
	version: '', // PHP版本
	type_id: '', // 网站分类
	port: 80, // 端口
	ssl_type: 'false', // SSL类型
	ssl_cert: '', // SSL证书
	force_https: false, // 强制HTTPS
	title: '',
})

const versionOptions = ref<any>([])
const domainSuffixes = ref<Array<{ label: string; value: string; id: number; fullDomain: string }>>([])
const sslCertificates = ref<Array<{ label: string; subLabel: string; value: string }>>([])

const typeList = computed(() => classList.value.filter((item: any) => item.value !== 'all' && Number(item.value) >= 0))

// 处理SSL类型变化
const handleSslTypeChange = async (value: string | number | boolean | undefined) => {
	const sslType = String(value)
	if (sslType === 'certificate') {
		try {
			const res = await getCertList({
				p: 1,
				limit: 100
			})
			
			if (res.status && res.data) {
				console.log(res.data)
				sslCertificates.value = res.data.map((cert: any) => {
					const baseLabel = cert.dns && cert.dns.length > 0 ? cert.dns.join(', ') : cert.subject || '未知域名'
					let timeInfo = ''
					if (cert.endtime !== undefined) {
						if (cert.endtime < 0) {
							timeInfo = `已过期${Math.abs(cert.endtime)}天`
						} else {
							const expireDate = cert.info?.notAfter || '未知'
							timeInfo = `过期时间：${expireDate}（剩${cert.endtime}天）`
						}
					}
					const issuerInfo = cert.info?.issuer_O ? ` - ${cert.info.issuer_O}` : ''
					return {
						label: baseLabel + ' - ' + timeInfo + issuerInfo,
						subLabel: timeInfo + issuerInfo,
						value: cert.hash
					}
				})
			}
		} catch (error) {
			console.error('获取SSL证书列表失败:', error)
		}
	} else {
		addSiteForm.ssl_cert = ''
		addSiteForm.force_https = false
	}
}

// 自定义验证规则
const customRules = {
	path: [
		{ required: true, message: '请输入根目录', trigger: 'blur' }
	],
	ftp_username: [
		{ required: true, message: '请输入FTP账号', trigger: 'blur' }
	],
	datauser: [
		{ required: true, message: '请输入数据库账号', trigger: 'blur' }
	]
}

// 初始化
const init = async () => {
	loading.value = true
	try {
		// 获取软件状态
		const res = await getStatus()
		softStatus.database = res?.mysql ?? true
		softStatus.ftp = res?.ftp ?? true
		
		// 并行获取PHP版本、域名列表、分类列表和SSL证书列表
		await Promise.all([
			getPHPVersion(versionOptions, addSiteForm),
			getDomainList(domainSuffixes, addSiteForm, getDomainRegisterList),
			getClassListData(classList, getClassList),
		])
		
		// 设置默认分类
		addSiteForm.type_id = typeList.value[0]?.value
		
        console.log(props.compData?.domainId)
		const { panel } = useGlobalStore()
		const defaultPath = panel.value.sitePath
		if (defaultPath) {
			addSiteForm.path = defaultPath
		}
	} catch (error) {
		console.error('初始化失败:', error)
	} finally {
		loading.value = false
	}
}

onMounted(init)

defineExpose({
	init,
	onConfirm: (close: any) => {
		const message = useMessage()
		return onConfirm(close, addSiteForm, addSiteFormRef, message, props, formDisabled, domainSuffixes)
	}
})
</script>

<style scoped>
.domain-input-container {
	width: 100%;
}

.domain-item {
    position: relative;
}

.domain-input-group {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 14px;
	white-space: nowrap;
}

.domain-name-input {
	flex: 1;
	min-width: 200px;
	max-width: 245px;
}

.domain-suffix-select {
	width: 200px;
}

.domain-actions {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
	white-space: nowrap;
}

.domain-hint {
	font-size: 12px;
    line-height: 12px;
	padding-left: 8px;
    position: absolute;
    bottom: -12px;
    left: 0;
    right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cert-name {
	color: var(--el-color-text-primary);
}
.cert-sublabel {
	color: var(--el-color-text-tertiary);
}
.is-selected {
	& .cert-name {
		color: var(--el-color-primary);
		font-weight: 600;
	}
	& .cert-sublabel {
		color: var(--el-color-primary);
		font-weight: normal!important;
	}
}
</style>

<template>
	<div class="reverse-proxy-form" v-bt-loading="loading">
		<el-form :model="addSiteForm" :rules="customRules" :disabled="formDisabled" ref="addSiteFormRef">
			<el-form-item label="域名" label-width="100px" class="!mb-0">
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
			
			<el-form-item label-width="100px" label="SSL证书配置">
				<el-radio-group v-model="addSiteForm.ssl_type" @change="handleSslTypeChange">
					<el-radio value="false">不使用SSL</el-radio>
					<el-radio value="certificate">证书夹</el-radio>
				</el-radio-group>
			</el-form-item>
			
			<el-form-item label-width="100px" label="选择证书" v-if="addSiteForm.ssl_type === 'certificate'">
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
						class="!h-[5.4rem] !leading-auto !line-height-normal flex flex-col justify-center"
					>
					<div class="cert-option-content">
						<div class="cert-name text-base font-500 mb-3">{{ cert.label.split(' - ')[0] }}</div>
						<div class="cert-sublabel text-small text-tertiary">{{ cert.subLabel }}</div>
					</div>
					</el-option>
				</el-select>
			</el-form-item>
			
			<el-form-item label-width="100px" label="强制HTTPS访问" v-if="addSiteForm.ssl_type === 'certificate'">
				<el-checkbox v-model="addSiteForm.force_https">启用强制HTTPS访问</el-checkbox>
			</el-form-item>

			<el-form-item label-width="100px" label="目标" prop="proxysite">
				<div class="flex items-center">
					<el-form-item label-width="50px">
						<bt-select 
							v-model="addSiteForm.targetType" 
							placeholder="请选择" 
							:options="targetOptions" 
							style="width: 16rem; margin-right: 1rem" 
							@change="setTypeEvent"
						></bt-select>
					</el-form-item>
					<bt-input 
						v-model="addSiteForm.proxysite" 
						:placeholder="addSiteForm.targetType === 'url' ? '请输入目标地址' : '请选择sock文件'" 
						width="35rem" 
						:iconType="addSiteForm.targetType === 'url' ? false : 'folder'"
						@input="(val) => handelInputTodo(val, addSiteForm)"
					>
						<template v-if="addSiteForm.targetType !== 'url'" #append>
							<bt-button @click="() => onPathChange(addSiteForm, addSiteFormRef)">
								<bt-icon icon="el-folder-opened" class="cursor-pointer" />
							</bt-button>
						</template>
					</bt-input>
				</div>
			</el-form-item>
			
			<el-form-item label-width="100px" label="发送域名(host)" prop="todomain">
				<el-tooltip 
					content="请求转发到后端服务器时的主机名，一般为$http_host，如果目标URL是域名，则需要改为域名" 
					placement="top"
					:show-after="300"
				>
					<bt-input v-model="addSiteForm.todomain" placeholder="请输入发送域名" width="52rem" />
				</el-tooltip>
			</el-form-item>

			<el-form-item label-width="100px" label="备注">
				<bt-input v-model="addSiteForm.remark" placeholder="请输入备注,可为空" width="52rem"></bt-input>
			</el-form-item>
			
			<el-form-item label=" ">
				<bt-help :options="[{ content: '堡塔后台开启密保验证功能，无法添加解析记录' }]"></bt-help>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="tsx">
import { useMessage } from '@/hooks/tools'
import { useSiteAddStore } from '../../useStore'
import { getCertList } from '@/api/domain'
import { getDomainRegisterList } from '@domain/views/domain-register/useController'
import { 
	handleDomainInput, 
	addDomain, 
	removeDomain, 
	onPathChange, 
	getDomainList, 
	handelInputTodo,
	onConfirm,
	targetOptions
} from './useController'

interface Props {
	compData?: {
		domainId?: number
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
        domainId: 0
    })
})

// 使用 store 获取 domainId
const { domainId, getDomainHintClass } = useSiteAddStore()

console.log('reverse-proxy/index.vue - store domainId:', domainId.value)

// 响应式数据
const loading = ref(false)
const formDisabled = ref(false)
const addSiteFormRef = ref()

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
	targetType: 'url',
	proxysite: 'http://',
	todomain: '$http_host',
	remark: '',
	ssl_type: 'false',
	ssl_cert: '',
	force_https: false,
})

const domainSuffixes = ref<Array<{ label: string; value: string; id: number; fullDomain: string }>>([])
const sslCertificates = ref<Array<{ label: string; subLabel: string; value: string }>>([])

// 设置目标类型
const setTypeEvent = () => {
	addSiteForm.proxysite = addSiteForm.targetType === 'url' ? 'http://' : ''
}

// 处理SSL类型变化
const handleSslTypeChange = async (value: string | number | boolean | undefined) => {
	const sslType = String(value)
	if (sslType === 'certificate') {
		// 切换到证书夹时，获取证书列表
		try {
			const res = await getCertList({
				p: 1,
				limit: 100
			})
			
			if (res.status && res.data) {
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
	proxysite: [
		{ required: true, message: '请输入目标地址', trigger: 'blur' },
		{
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error(addSiteForm.targetType === 'url' ? '目标地址不能为空' : '请选择sock文件'))
					return
				}
				if (addSiteForm.targetType === 'unix') {
					callback()
					return
				}
				const urlValue = value.trim()
				if (/^https?:\/\/$/.test(urlValue)) {
					callback(new Error('请输入目标URL域名'))
					return
				}
				if (!/^https?:\/\/.+/.test(urlValue)) {
					callback(new Error('目标URL格式不正确，应以http://或https://开头'))
					return
				}
				const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

				let val = value.replace(/^http[s]?:\/\//, '')
				val = val.replace(/(:|\?|\/|\\)(.*)$/, '')

				if (ipReg.test(val)) {
					addSiteForm.todomain = '$http_host'
				} else {
					addSiteForm.todomain = val
				}
				callback()
			},
		}
	],
	todomain: [
		{ required: true, message: '请输入发送域名', trigger: ['blur', 'change'] }
	]
}

// 初始化
const init = async () => {
	loading.value = true
	try {
		await getDomainList(domainSuffixes, addSiteForm, getDomainRegisterList)
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
		return onConfirm(close, addSiteForm, addSiteFormRef, message, formDisabled, domainSuffixes)
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
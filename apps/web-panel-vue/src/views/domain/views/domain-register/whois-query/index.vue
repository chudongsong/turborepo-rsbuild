<template>
	<div class="whois-query-content">
		<!-- 查询输入区域 -->
		<div class="query-input-section mb-4">
			<el-input
				v-model="searchValue"
				placeholder="请输入要查询的域名"
				class="query-input"
				@keyup.enter="handleQuery"
			>
				<template #append>
					<el-button 
						type="primary" 
						@click="handleQuery"
						:loading="loading"
					>
						查询
					</el-button>
				</template>
			</el-input>
		</div>

		<!-- 查询结果区域 -->
		<div class="query-result-section">
			<!-- Tab选项卡 -->
			<el-tabs v-if="whoisResult || loading" v-model="activeTab" class="result-tabs" :before-leave="beforeTabLeave">
				<el-tab-pane label="格式化结果" name="formatted">
					<div class="formatted-result">
						<div v-if="loading && !whoisResult" class="loading-placeholder" v-bt-loading="loading" element-loading-text="正在查询WHOIS信息..."></div>
						<!-- 有数据时显示内容 -->
						<ElDescriptions v-else-if="whoisResult" :column="1" border>
							<ElDescriptionsItem 
								v-for="item in formattedData" 
								:key="item.label"
								:label="item.label"
							>
								<template v-if="item.type === 'tag'">
									<el-tag :type="getDnssecTagType(item.value as string)">
										{{ getDnssecDisplayText(item.value as string) }}
									</el-tag>
								</template>
								<template v-else-if="item.type === 'list'">
									<div v-if="item.value && item.value.length > 0" class="list-container">
										<div 
											v-for="(listItem, index) in item.value" 
											:key="index"
											class="list-item"
										>
											{{ listItem }}
										</div>
									</div>
									<span v-else class="text-gray-400">-</span>
								</template>
								<template v-else>
									<span v-if="item.value && item.value.toString().trim()">{{ item.value }}</span>
									<span v-else class="text-gray-400">-</span>
								</template>
							</ElDescriptionsItem>
						</ElDescriptions>
					</div>
				</el-tab-pane>
				<el-tab-pane label="原文" name="raw">
					<div class="raw-result">
						<div v-if="loading && !whoisResult" class="loading-placeholder" v-bt-loading="loading" element-loading-text="正在查询WHOIS信息..."></div>
						<!-- 有数据时显示内容 -->
						<bt-alert
							v-else-if="whoisResult"
							type="info"
							:closable="false"
							:show-icon="false"
						>
							<template #default>
								<pre class="whitespace-pre-wrap max-h-96 overflow-y-auto w-62rem">{{ generateRawText(whoisResult) }}</pre>
							</template>
						</bt-alert>
					</div>
				</el-tab-pane>
			</el-tabs>
			
			<!-- 空状态 -->
			<div v-if="!whoisResult && !loading" class="empty-state">
				<el-empty description="请输入域名并点击查询按钮获取WHOIS信息" />
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { 
	loading, 
	searchValue, 
	whoisResult, 
	handleQuery,
	generateRawText,
	clearResult
} from './useController'
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { useMessage } from '@/hooks/tools'
import BtAlert from '@/components/feedback/bt-alert/index'

// 定义 props
interface Props {
	compData?: {
		domainName?: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})

// 监听传入的域名
watch(() => props.compData?.domainName, (newValue) => {
	if (newValue) {
		searchValue.value = newValue
		handleQuery()
	}
}, { immediate: true })

const activeTab = ref('formatted')

// DNSSEC 相关处理函数
const getDnssecTagType = (value: string): 'warning' | 'primary' => {
	if (!value || value.trim() === 'unsigned') {
		return 'warning'
	}
	return 'primary'
}

const getDnssecDisplayText = (value: string): string => {
	if (!value || value.trim() === 'unsigned') {
		return '未签名'
	}
	return '已签名'
}

const message = useMessage()

const beforeTabLeave = (newName: any, oldName: any) => {
	if (loading.value) {
		message.warn('查询中，请稍后再切换')
		return false
	}
	return true
}

// 格式化数据
const formattedData = computed(() => {
	if (!whoisResult.value) return []
	
	return [
		{ label: '域名', value: whoisResult.value.domainName, type: 'text' },
		{ label: '域名所有者', value: whoisResult.value.registrant, type: 'text' },
		{ label: '所有者邮箱', value: whoisResult.value.registrarAbuseContactEmail, type: 'text' },
		{ label: '域名状态', value: whoisResult.value.domainStatus, type: 'list' },
		{ label: '注册商', value: whoisResult.value.registrar, type: 'text' },
		{ label: '注册时间', value: whoisResult.value.creationDate, type: 'text' },
		{ label: '到期时间', value: whoisResult.value.registryExpiryDate, type: 'text' },
		{ label: 'ROID', value: whoisResult.value.registryDomainId, type: 'text' },
		{ label: 'DNS 服务器', value: whoisResult.value.nameServer, type: 'list' },
		{ label: 'DNSSEC', value: whoisResult.value.dnssec, type: 'tag' }
	]
})

// 组件卸载时清空结果
onUnmounted(() => {
	clearResult()
})

</script>

<style lang="scss" scoped>
.whois-query-content {
	padding: 2rem;
	.query-input-section {
		.query-input {
			:deep(.el-input-group__append) {
				background-color: var(--el-color-primary);
				color: var(--el-color-white);
				border-color: var(--el-color-primary);
			}
		}
		:deep(.el-input-group__append) {
			background-color: var(--el-color-primary)!important;
			color: var(--el-color-white)!important;
			box-shadow: none!important;
			button {
				border-radius: 0!important;
			}
		}
	}

	.query-result-section {
		min-height: 300px;
		
		.loading-placeholder {
			min-height: 200px;
		}
		
		.formatted-result {
			.list-container {
				.list-item {
					margin-bottom: 4px;
					font-size: 12px;
					color: var(--el-text-color-regular);
					list-style: none;
					padding-left: 0;
				}
			}
		}

		.raw-result {
			min-height: 200px;
		}
	}

	.empty-state {
		text-align: center;
		padding: 40px 0;
	}

	.loading-state {
		text-align: center;
		padding: 40px 0;
		min-height: 200px;
	}
}
</style>

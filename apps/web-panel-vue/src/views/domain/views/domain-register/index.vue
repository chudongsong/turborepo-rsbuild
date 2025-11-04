<template>
	<div class="domain-register module-ui">
		<BtAlert class="!mb-[12px]" type="warning" show-icon>
			<template #title>
				<div>
					请确保实名认证信息完整且准确，否则可能影响域名归属及使用
				</div>
				<div>
					实名认证完成后至少 72 小时才可进行网站备案，详情请咨询相关备案平台。
				</div>
			</template>
		</BtAlert>
		<BtInstallMask v-if="showMask" class="domain-register-install-mask">
			<template #content>
				<div v-if="!isUserBound" class="domain-access-restricted">
					<div class="warning-icon">
						<i class="svgtofont-el-warning text-warning !text-titleLarge"></i>
					</div>
					<h3 class="title">请先绑定宝塔账号</h3>
					<p class="instruction">使用域名注册功能需要先绑定宝塔账号，绑定后可享受更多服务</p>
					<div class="action-buttons">
						<bt-button type="primary" @click="() => bindUserDialog()">立即绑定账号</bt-button>
					</div>
				</div>
				<div v-else class="domain-access-restricted">
					<div class="warning-icon">
						<i class="svgtofont-el-warning text-warning !text-titleLarge"></i>
					</div>
					<h3 class="title">域名列表访问权限受限</h3>
					<div class="ip-display">
						<span>当前服务器公网IP:</span>
						<span class="ip-address">{{ isLoadingIp ? '获取中...' : publicIp }}</span>
					</div>
					<p class="instruction">如需访问权限，请登录官网后台，将此IP地址添加至宝塔面板域名访问权限的白名单列表中</p>
					<div class="action-buttons">
						<bt-button type="primary" @click="goToBackend">前往官网后台</bt-button>
					</div>
				</div>
			</template>
		</BtInstallMask>	
		<BtTableGroup v-else>
			<template #header-left>
				<BtOperation />
			</template>
			<template #header-right>
				<BtSearch class="mr-[10px]" placeholder="请输入域名" :class="`!w-[${searchWidth}px]`" />
				<BtRefresh class="mr-[10px]" />
				<BtColumn />
			</template>
			<template #content>
				<BtTable :min-height="mainHeight" />
			</template>
			<!-- <template #footer-left>
				<BtBatch />
			</template> -->
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
		<div v-if="showMask">
			<div class="h-[50rem]"></div> <!-- 占位 -->
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import { useOperation } from '@/hooks/tools'
import { useAllTable, useBatch, useErrorMask, useRefreshList } from '@/hooks/tools/table/index'
import { useOperate } from '@/hooks/tools/table/column'
import { loadPublicIp } from '@/views/domain/useController'
import { useDomainRegisterStore } from './useStore'
import { ElTooltip } from 'element-plus'
import { bindUserDialog } from '@/public'
import { 
	handleDomainSearch,
	handleModifyIp,
	handleDomainWhois,
	handleResolveDomain,
	handleRenewDomain,
	handleViewRealNameInfo,
	handleRealNameVerification,
	useDomainStatus,
	useRealNameStatus,
	useNsStatus,
    openSiteAddDialog,
	getDomainRegisterList,
	handleDomainDelete,
	loadAnalysisIp,
	refreshCacheHandle,
} from './useController'
const { mainHeight } = useGlobalStore()
const { searchWidth, domainSearchValue, ipSearchValue, isRegListRefresh, publicIp, isLoadingIp, showMask, whoisSearchValue, isUserBound } = useDomainRegisterStore()

const goToBackend = () => {
	window.open('https://www.bt.cn/domain/domain-security', '_blank')
}

onMounted(async () => {
	await loadPublicIp()
	await loadAnalysisIp()
})

const operationOptions = ref([
	{
		type: 'custom' as const,
		render: () => (
			<div class="flex items-center domain-register-input-group mr-[12px]">
				<el-form-item prop="domain" class="!mb-0">
					<el-input
						v-model={domainSearchValue.value} 
						onKeyupEnter={() => handleDomainSearch(domainSearchValue)} 
						placeholder="输入要注册的域名"
						v-slots={{
							append: () => (
								<el-button type="primary" onClick={() => handleDomainSearch(domainSearchValue)}>立即注册</el-button>
							)
						}}
					/>
				</el-form-item>
			</div>
		),
	},
	{
		label: 'Whois查询',
		type: 'button' as const,
		onClick: () => handleDomainWhois(whoisSearchValue),
	},
	{ type: 'divider' as const },
	{
		type: 'custom' as const,
		render: () => (
			<div class="flex items-center ip-edit-input-group mr-[12px]">
				<el-form-item prop="ip" class="!mb-0">
					<el-input 
						disabled
						v-model={ipSearchValue.value}
						value={`解析IP：${ipSearchValue.value}`}
						placeholder={`解析IP：${ipSearchValue.value}`}
						v-slots={{
							append: () => (
								<el-button type="primary" onClick={() => handleModifyIp(ipSearchValue.value)}>修改</el-button>
							)
						}}
					/>
				</el-form-item>
			</div>
		),
	},
	{
		type: 'custom' as const,
		render: () => (
			<ElTooltip 
				content="本地缓存用于申请证书时自动解析dns记录，每24小时自动刷新，遇到新域名自动解析失败时请刷新后重试" 
				placement="top"
				showAfter={300}
			>
				<bt-button type="default" onClick={() => {
					refreshCacheHandle()
				}}>刷新本地缓存</bt-button>
			</ElTooltip>
		),
	}
])

const { BtOperation } = useOperation({
	options: operationOptions,
})

// 表格配置
const { BtTable, BtPage, BtSearch, BtRefresh, BtColumn } = useAllTable({
	request: (data: any) => {
		return getDomainRegisterList(data)
	},
	columns: [
		{
			label: '域名',
			width: 'auto',
			prop: 'full_domain',
			minWidth: 150,
		},
		useDomainStatus(),
		{ 
			label: '注册时间', 
			prop: 'register_time', 
			minWidth: 120,
			isCustom: true,
			render: (row: any) => {
				return row.register_time ? new Date(row.register_time * 1000).toLocaleDateString() : '--'
			}
		},
		{ 
			label: '到期时间', 
			prop: 'expire_time', 
			minWidth: 120,
			isCustom: true,
			render: (row: any) => {
				return row.expire_time ? new Date(row.expire_time * 1000).toLocaleDateString() : '--'
			}
		},
		useNsStatus(),
		useRealNameStatus(),
		useOperate((row: any) => {
			const operations = []
			if (row.status === 5) {
				operations.push({ 
					onClick: () => {
						handleDomainDelete(row)
					}, 
					title: '删除' 
				})
			} else {
				operations.push({ 
					onClick: openSiteAddDialog, 
					title: '创建网站',
					isHide: (row: any) => row.real_name_status !== 2
				 })
				operations.push({ 
					onClick: handleResolveDomain, 
					title: '解析', 
					isHide: (row: any) => row.real_name_status !== 2 || row.ns_status === 0
				})
				operations.push({ onClick: handleRenewDomain, title: '续费' })
				operations.push({ 
					onClick: (row: any) => {
						if (row.real_name_status === 2) {
							handleViewRealNameInfo(row)
						} else {
							handleRealNameVerification(row)
						}
					}, 
					title: row.real_name_status === 2 ? '查看实名信息' : '立即实名',
					render: (row: any, index: number) => {
						const isVerified = row.real_name_status === 2
						const text = isVerified ? '查看实名信息' : '立即实名'
						const className = isVerified ? 'bt-link' : 'cursor-pointer text-danger'
						return (
							<span 
								onClick={() => {
									if (isVerified) {
										handleViewRealNameInfo(row)
									} else {
										handleRealNameVerification(row)
									}
								}} 
								class={className}
							>
								{text}
							</span>
						)
					}
				})
			}
			
			return operations
		}, {
			width: 300
		}),
	],
	extension: [useRefreshList(isRegListRefresh), useErrorMask()],
	empty: () => {
		return (
			<span>
				您的域名列表为空，您可以
				<span class="bt-link cursor-pointer" onClick={() => handleDomainSearch(domainSearchValue)}>
					注册一个新域名
				</span>
			</span>
		)
	},
})
</script>

<style lang="scss" scoped>
.domain-register{
	:deep(.domain-register-input-group .el-input-group__append) {
		background-color: var(--el-color-primary)!important;
		color: var(--el-color-white)!important;
		box-shadow: none!important;
	}
	:deep(.ip-edit-input-group .el-input-group__append) {
		background-color: rgb(var(--el-color-white-rgb))!important;
		color: var(--el-color-text-secondary)!important;
	}
	:deep(.ip-edit-input-group .el-input-group__append button:hover) {
		color: var(--el-color-primary)!important;
	}
}

.domain-access-restricted {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40px 20px;
	text-align: center;
}

.warning-icon {
	margin-bottom: 20px;
}

.title {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 20px;
	color: var(--el-color-text-primary);
}

.ip-display {
	background-color: var(--el-fill-color-light);
	padding: 8px 16px;
	border-radius: 4px;
	margin-bottom: 20px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.ip-address {
	color: var(--el-color-danger);
	font-weight: bold;
}

.instruction {
	font-size: 14px;
	color: var(--el-color-text-secondary);
	margin-bottom: 30px;
	line-height: 1.6;
}

.action-buttons {
	display: flex;
}

.domain-register-install-mask {
	:deep(.software-mask) {
		z-index: 1000 !important;
	}

	:deep(.software-view) {
		z-index: 1001 !important;
	}
}
</style>
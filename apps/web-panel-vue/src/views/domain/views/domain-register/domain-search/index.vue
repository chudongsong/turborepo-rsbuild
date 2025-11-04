<template>
	<div class="domain-search-content">
		<!-- 搜索框 -->
		<div class="search-input-group mb-4">
			<el-input
				v-model="searchValue"
				placeholder="请输入要注册的域名"
				class="search-input"
				@keyup.enter="handleSearch"
			>
				<template #append>
					<el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
				</template>
			</el-input>
		</div>

		<!-- 域名列表 -->
		<div class="domain-list min-h-[400px]" v-bt-loading="loading">
			<div
				v-for="(domain, index) in domainList"
				:key="index"
				class="domain-item"
				:class="{ 'last-item': index === domainList.length - 1 }"
			>
				<div class="domain-info flex flex-1 items-center">
					<div class="domain-name" :class="{ 'registered-domain': !domain.available }">
						{{ domain.name }}
						<el-tag v-if="domain.isHot" type="danger" size="small" class="ml-2">热门</el-tag>
						<el-tag v-if="domain.premium" type="warning" size="small" class="ml-2">溢价</el-tag>
					</div>
					<div class="domain-status ml-2">
						<span v-if="!domain.available" :class="getStatusClass(domain.available, domain.status)">
							{{ domain.status_desc }}
						</span>
					</div>
				</div>
				<div class="domain-actions">
					<div class="domain-price" v-if="domain.available">
						<div class="price-info">
							<div class="current-price">
								<div class="original-price">
									¥{{ domain.first_year_price }}
								</div>
								¥{{ domain.first_year_discount_price }}元/首年
							</div>
							<div class="renewal-price">
								续费¥{{ domain.renewal_discount_price }}/年
							</div>
						</div>
					</div>
					<bt-button
						v-if="domain.available"
						type="primary" 
						size="small" 
						@click="handleBuy(domain)"
					>
						立即购买
					</bt-button>
					<span v-else class="bt-link" @click="handleViewWhois(domain)">
						<bt-icon name="search" class="mr-1" />
						查看WHOIS
					</span>
				</div>
			</div>
			<!-- 空状态 -->
			<div v-if="domainList.length === 0 && !loading" class="empty-state">
				<el-empty description="暂无可用域名" />
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { searchValue, domainList, loading, handleSearch, handleBuy, handleViewWhois, initSearchValue } from './useController'
import { useDomainRegisterStore } from '../useStore'
const { domainSearchDialog } = useDomainRegisterStore()

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
		initSearchValue(newValue)
	}
}, { immediate: true })

const getStatusClass = (available: boolean, status: string) => {
	if (available) {
		return 'status-available'
	}
	return 'status-default'
}

onUnmounted(() => {
	domainList.value = []
	searchValue.value = ''
	domainSearchDialog.value = null
})

</script>

<style lang="scss" scoped>
.domain-search-content {
	padding: 2rem;
	.search-input-group {
		.search-input {
			:deep(.el-input-group__append) {
				background-color: var(--el-color-primary);
				color: var(--el-color-white);
				border-color: var(--el-color-primary);
			}
		}
	}
	.domain-list {
		min-height: 400px;
		overflow-y: auto;
		
		.domain-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 16px 0;
			padding-left: 8px;
			border-bottom: 1px solid var(--el-border-color-light);

			&.last-item {
				border-bottom: none;
			}

			.domain-info {
				.domain-name {
					font-size: 14px;
					font-weight: 500;
					color: var(--el-text-color-primary);
					
					&.registered-domain {
						text-decoration: line-through;
					}
				}

				.domain-status {
					font-size: 12px;
					
					.status-default {
						color: var(--el-text-color-regular);
						white-space: nowrap;
					}
				}
			}

			.domain-actions {
				display: flex;
				align-items: center;
				gap: 12px;

				.domain-price {
					.price-info {
						display: flex;
						flex-direction: column;
						align-items: flex-end;
						gap: 2px;
						
						.original-price {
							font-size: 12px;
							color: var(--el-text-color-placeholder);
							text-decoration: line-through;
							margin-right: 4px;
						}
						
						.current-price {
							display: flex;
							font-size: 14px;
							font-weight: 500;
							color: #ff6b35;
						}
						
						.renewal-price {
							font-size: 12px;
							color: var(--el-text-color-regular);
						}
					}
					
					.unavailable-price {
						color: var(--el-text-color-placeholder);
					}
				}
			}
		}
	}
	.empty-state {
		text-align: center;
		padding: 40px 0;
	}
}
</style>

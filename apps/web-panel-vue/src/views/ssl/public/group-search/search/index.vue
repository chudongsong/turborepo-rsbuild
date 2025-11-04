<template>
	<div class="relative mr-[8px]">
		<bt-input-search class="w-[20rem]" placeholder="搜索域名" v-model="domainParams.search" @focus="showSearchHistory = true" @search="handleSerach" @clear="clearSearchInfo" @blur="closeSearchHistory" />
		<bt-search-history
			v-show="showSearchHistory"
			:historyList="sslHistoryList"
			:params="{
				name: 'ssl',
				key: historyType,
			}" />
	</div>
</template>

<script setup lang="ts">
import { getSslStore } from '@ssl/useStore'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())
const {
	refs: { domainParams, isRefreshDomainList, certificateParams, tabActive },
} = getSslStore()

const showSearchHistory = ref(false)
const sslHistoryList = inject('sslHistoryList', shallowRef<any[]>([])) // 历史记录
const historyType = ref('get_domain_list')

/**
 * @description: 获取搜索历史
 * @param {string} val 搜索内容
 * @return {void}
 */
const searchValue = (val: string) => {
	domainParams.value.search = val
	refreshEvent(val, false)
}

const handleSerach = (val: string) => {
	domainParams.value.search = val
	if (val === undefined) domainParams.value.search = ''
	refreshEvent(val, true)
}

// 刷新事件
const refreshEvent = (query: string, isRefresh?: boolean) => {
	switch (tabActive.value) {
		case 'domain':
			domainParams.value.search = query
			historyType.value = 'get_domain_list'
			isRefresh && (isRefreshDomainList.value = true)
			break
		case 'certificate':
			certificateParams.value.search = query
			historyType.value = 'get_cert_list'
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			isRefresh && refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			break
	}
}

/**
 * @description 清空搜索信息
 */
const clearSearchInfo = () => {
	domainParams.value.search = ''
	refreshEvent('', true)
}

// 关闭搜索历史
const closeSearchHistory = () => {
	nextTick(() => {
		showSearchHistory.value = false
	})
}

onMounted(() => {
	domainParams.value.search = ''
	refreshEvent('', false)
})
</script>

<style scoped></style>

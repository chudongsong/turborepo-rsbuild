<template>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-16px">
			<div class="w-240px">
				<domain-select v-model:value="domain" @update:value="onUpdateDomain"></domain-select>
			</div>
			<header-nav-tools />
			<!-- <div v-if="payment.authType !== 'ltd'">
				<span class="mr-8px">升级到企业版立即解锁所有报表</span>
				<el-button type="primary" size="small" plain @click="onPay">立即升级</el-button>
			</div> -->
		</div>
		<div class="flex items-center">
			<search-date v-model:type="time.type" v-model:value="time.data" @update:value="onUpdateTime"></search-date>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store/global'
import { time, domain, useOverview } from '../useMethod'

import DomainSelect from '@/views/mail/public/domain-select.vue'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'
import SearchDate from './date.vue'
import { productPaymentDialog } from '@/public'

const store = useGlobalStore()

const { getOverview } = useOverview()

const { payment } = storeToRefs(store)
const onPay = () => {
	// 开通企业版付费
	productPaymentDialog({
		disablePro: true,
		sourceId: 324,
	})
	return
}

const onUpdateDomain = () => {
	getOverview()
}

const onUpdateTime = () => {
	getOverview()
}
</script>

<template>
	<div class="relative h-full">
		<div class="mb-[16px]" v-if="sslAlertState">
			<el-alert type="error" class="mb-[16px]" :closable="false">
				<template #title>
					<div class="flex items-center justify-between w-full">
						<template v-if="!sslInfo?.isStart">
							<div class="mr-[32px] text-small">温馨提示：当前站点未开启SSL证书访问，站点访问可能存在风险。</div>
							<el-button type="primary" size="small" @click="applyBusSslEvent"> 申请证书 </el-button>
						</template>
						<template v-if="sslInfo?.isSupportRenewal && sslInfo?.isStart">
							<div class="mr-[32px] text-small flex items-center">
								温馨提示：当前[
								<span class="flex max-w-[20rem] truncate leading-[18px] inline-block" :title="sslInfo.dns.join('、')">
									{{ sslInfo.dns.join('、') }}
								</span>
								]证书{{ Number(sslInfo.endtime) < 0 ? '已过期' : '即将过期' }}
							</div>
							<el-button type="primary" size="small" @click="renewalCurrentCertEvent()"> 续签证书 </el-button>
						</template>
					</div>
				</template>
			</el-alert>
		</div>
		<BtTabs />
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import { applyBusSslEvent, getSslInfoConfig, renewalCurrentCertEvent, tabComponent } from '@site/public/ssl-arrange/useController'
import { useSiteSSLStore } from '@site/public/ssl-arrange/useStore'

const { sslTabActive, sslAlertState, sslInfo } = useSiteSSLStore()

const { BtTabs } = useTabs({
	type: 'card',
	options: tabComponent,
	value: sslTabActive,
})

onMounted(() => {
	getSslInfoConfig()
})
</script>

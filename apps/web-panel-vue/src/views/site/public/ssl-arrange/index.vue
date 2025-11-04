<template>
	<div class="relative h-full">
		<div v-if="!isBindExtranet || isStarted" class="bg-light flex items-center justify-center h-full" style="min-height: 600px">
			<div v-if="!isBindExtranet" class="bg-lighter px-[48px] py-[16px] text-default">
				请开启
				<span class="!inline-block bt-link" @click="jumpTabEvent('mapping')"> 外网映射 </span>
				后查看配置信息
			</div>
			<div v-else-if="isStarted" class="bg-lighter px-[48px] py-[16px] text-default">
				请
				<span class="!inline-block bt-link" @click="jumpTabEvent('state')"> 启动项目 </span>
				后再管理SSL
			</div>
		</div>
		<div v-else class="relative">
			<div class="mb-[16px]" v-if="sslAlertState">
				<el-alert type="error" class="mb-[16px]" :closable="false">
					<template #title>
						<div class="flex items-center justify-between w-full">
							<div class="flex items-center">
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
							<span class="bt-link absolute top-.7rem z-10 right-1.2rem flex items-center" @click="openNps">
								<span class="svgtofont-desired text-medium"></span>
								需求反馈
							</span>
						</div>
					</template>
				</el-alert>
			</div>
			<BtTabs />
			<!-- <bt-tabs type="card" v-model="sslTabActive" :options="tabComponent" /> -->
			<!-- <bt-tabs class="w-full h-full" v-model="sslTabActive" type="card">
				<el-tab-pane
					v-for="(item, index) in tabComponent"
					:key="index"
					:name="item.name"
					:lazy="true"
					:label="item.label">
					<template #label>
						<div v-if="index === 0" v-html="currentCertTitle"></div>
						<div v-else-if="item.name === 'busSslList'" class="z-9999">
							<span>
								{{ item.label }}
							</span>
						</div>
						<div v-else>{{ item.label }}</div>
					</template>
					<component :is="item.component" />
				</el-tab-pane>
			</bt-tabs> -->
			<span v-if="!sslAlertState" class="bt-link absolute top-.7rem z-10 right-0 flex items-center" @click="openNps">
				<span class="svgtofont-desired text-medium"></span>
				需求反馈
			</span>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import { applyBusSslEvent, mountEvent, renewalCurrentCertEvent, tabComponent } from './useController'
import { useSiteSSLStore } from './useStore'
import { openNps } from './useController'

const { isBindExtranet } = useSiteStore()
const { siteType, siteInfo } = storeToRefs(SITE_STORE())
const { jumpTabEvent } = SITE_STORE()
const { sslTabActive, sslAlertState, sslInfo } = useSiteSSLStore()

const status = computed(() => (siteType.value === 'java' ? siteInfo.value?.pid !== null : siteType.value === 'phpasync' ? !!siteInfo.value?.status : siteInfo.value.run))
const isStarted = computed(() => {
	return !status.value && ['java', 'nodejs', 'go', 'python', 'net'].includes(siteType.value)
})

const { BtTabs } = useTabs({
	type: 'card',
	options: tabComponent,
	value: sslTabActive,
})

onMounted(mountEvent)

defineExpose({
	init: mountEvent,
})
</script>

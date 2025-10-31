<template>
	<div>
		<bt-tabs v-if="isBindExtranet || siteType === 'java'" type="card" v-model="tabActive" :options="tabComponent" @change="onTabChangeEvent" />
		<div class="bg-light flex items-center justify-center h-full" style="min-height: 600px" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">
				请开启
				<bt-link class="mx-[.4rem]" @click="jumpTabEvent('mapping')"> 外网映射 </bt-link>
				后查看
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useSiteStore, SITE_STORE } from '@site/useStore'
import { initLogs, tabActive, tabComponent, onTabChangeEvent } from './useController'

const { isBindExtranet, siteType } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

onMounted(initLogs)

defineExpose({ init: initLogs })
</script>

<template>
	<div>
		<AnalyseLog v-if="isBindExtranet" type="site" :name="siteInfo.name"></AnalyseLog>
		<div class="bg-light flex items-center justify-center h-full" style="min-height: 500px" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">
				请开启
				<bt-link class="mx-[.4rem]" @click="jumpTabEvent('mapping')"> 外网映射 </bt-link>
				后查看
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import AnalyseLog from '@logs/views/web-log/analyse-log/index.vue'
import { useSiteStore, SITE_STORE } from '@site/useStore'

const { isBindExtranet, siteInfo } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()
</script>

<template>
	<div>
		<AnalyseLog type="site" :name="siteInfo.name"></AnalyseLog>
	</div>
</template>

<script setup lang="ts">
import AnalyseLog from '@logs/views/web-log/analyse-log/index.vue'
import { useSiteStore, SITE_STORE } from '@site/useStore'

const { siteInfo } = useSiteStore()
</script>

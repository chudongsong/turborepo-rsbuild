<template>
	<div>
		<BtTabs />
	</div>
</template>

<script setup lang="ts">
import { useTabs } from '@/hooks/tools'
import { tabComponent } from './useController'
import useWPWordpressSettingStore from './useStore'

const { tabActive } = storeToRefs(useWPWordpressSettingStore())

const { BtTabs } = useTabs({
	type: 'card',
	options: tabComponent,
	value: tabActive,
})
</script>

<style scoped></style>

<template>
	<bt-tabs type="card" v-model="panelTabActive" :options="tabComponent" @change="changeTabs" />
</template>

<script lang="ts" setup>
import { LOG_STORE } from '@/views/logs/useStore'
import { tabComponent, changeTabs } from './useController'

const { panelTabActive } = LOG_STORE()
</script>

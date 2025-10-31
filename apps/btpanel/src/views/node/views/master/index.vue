<template>
	<bt-tabs class="module-ui" type="card" v-model="tabActive" :options="tabComponent" />
</template>

<script lang="ts" setup>
import { MASTER_STORE } from '@/views/node/views/master/useStore'
import { tabComponent } from './useController'

const { tabActive } = storeToRefs(MASTER_STORE())
</script>

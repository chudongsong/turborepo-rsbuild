<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="onShowAdd">添加发送任务</el-button>
			</template>
			<template #content>
				<bt-table v-bt-loading="table.loading" :data="table.data" :column="columns"></bt-table>
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="search.p" v-model:row="search.size" :total="table.total" @change="getList"> </bt-table-page>
			</template>
		</bt-table-group>
		<!-- <pay-conversion v-else></pay-conversion> -->
	</div>
</template>

<script lang="tsx" setup>
import { useGlobalStore } from '@store/global'
import MAIL_MASS from '@mail/views/mass/store'

import PayConversion from './conversion.vue'
import { storeToRefs } from 'pinia'
import { getList, onShowAdd } from '@mail/views/mass/useMethod'

const { payment } = useGlobalStore()
const { search, table } = storeToRefs(MAIL_MASS())
const { columns, reset } = MAIL_MASS()

onMounted(() => {
	getList()
})

onUnmounted(() => {
	reset()
})
</script>

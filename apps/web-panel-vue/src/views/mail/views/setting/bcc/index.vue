<template>
	<bt-table-group>
		<template #header-left>
			<el-button type="primary" @click="onShowAdd">添加密抄</el-button>
		</template>
		<template #header-right>
			<el-button @click="refresh">刷新</el-button>
		</template>
		<template #content>
			<bt-table v-bt-loading="table.loading" :data="table.data" :column="columns"></bt-table>
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import MAIL_BCC from '@mail/views/setting/bcc/store'
import { storeToRefs } from 'pinia'
import { getList, onShowAdd, refresh } from '@mail/views/setting/bcc/useMethod'

const { table } = storeToRefs(MAIL_BCC())
const { columns, reset } = MAIL_BCC()

getList()

onUnmounted(() => {
	reset()
})
</script>

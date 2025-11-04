<template>
	<bt-table-group>
		<template #header-left>
			<div class="w-460px flex items-center">
				<span class="mr-[1rem] w-[7rem] text-base">邮箱地址</span>
				<sender-select ref="senderRef" v-model:value="search.username" @update:value="refresh"> </sender-select>
			</div>
		</template>
		<template #header-right>
			<div class="flex items-center">
				<el-button @click="refresh">刷新</el-button>
			</div>
		</template>
		<template #content>
			<bt-table v-bt-loading="table.loading" :data="table.data" :column="columns"></bt-table>
		</template>
		<template #footer-right>
			<!-- <bt-table-page v-model:page="search.p" :total="table.total" @change="getList"> </bt-table-page> -->
			<el-pagination size="small" v-model:current-page="search.p" :page-size="10" layout="prev, pager, next, total" :total="table.total" background @current-change="getList" />
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import SenderSelect from '@mail/public/sender-select.vue'
import MAIL_SPAM from '@mail/views/email/spam/store'
import { storeToRefs } from 'pinia'
import { getList, refresh } from '@mail/views/email/spam/useMethod'

const { search, table, senderRef } = storeToRefs(MAIL_SPAM())
const { columns, reset } = MAIL_SPAM()

onMounted(async () => {
	await senderRef.value.getList()
})

onUnmounted(() => {
	reset()
})
</script>

<style lang="scss" scoped>
:deep(.el-popper) {
	max-width: 800px !important;
}
</style>

<template>
	<bt-table-group>
		<template #header-left>
			<el-button type="primary" @click="onShowAdd">添加邮箱</el-button>
			<el-button @click="onLoginMail">WebMail</el-button>
		</template>
		<template #content>
			<bt-table v-bt-loading="table.loading" :data="table.data" :column="columns"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page v-model:page="search.p" v-model:row="search.size" :total="table.total" @change="getList"> </bt-table-page>
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import MAIL_MAILBOX from '@mail/views/mailbox/store'
import { getList, onShowAdd, useMailMethods, init } from '@mail/views/mailbox/method'
import { storeToRefs } from 'pinia'

const { onLoginMail } = useMailMethods()
const { search, table, columns } = storeToRefs(MAIL_MAILBOX())
const { reset } = MAIL_MAILBOX()

nextTick(() => {
	init()
})

onUnmounted(() => {
	reset()
})
</script>

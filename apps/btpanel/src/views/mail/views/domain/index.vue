<template>
	<div>
		<domain-tips></domain-tips>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="onShowAdd">添加域名</el-button>
				<header-nav-tools class="ml-16px" />
			</template>
			<template #header-right>
				<el-button @click="onRefresh">刷新域名记录</el-button>
			</template>
			<template #content>
				<bt-table v-bt-loading="table.loading" :data="table.data" :column="columns"></bt-table>
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="search.p" v-model:row="search.size" :total="table.total" @change="getList">
				</bt-table-page>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import MAIL_DOMAIN from '@mail/views/domain/store'
import { getList, onRefresh, onShowAdd } from '@mail/views/domain/method'
import { storeToRefs } from 'pinia'
import DomainTips from '@mail/views/domain/tips/index.vue'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'

const { search, table, columns }: any = storeToRefs(MAIL_DOMAIN())

getList()
</script>

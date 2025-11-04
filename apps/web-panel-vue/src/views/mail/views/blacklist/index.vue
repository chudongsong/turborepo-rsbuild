<template>
	<bt-table-group>
		<template #header-left>
			<div class="w-340px mr-[1rem]">
				<el-input v-model="email" placeholder="多个邮箱请使用英文逗号 ',' 隔开" @keyup.enter="onAdd"> </el-input>
			</div>
			<el-button type="primary" @click="onAdd">添加</el-button>
			<el-button @click="onImport">导入</el-button>
			<el-button @click="onExport">导出</el-button>
		</template>
		<template #header-right>
			<bt-input-search v-model="search.keyword" class="!w-[240px]" :placeholder="'请输入邮箱'" @search="getList" > </bt-input-search>
		</template>
		<template #content>
			<bt-table ref="tableRef" :row-key="getKeys" v-bt-loading="table.loading" :data="table.data" :column="columns"></bt-table>
		</template>

		<template #footer-left>
			<bt-table-batch :table-ref="tableRef" :options="tableBatchData" />
			<!-- <bt-table-batch
					v-model:checked-row-keys="keys"
					row-key="email"
					:data="table.data"
					:options="batchOptions">
				</bt-table-batch> -->
		</template>
	</bt-table-group>
</template>

<script lang="ts" setup>
import MAIL_BLACKLIST from '@mail/views/blacklist/store'
import { storeToRefs } from 'pinia'
import { getList, onAdd, onImport, onExport, getKeys } from '@mail/views/blacklist/useMethod'

const { columns, tableBatchData, reset } = MAIL_BLACKLIST()
const { email, search, table, tableRef } = storeToRefs(MAIL_BLACKLIST())

getList()

onUnmounted(() => {
	reset()
})
</script>

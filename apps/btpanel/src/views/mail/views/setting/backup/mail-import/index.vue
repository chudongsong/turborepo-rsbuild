<template>
	<el-card shadow="never">
		<template #header>
			<div class="card-header">
				<span>邮件导入</span>
			</div>
		</template>
		<div class="px-20px py-16px">
			<bt-table-group>
				<template #header-left>
					<el-button @click="onUpload">本地上传</el-button>
					<el-button @click="onSelect">在服务器中选择</el-button>
				</template>
				<template #content>
					<bt-table :max-height="340" :bordered="true" v-bt-loading="loading" :data="table.data"
						:column="columns"> </bt-table>
				</template>
			</bt-table-group>
		</div>
	</el-card>
</template>

<script lang="ts" setup>
import MAIL_BACKUP_IMPORT from '@mail/views/setting/backup/mail-import/store'
import { storeToRefs } from 'pinia'
import { getList, onUpload, onSelect } from '@mail/views/setting/backup/mail-import/useMethod'

const { loading, table } = storeToRefs(MAIL_BACKUP_IMPORT())
const { columns, reset } = MAIL_BACKUP_IMPORT()

getList()

onUnmounted(() => {
	reset()
})
</script>

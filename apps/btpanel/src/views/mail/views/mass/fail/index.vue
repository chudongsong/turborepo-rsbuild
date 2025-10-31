<template>
	<div class="p-20px">
		<bt-table-group>
			<template #header-left>
				<el-radio-group v-model="search.type" @change="getList">
					<el-radio-button value="domain">域名</el-radio-button>
					<el-radio-button value="status">状态</el-radio-button>
				</el-radio-group>
			</template>
			<template #content>
				<bt-table :max-height="340" v-bt-loading="loading" :data="table.data" :column="columns"> </bt-table>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { MailTask } from '@mail/types'
import MAIL_MASS_FAIL from '@mail/views/mass/fail/store'
import { storeToRefs } from 'pinia'
import { getList, init } from '@mail/views/mass/fail/useMethod'

const { search, table, loading } = storeToRefs(MAIL_MASS_FAIL())
const { columns, reset } = MAIL_MASS_FAIL()

interface PropsData {
	row: MailTask
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

onMounted(async () => {
	await init(props.compData.row)
	await getList()
})

onUnmounted(() => {
	reset()
})
</script>

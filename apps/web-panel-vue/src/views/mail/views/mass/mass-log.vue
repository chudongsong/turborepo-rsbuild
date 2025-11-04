<template>
	<div class="h-[50rem] overflow-y-auto">
		<bt-log :content="log" v-bt-loading="loading"></bt-log>
	</div>
</template>

<script lang="ts" setup>
import { isObject } from '@/utils'
// import { useLoading } from '@/hooks/useLoading'
import { getFileBody } from '@/api/global'
// import { FileBody } from '@/types/file'
import { MailTask } from '@mail/types'

interface PropsData {
	row: MailTask
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const log = ref('暂无错误日志')

const loading = ref(false)

const getLog = async () => {
	try {
		loading.value = true
		const { data } = await getFileBody({ path: props.compData.row.error_log })
		if (isObject(data)) {
			log.value = data.data || '暂无错误日志'
		}
	} finally {
		loading.value = false
	}
}

getLog()
</script>

<template>
	<div>
		<template v-if="compData.sub_type === 'soft_install'">
			<bt-log v-bt-loading="loading" class="h-50rem !rounded-none" :content="content" element-loading-background="rgba(var(--el-color-black-rgb), 0.6)"> </bt-log>
		</template>
		<template v-else-if="compData.sub_type === 'push_msg'">
			<div v-bt-loading="loading" class="p-24px">
				<el-descriptions
					:column="1"
					:border="true"
					:content-style="{ color: 'var(--el-base-primary)', fontSize: '13px' }"
					:label-style="{
						width: '100px',
						backgroundColor: 'var(--el-fill-color-light)',
						color: 'var(--el-base-primary)',
						fontSize: '13px',
					}">
					<el-descriptions-item label="消息名称">
						{{ pushSub.push_title || '--' }}
					</el-descriptions-item>
					<el-descriptions-item label="类型">
						{{ pushSub.push_type || '--' }}
					</el-descriptions-item>
					<el-descriptions-item label="来源">
						{{ compData.msg_types.join('>') }}
					</el-descriptions-item>
					<el-descriptions-item label="时间">
						{{ formatTime(compData.create_time) }}
					</el-descriptions-item>
					<el-descriptions-item label="消息内容">
						<div class="leading-24px" v-html="pushSub.data || '--'"></div>
					</el-descriptions-item>
				</el-descriptions>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { formatTime, isObject } from '@/utils'
import { MessageCenter, MessagePushSub, MessageSoftSub } from '../types'
import { getFileBody, getMsgInfo } from '@/api/global'

interface Props {
	compData: MessageCenter
}

const props = withDefaults(defineProps<Props>(), {})

const content = ref('')

const loading = ref(false)

const id = computed(() => {
	return props.compData.id
})

const pushSub = ref<MessagePushSub>({
	data: '',
	id: 0,
	pid: 0,
	push_title: '',
	push_type: '',
	self_type: '',
})

const getContent = async () => {
	try {
		loading.value = true
		const { data } = await getMsgInfo({ msg_id: id.value })
		if (data) {
			const { sub } = data

			if (!isObject(sub)) return

			switch (data.sub_type) {
				case 'push_msg':
					pushSub.value = sub as MessagePushSub
					pushSub.value.data = pushSub.value.data.replace(/\n/g, '<br>')
					break
				case 'soft_install':
					await getLogs(sub as MessageSoftSub)
					break
			}
		}
	} finally {
		loading.value = false
	}
}

const getLogs = async (sub: MessageSoftSub) => {
	const { data: res } = await getFileBody({ path: sub.file_name })
	content.value = res.data
}

onMounted(() => {
	getContent()
})
</script>

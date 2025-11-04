<template>
	<div class="p-20px">
		<el-descriptions :column="1" border class="table-descriptions">
			<el-descriptions-item label="显示名称">
				{{ compData.row.full_name }}
			</el-descriptions-item>
			<el-descriptions-item label="发件人">
				{{ compData.row.addresser }}
			</el-descriptions-item>
			<el-descriptions-item label="邮件主题">
				{{ compData.row.subject }}
			</el-descriptions-item>
			<el-descriptions-item label="保存在发件箱">
				{{ compData.row.is_record === 1 ? '是' : '否' }}
			</el-descriptions-item>
			<el-descriptions-item label="分组">
				<el-space wrap>
					<el-tag v-for="item of contacts" type="info" :key="item" size="small">{{ item }}</el-tag>
				</el-space>
			</el-descriptions-item>
			<el-descriptions-item label="退订者">
				<span class="bt-link" @click="onShowUnsubscribe">点击查看</span>
			</el-descriptions-item>
			<el-descriptions-item label="退订链接">
				{{ compData.row.unsubscribe === 1 ? '是' : '否' }}
			</el-descriptions-item>
			<el-descriptions-item label="线程数">
				{{ compData.row.threads === 0 ? '自动' : compData.row.threads }}
			</el-descriptions-item>
		</el-descriptions>
		<!-- 显示任务退订信息 -->
		<bt-modal v-model:show="unsubscribeModal.show" :title="unsubscribeModal.title" :data="unsubscribeModal.data"
			:width="550" :min-height="280" :component="TsakUnsubscribe">
		</bt-modal>
	</div>
</template>

<script lang="ts" setup>
import { useModalData } from '@/views/mail/useMethod';
import TsakUnsubscribe from '../unsubscribe/index.vue'
import { useDialog } from '@/hooks/tools';

interface PropsData {
	row: any
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
	(event: 'add', data: unknown): void
}>()

const compData = toRef(props, 'compData')

const unsubscribeModal = useModalData('')

const onShowUnsubscribe = () => {
	useDialog({
		title: `退订【${compData.value.row.subject}】`,
		area: 55,
		compData: {
			id: compData.value.row.id
		},
		component: () => import('../unsubscribe/index.vue')
	})
}

const contacts = computed(() => {
	return compData.value.row.mail_type.map(obj => Object.values(obj)[0] as string)
})

const onConfirm = () => {
	emit('add', compData.value.row)
}

defineExpose({
	onConfirm,
})
</script>

<style lang="scss" scoped>
:deep(.el-descriptions__label) {
	width: 180px;
}
</style>
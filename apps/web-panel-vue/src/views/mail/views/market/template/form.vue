<template>
	<div>
		<div class="mb-14px font-bold text-large text-default leading-28px">邮件模板编辑</div>
		<el-form label-position="left">
			<el-form-item v-if="false">
				<template #label>
					<el-radio-group v-model:value="type" size="small">
						<el-radio-button :value="1">拖拽</el-radio-button>
						<el-radio-button :value="0">上传</el-radio-button>
					</el-radio-group>
				</template>
			</el-form-item>
			<div class="mb-20px">
				<drag-editor ref="editorRef" :save="saveTemplate"></drag-editor>
			</div>
			<el-form-item label="模板名称" label-width="50px">
				<div class="w-320px">
					<el-input v-model="name"></el-input>
				</div>
			</el-form-item>
		</el-form>
		<div class="flex items-center">
			<el-button @click="onClose">返回</el-button>
			<el-button type="primary" :loading="btnLoad" :disabled="btnLoad" class="ml-12px" @click="onSave"> 保存 </el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { isObject } from '@/utils'
import { editMailTemplate, getMailTemplateContent } from '@/api/mail'

interface Props {
	data: any
	refresh: () => void
}

const props = withDefaults(defineProps<Props>(), {
	data: null,
})

const DragEditor = defineAsyncComponent(() => import('@/views/mail/views/drag/index.vue'))

const template = toRef(props, 'data')

const show = defineModel<boolean>('show', {
	default: false,
})

const editorRef = useTemplateRef('editorRef')

const type = ref(1)

const name = ref('')

const onClose = () => {
	show.value = false
}

const btnLoad = ref(false)

const saveTemplate = async (loading = false) => {
	if (template.value) {
		try {
			if (!loading) btnLoad.value = true
			await editMailTemplate(
				{
					id: template.value.id,
					type: type.value,
					temp_name: name.value,
					render: JSON.stringify(editorRef.value?.getEmailData()),
					content: editorRef.value?.getEmailHTML() || '',
				},
				loading
			)
		} finally {
			if (!loading) btnLoad.value = false
		}
	}
}

const onSave = async () => {
	await saveTemplate(true)
	onClose()
	props.refresh()
}

const getContent = async () => {
	btnLoad.value = true
	await nextTick()
	setTimeout(async () => {
		if (!template.value) {
			return
		}

		try {
			name.value = template.value.name
			const { data } = await getMailTemplateContent({ id: template.value.id })
			if (isObject<{ render: string }>(data)) {
				editorRef.value?.setEmailData(data.render)
			}
		} finally {
			setTimeout(() => {
				btnLoad.value = false
			}, 500)
		}
	}, 500)
}

onMounted(() => {
	getContent()
})
</script>

<style lang="scss" scoped>
:deep(.el-form-item) {
	flex-direction: column;
}

:deep(.el-form-item__label) {
	min-width: unset !important;
}
</style>

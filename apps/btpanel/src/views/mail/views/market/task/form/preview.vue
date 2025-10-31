<template>
	<div class="flex-1 min-w-[520px] overflow-auto border-lighter border-1 border-solid rounded-base p-[12px]" v-html="content"></div>
</template>

<script lang="ts" setup>
import { isObject } from '@/utils'
import { editMailTemplate, getMailTemplateContent } from '@/api/mail'
import { versionCheck } from '@/views/mail/views/drag/controller'

interface Props {
	id: number | null
}

const props = withDefaults(defineProps<Props>(), {})

const id = toRef(props, 'id')

const content = ref('')

const getContent = async () => {
	if (!id.value) return
	const { data: message } = await getMailTemplateContent({ id: id.value })
	if (isObject<{ type: number; name: string; render: string; content: string }>(message)) {
		const data = versionCheck(message.render)
		if (data && message.type === 1) {
			content.value = data.content
			await editMailTemplate(
				{
					id: id.value,
					type: message.type,
					temp_name: message.name,
					render: JSON.stringify(data.render),
					content: data.content,
				},
				false
			)
		} else {
			content.value = message.content
		}
	}
}

watch(
	() => id.value,
	() => {
		getContent()
	}
)

getContent()
</script>

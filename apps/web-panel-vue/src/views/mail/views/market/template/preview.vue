<template>
	<div class="min-h-600px overflow-auto" v-html="content"></div>
</template>

<script lang="ts" setup>
import { isObject } from '@/utils';
import { editMailTemplate, getMailTemplateContent } from '@/api/mail';
import { versionCheck } from '@/views/mail/views/drag/controller';

interface PropsData {
	row: any
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const template = toRef(props.compData, 'row')

const content = ref('')

const getContent = async () => {
	const { data: message } = await getMailTemplateContent({ id: template.value.id })
	if (isObject<{ type: number; name: string; render: string; content: string }>(message)) {
		const data = versionCheck(message.render)
		if (data && message.type === 1) {
			content.value = data.content
			await editMailTemplate({
				id: template.value.id,
				type: message.type,
				temp_name: message.name,
				render: JSON.stringify(data.render),
				content: data.content
			}, false)
		} else {
			content.value = message.content
		}
	}
}

getContent()
</script>

<style lang="scss" scoped></style>

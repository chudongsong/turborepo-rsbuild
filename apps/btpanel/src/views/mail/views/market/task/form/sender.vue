<template>
	<div class="w-170px mr-10px">
		<el-select v-model="domain" :loading="domainLoading" @change="onUpdateDomain">
			<el-option v-for="item in domainOptions" :key="item.value" :label="item.label" :value="item.value" />
		</el-select>
	</div>
	<div class="w-180px">
		<el-select v-model="sender" :loading="senderLoading" @change="onUpdateSender">
			<el-option v-for="item in senderOptions" :key="item.value" :label="item.label" :value="item.value" />
		</el-select>
	</div>
</template>

<script lang="ts" setup>
import { isArray, isObject } from '@/utils';
import { getDomainName, getUserList } from '@/api/mail';

const emit = defineEmits<{
	(event: 'change', name: string): void
}>()

const domain = ref<any>(null)

const sender = defineModel<any>('value')

const domainOptions = ref<any[]>([])

const senderOptions = ref<any[]>([])

const senderList = ref<any[]>([])

const onUpdateSender = (val: string) => {
	const item = senderList.value.find(item => item.username === val)
	if (item) {
		emit('change', item.full_name)
	}
}

const domainLoading = ref(false)

const senderLoading = ref(false)

const getDomainList = async () => {
	try {
		domainLoading.value = true
		const { data: { data } } = await getDomainName()
		if (isArray<string>(data)) {
			domainOptions.value = data.map(item => ({ label: item, value: item }))
			domain.value = data[0] || null
		}
	} finally {
		domainLoading.value = false
	}
}

const getSenderList = async () => {
	try {
		senderLoading.value = true
		const { data: { data } } = await getUserList()
		if (isArray<any>(data) && data.length > 0) {
			senderList.value = data
		}
	} finally {
		senderLoading.value = false
	}
}

const renderSenderOptions = () => {
	senderOptions.value = senderList.value.filter(item => item.domain === domain.value).map(item => ({
		data: item,
		label: item.username,
		value: item.username
	}))
}

const renderSenderValue = () => {
	if (senderOptions.value[0]) {
		const { data } = senderOptions.value[0]
		sender.value = `${senderOptions.value[0].value}`
		if (isObject<any>(data)) {
			emit('change', data.full_name)
		}
	} else {
		sender.value = null
		emit('change', '')
	}
}

const onUpdateDomain = () => {
	renderSenderOptions()
	renderSenderValue()
}

const init = async () => {
	await Promise.all([getDomainList(), getSenderList()])
	renderSenderOptions()
	if (sender.value) {
		for (const item of senderList.value) {
			if (item.username === sender.value) {
				domain.value = item.domain
				break
			}
		}
	} else {
		renderSenderValue()
	}
}

init()
</script>

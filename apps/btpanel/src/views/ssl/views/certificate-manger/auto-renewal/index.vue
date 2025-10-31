<template>
	<div class="p-2rem">
		<el-form :rules="rules" :model="form" label-width="100px">
			<el-form-item label="证书">
				<el-input class="!w-[28rem]" v-model="form.title" disabled />
			</el-form-item>
			<el-form-item label="剩余天数" prop="cycle">
				<bt-input v-model="form.cycle" width="14rem" textType="天" min="1" type="number">
					<template #append> 天 </template>
				</bt-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { addRenewalTask } from '@api/ssl'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})
const emits = defineEmits(['close'])

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const form = reactive<any>({
	title: '',
	cycle: 30,
})

const rules = ref({
	cycle: [
		{ required: true, message: '请输入剩余天数', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('请输入大于0的正整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

const onConfirm = async () => {
	let load
	try {
		load = useMessage().load('正在配置证书自动续期，请稍候...')
		const ress = await addRenewalTask({
			index: props.compData.index,
			cycle: form.cycle,
			name: form.title,
		})
		useMessage().request(ress)
		if (ress.status) {
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			emits('close')
		}
	} catch (err) {
		console.error(err)
	} finally {
		load && load.close()
	}
}

const init = () => {
	if (props.compData?.domainName && props.compData.domainName.length > 0) {
		const domainNames = props.compData.domainName.slice(0, 2).join('|')
		const suffix = props.compData.domainName.length > 2 ? '|...' : ''
		form.title = `${props.compData.title} (${domainNames}${suffix})`
	} else {
		form.title = props.compData.title
	}
}

onMounted(() => {
	init()
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>

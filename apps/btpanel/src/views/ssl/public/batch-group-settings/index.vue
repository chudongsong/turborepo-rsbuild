<template>
	<div class="p-[2rem] flex justify-center flex-col">
		<el-form ref="formRef" :model="formData" :rules="rules">
			<el-form-item :label="compData.type === 'certificate' ? '证书分组' : '域名分类'" prop="selectValue">
				<el-select v-model="formData.selectValue" class="!w-[31rem]">
					<el-option v-for="item in selectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@hooks/tools/message'
import { getSslStore } from '@ssl/useStore'
import { setCertGroup, setDomainType } from '@api/ssl'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const MessageMethod = useMessage()

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const {
	refs: { isRefreshDomainList, typeList },
} = getSslStore()

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})
const emits = defineEmits(['close'])

const formRef = ref()
const formData = ref({
	selectValue: '',
})

const rules = {
	selectValue: [{ required: true, message: `请选择${props.compData.type === 'certificate' ? '证书分组' : '域名分类'}`, trigger: 'change' }],
}

const selectList = ref<any>([])
const ids = ref<any>([])

const onConfirm = async () => {
	if (!formRef.value) return

	try {
		await formRef.value.validate()
		const load = MessageMethod.load(`正在${props.compData.type === 'certificate' ? '设置证书分组' : '设置域名分类'}，请稍候...`)
		try {
			const ress = await getTypeRequest(props.compData.type)
			MessageMethod.request(ress)
			if (ress.status) {
				emits('close')
			}
		} finally {
			load.close()
		}
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description 根据当前type发送请求类型
 */
const getTypeRequest = async (type: string) => {
	let ress
	try {
		switch (type) {
			case 'certificate':
				ids.value = props.compData.itemList.map((item: any) => ({
					id: item.id,
					type: item.type,
				}))
				ress = await setCertGroup({ ids: JSON.stringify(ids.value), group_id: formData.value.selectValue })
				if (ress.status) {
					const refreshMap = {
						ssl: () => (sslIsRefresh.value = true),
						test: () => (testIsRefresh.value = true),
						encrypt: () => (encryptIsRefresh.value = true),
						other: () => (otherIsRefresh.value = true),
					} as const
					refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
				}
				break
			case 'domain':
				ids.value = props.compData.itemList.map((item: any) => item.id)
				ress = await setDomainType({ ids: JSON.stringify(ids.value), type_id: formData.value.selectValue })
				if (ress.status) {
					isRefreshDomainList.value = true
				}
				break
		}
	} catch (error) {
		console.log(error)
	}
	return ress
}

const init = () => {
	selectList.value = typeList.value.filter((item: any) => item.value !== 'all')
}

defineExpose({
	onConfirm,
})

onMounted(() => {
	init()
})
</script>

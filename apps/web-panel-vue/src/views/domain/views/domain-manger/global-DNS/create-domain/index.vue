<template>
	<div class="p-[16px]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { getDnsData, syncDnsDomain } from '@/api/ssl'
import { useDataHandle, useForm, useMessage } from '@/hooks/tools'
import { getSslStore } from '@ssl/useStore'
import { FormInput, FormSelect} from '@form/form-item'
import { checkObjKey } from '@utils/index'

const {
	refs: { isRefreshDomainList },
} = getSslStore()

const message = useMessage()

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

const { row } = toRefs(props.compData)
const tableList = ref<any>([])

const { BtForm, submit, formRef } = useForm({
	data: () => ({
		domain_name: '',
	}),
	options: () => {
        return computed(() => [
            FormInput('域名', 'domain_name', {
                attrs: {
                    width: '32rem',
                    placeholder: '请输入域名',
                },
                rules: [
                    { required: true, message: '请输入域名', trigger: 'change' },
                ]
            }),
            FormSelect('DNS接口', 'dns_id', tableList.value.map((item: any) => ({
                label: item.dns_name,
                value: item.id,
            })), {
                attrs: {
                    class: '!w-[32rem]',
                    placeholder: '请选择DNS接口',
                },
                rules: [
                    { required: true, message: '请选择DNS接口', trigger: 'change' },
                ]
            }),
        ])
    },
    submit: async (param: Ref<{ domain_name: string }>, validate: any, ref: Ref<any>) => {
        const load = message.load('正在添加域名，请稍后...')
        try {
            await validate()
            const res = await syncDnsDomain(param.value)
            console.log(res)
            if (res.status) {
                isRefreshDomainList.value = true
            }
            message[res.status ? 'success' : 'error'](res.msg)
            return res.status
        } catch (error) {
            console.log(error)
        } finally {
            load.close()
        }
    },
})

/**
 * @description 获取DNS列表
 */
 const getDnsDataList = async () => {
	const { data } = await getDnsData()
	const chekckObj = checkObjKey(data) // 检查对象是否存在，柯里化函数
	if (chekckObj('data')) {
		const { data: dns_list } = data
		tableList.value = dns_list
	}
}

const syncDomain = async (item: any) => {
    console.log(item, '111111')
    // eger.com
	return await useDataHandle({
		loading: '添加域名中...',
		request: syncDnsDomain(item),
		message: true,
		success: () => {
			isRefreshDomainList.value = true
		},
	})
}

onMounted(() => {
    getDnsDataList()
})

defineExpose({
	onConfirm: submit,
})
</script>

<style scoped></style>

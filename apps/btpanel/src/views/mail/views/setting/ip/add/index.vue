<template>
    <div class="py-[1.6rem] px-[3rem]" v-loading="isLoading">
        <BtForm />
    </div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools';
import { FormInput, FormItemCustom, FormSelect } from '@/hooks/tools/form/form-item';
import { formData, getFormRequestData, ipAddressList, bindDomainList, isLoading, resetFormData, getIpAddressType, addIpTagData, editIpTagData } from '../useMethod';

const props = defineProps({
    compData: {
        type: Object,
        default: () => ({})
    }
})

const { isEdit } = toRefs(props.compData)

const { BtForm, submit } = useForm({
    data: () => formData.value,
    options: (formDataRef: any) => {
        return computed(() => [
            FormInput('标签名', 'tag', {
                attrs: {
                    placeholder: '请输入标签名',
                    class: 'w-[30rem]',
                    disabled: isEdit.value,
                },
                rules: [
                    { required: true, message: '请输入标签名', trigger: 'blur' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: '标签名只能包含字母、数字和下划线', trigger: 'blur' },
                    { max: 10, message: '标签名最多10个字符', trigger: 'blur' }
                ],
            }),
            // 下拉选择
            FormSelect('IP地址', 'ip', ipAddressList.value, {
                attrs: {
                    placeholder: '请选择IP地址', class: '!w-[30rem]', onChange: (val: any) => {
                        formDataRef.value.ipv = getIpAddressType(val)
                    }
                },
                rules: [{ required: true, message: '请选择IP地址', trigger: 'blur' }]
            }),
            // FormInput('日志标识', 'syslog', {
            //     attrs: { placeholder: '请输入日志标识', class: 'w-[30rem]' },
            //     rules: [{ required: true, message: '请输入日志标识', trigger: 'blur' }]
            // }),
            FormItemCustom('HELO/EHLO', () => {
                return <div class="flex items-center">
                    <el-input v-model={formDataRef.value.helo} placeholder="请输入HELO/EHLO" class="!w-[30rem]" />
                    <ElTooltip content="用于HELO/EHLO的域名，绑定之后也可用于其它域名，不影响发送邮件" placement="top">
                        <span class="ml-8px bt-ico-ask">?</span>
                    </ElTooltip>
                </div>
            }, 'helo'),
            // FormSelect('绑定', 'binds', bindDomainList.value, {
            //     attrs: { placeholder: '请选择绑定域名', class: '!w-[30rem]', multiple: true }
            // }),
        ])
    },
    submit: async (formData: any, validate: any) => {
        await validate()
        if (isEdit.value) {
            return await editIpTagData(formData.value)
        } else {
            return await addIpTagData(formData.value)
        }
    }
})

const onConfirm = async () => {
    try {
        return await submit()
    } catch (error) {
        return false
    }
}

onMounted(() => {
    getFormRequestData()
})

onUnmounted(() => {
    resetFormData()
})

defineExpose({
    onConfirm
})

</script>

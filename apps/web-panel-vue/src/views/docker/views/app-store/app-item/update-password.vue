<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="ts">
import { getRandomChart } from '@/utils'
import { useForm,Message } from '@/hooks/tools'
import { FormInputPaw } from '@form/form-item'
import {updateDockerMysqlPassword} from '@/api/docker'

interface formDataProp {
	mysql_path: string,
	mysql_pwd: string,
	id: string,
}
interface Props {
	compData: {
		id: string
		path: string
		isInit: boolean
		service_name: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		id: '',
		path: '',
		isInit: false,
		service_name: '',
	}),
})


const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		mysql_path: `${props.compData.path}/${props.compData.service_name}`.replace(/\/+/g,'/'),
		mysql_pwd: '',
		id: props.compData.id,
	}),
	options: (formDataRef:Ref<formDataProp>) => {
		return ref([
		FormInputPaw('新密码', 'mysql_pwd', { 
				attrs: { class: '!w-[24rem]',placeholder: `请输入新密码` },
				rules: [
					{ required: true, message: '请输入新密码', trigger: ['blur'] }, 
					{ min: 8, message: '密码长度至少8位', trigger: ['blur'] },
					{ validator: (rule: any,value: string,callback:AnyFunction) => {
						if(/"|[\u4e00-\u9fa5]/.test(value)){
							callback(new Error('密码不能包含特殊字符'))
							return
						}
						callback()
					}, trigger: ['blur'] },
				],
			},
			() => {
				formDataRef.value.mysql_pwd = getRandomChart(16)
			}),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		const res = await updateDockerMysqlPassword({
			id: param.value.id,
			mysql_pwd: param.value.mysql_pwd,
			mysql_path: param.value.mysql_path,
		})
		Message.request(res)
		if(res.status){
			popupClose()
		}
	},
})
defineExpose({
	onConfirm:submit,
})
</script>
<style lang="css" scoped>
</style>

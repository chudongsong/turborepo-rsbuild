<template>
	<div class="px-[20px] pt-[20px]">
		<el-form :model="editForm" :rules="rules" ref="editFormRef">
			<el-form-item label="数据库账号">
				<div class="flex items-center mb-[4px]">
					<el-form-item prop="datauser" label="">
						<bt-input placeholder="创建数据库账号" v-model="editForm.datauser" width="17rem"></bt-input>
					</el-form-item>
					<el-form-item prop="datapassword" label="" class="!mt-0">
						<bt-input class="ml-[8px]" width="16rem" placeholder="数据库密码" v-model="editForm.datapassword"></bt-input>
					</el-form-item>
				</div>
				<span class="text-tertiary text-small"> 创建站点的同时，为站点创建一个对应的数据库帐户，方便不同站点使用不同数据库。 </span>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import useWPLocalAddStore from '@/views/wordpress/view/local/add-wordpress/useStore'

const { addWordpressFormData } = storeToRefs(useWPLocalAddStore())

const props = withDefaults(
	defineProps<{
		compData: any
	}>(),
	{
		compData: {},
	}
)

const editForm = reactive({
	datauser: '',
	datapassword: '',
	type: 'MySQL',
	code: 'utf8mb4',
	version: '',
})

const rules = reactive({
	datauser: [
		{
			trigger: ['blur', 'change'],
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 0) {
					callback(new Error('名称不能为空！'))
				} else if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
					callback(new Error('名称只能包含字母、数字和下划线！'))
				} else if (value.length <= 3) {
					callback(new Error('名称长度错误，不能少于3个字符！'))
				} else if (value.length > 16) {
					callback(new Error('名称长度错误，不能大于16个字符！'))
				} else {
					callback()
				}
			},
		},
	],
	datapassword: [
		{
			trigger: ['blur', 'change'],
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 0) {
					callback(new Error('密码不能为空！'))
				} else {
					callback()
				}
			},
		},
	],
})

const editFormRef = ref()

const onConfirm = async (close: () => void) => {
	const valid = await editFormRef.value.validate().catch(() => false)
	if (!valid) return

	addWordpressFormData.value.datauser = editForm.datauser
	addWordpressFormData.value.datapassword = editForm.datapassword
	close()
}

onMounted(() => {
	editForm.datauser = props.compData.datauser
	editForm.datapassword = props.compData.datapassword
})

defineExpose({
	onConfirm,
})
</script>

<style lang="scss" scoped></style>

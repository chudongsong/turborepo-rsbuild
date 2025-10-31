<template>
	<div class="p-[1.6rem]">
		<el-form class="m-[1.6rem]" ref="permissionForm" :model="ruleForm" label-width="5rem">
			<el-form-item label="访问权限" prop="permission">
				<el-select v-model="ruleForm.permission" class="!w-[32rem]" multiple placeholder="请选择">
					<el-option label="数据库所有者" value="dbOwner"></el-option>
					<el-option label="读取数据" value="read"></el-option>
					<el-option label="读取和写入数据" value="readWrite"></el-option>
					<el-option label="用户管理员" value="userAdmin"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { getModulePermission, setModulePermission } from '@api/database'
import { Message, useHandleError, useDataHandle } from '@hooks/tools'

interface Props {
	compData?: {
		name: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		name: '',
	}),
})

// 修改权限表单数据
const ruleForm = reactive({
	permission: [],
})

/**
 * @description 提交修改权限
 * @param close 关闭弹窗
 */
const onConfirm = async (close: AnyFunction) => {
	try {
		await useDataHandle({
			loading: '正在修改权限，请稍后...',
			request: setModulePermission(
				{
					data: JSON.stringify({
						user_name: props.compData.name,
						db_permission: ruleForm.permission,
					}),
				},
				'mongodb'
			),
			message: true,
		})
		close()
	} catch (error) {
		useHandleError(error, '修改权限-onConfirm')
	}
}

/**
 * @description 获取权限
 */
const init = async () => {
	const res: any = await useDataHandle({
		loading: '正在获取权限，请稍后...',
		request: getModulePermission({ data: JSON.stringify({ user_name: props.compData.name }) }, 'mongodb'),
		data: {
			status: Boolean,
			msg: String,
			data: Object,
		},
	})
	ruleForm.permission = res.roles
	if (!res.status) Message.error(res.msg)
}

onMounted(init)

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.el-select .el-select__wrapper) {
	height: auto !important;
}
</style>

<template>
	<div class="p-[20px] max-h-[50rem] overflow-auto">
		<el-form :model="ruleForm" ref="insertDataForm" :rules="rules" @submit.native.prevent>
			<template v-for="(item, index) in compData.keys">
				<template v-if="item.pk !== 1">
					<el-form-item :label="item.name" :prop="item.name" :key="index">
						<!-- item.type === 'integer' && item.name != 'db_password' ? 'number' :  -->
						<bt-input :type="'text'" v-model="ruleForm[item.name]" name="item.name" width="28rem" />
					</el-form-item>
				</template>
			</template>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import { useDataHandle } from '@hooks/tools'
import { updateTableData, createTableData } from '@/api/database'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {
		keys: [],
		row: {},
		path: '',
		table: '',
		refresh: () => {},
	},
})

const insertDataForm = ref()
const ruleForm = ref<any>({}) //添加表单数据

watch(
	() => props.compData.keys,
	() => {
		props.compData.keys?.forEach((item: any) => {
			ruleForm.value[item.name] = props.compData.row ? props.compData.row[item.name] : ''
		})
	},
	{ immediate: true }
)

const rules = {
	path: [{ required: true, message: '请选择数据库文件', trigger: ['blur', 'change'] }],
} // 表单校验规则

/**
 * @description 增加数据库表单提交方法
 */
const onConfirm = async (close: AnyFunction) => {
	await insertDataForm.value.validate()
	let param: any = {
		path: props.compData.path,
		table: props.compData.table,
		new_data: ruleForm.value,
		where_data: props.compData.row,
	}
	const isEdit = props.compData.row
	if (!isEdit) delete param.where_data
	param = JSON.stringify(param)
	await useDataHandle({
		loading: '正在提交，请稍后...',
		request: isEdit ? updateTableData({ data: param }) : createTableData({ data: param }),
		message: true,
	})
	close()
	props.compData.refresh()
}

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
</style>

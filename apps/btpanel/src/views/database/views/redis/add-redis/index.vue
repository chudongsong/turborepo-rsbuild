<template>
	<div class="p-[20px]">
		<el-form label-position="right" label-width="80px" :model="addForm" ref="redisFormRef" :rules="rules">
			<el-form-item label="数据库" prop="db_idx">
				<!-- :disabled="compData.val ? true : false" -->
				<el-select class="!w-[24rem]" v-model="addForm.db_idx" :disabled="compData.row">
					<el-option v-for="(item, index) in keyList" :key="index" :label="item.name" :value="item.id"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="键" prop="name">
				<bt-input width="24rem" placeholder="请输入键名" v-model="addForm.name" :disabled="compData.row"></bt-input>
			</el-form-item>

			<el-form-item label="值" prop="val">
				<bt-input width="24rem" placeholder="请输入值" v-model="addForm.val" :rows="6" type="textarea"></bt-input>
			</el-form-item>

			<el-form-item label="有效期">
				<bt-input width="24rem" placeholder="为空则永不过期" v-model="addForm.endtime" text-type="秒" :min="0" type="number"></bt-input>
			</el-form-item>
		</el-form>

		<ul class="mt-[20px] leading-8 text-small list-disc ml-[36px]">
			<li>有效期为0表示永久</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import type { KeyItem } from '@database/types'

import { setRedisValue } from '@/api/database'
import { useDataHandle } from '@hooks/tools'
import { getDatabaseStore } from '@database/useStore'

interface Props {
	compData?: {
		refresh: Array<KeyItem>
		sid?: number
		row?: any
		keyId: number
	}
}

const { refreshTableList } = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		options: [],
		sid: 0,
	}),
})

const redisFormRef = ref() // 表单ref
const keyList = ref() // 数据库列表
const addForm = ref({
	db_idx: Number(props.compData.keyId), // 数据库id
	name: '', // 键名
	val: '', // 值
	endtime: '' as any, // 有效期
}) // 添加容器表单数据

const rules = {
	db_idx: [{ required: true, message: '请选择数据库', trigger: 'change' }],
	name: [{ required: true, message: '请输入键', trigger: ['blur', 'input'] }],
	val: [{ required: true, message: '请输入值', trigger: ['blur', 'input'] }],
}

/**
 * @description 添加redis数据
 */
const onConfirm = async (close: any) => {
	await redisFormRef.value.validate()
	let params: any = { ...addForm.value, sid: props.compData.sid }
	if (!addForm.value.endtime || addForm.value.endtime === '0') delete params.endtime
	await useDataHandle({
		loading: `正在${props.compData.row ? '编辑' : '添加'}数据库，请稍后...`,
		request: setRedisValue({ data: JSON.stringify(params) }),
		message: true,
	})
	refreshTableList()
	close()
}

onMounted(async () => {
	keyList.value = await props.compData?.refresh()
	if (props.compData.row) {
		addForm.value = props.compData.row
	}
})

defineExpose({ onConfirm })
</script>

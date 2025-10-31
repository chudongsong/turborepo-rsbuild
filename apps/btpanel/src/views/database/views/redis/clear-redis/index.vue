<template>
	<div class="p-20px">
		<el-form>
			<el-form-item label="选择数据库">
				<div class="border border-light p-16px w-[22rem] max-h-[20rem] overflow-auto">
					<el-checkbox-group v-model="checkedList" v-if="keyList.length">
						<el-checkbox class="w-full !mr-0" :label="item.name" :key="index" v-for="(item, index) in keyList"></el-checkbox>
					</el-checkbox-group>
					<span v-else class="text-tertiary-50 text-small">暂无数据</span>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { clearRedisDb } from '@api/database'

import { KeyItem } from '@database/types'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { getDatabaseStore } from '@/views/database/useStore'

interface Props {
	compData: {
		sid: number
		keyList: KeyItem[]
	}
}

const {
	refs: { isRefreshTable },
} = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({ keyList: [], sid: 0 }),
})

const keyList = useVModel(props.compData, 'keyList')
const sid = useVModel(props.compData, 'sid')
const checkedList = ref() // 选中的数据库列表

const onConfirm = async (close: AnyFunction) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '提示',
		content: '此操作将清空选中的数据库, 是否继续?',
	})
	// 处理选中的数据值checkedList，与tableParam.keyList比对提取出每项的id
	const id_list = JSON.stringify(keyList.value.filter((item: any) => checkedList.value.includes(item.name)).map((item: any) => item.id))
	await useDataHandle({
		loading: '正在清空，请稍后...',
		request: clearRedisDb({ data: JSON.stringify({ ids: id_list, sid: sid.value }) }),
		message: true,
		success: (res: any) => {
			if (res.status) isRefreshTable.value = true
		},
	})

	close()
}

defineExpose({ onConfirm })

onMounted(() => {
	checkedList.value = keyList.value.map((item: any) => item.name)
})
</script>

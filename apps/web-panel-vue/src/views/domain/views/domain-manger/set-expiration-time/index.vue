<template>
	<div class="p-[2rem] flex items-center w-full">到期时间：<el-date-picker v-model="dateValue" class="!w-[33rem]" :disabled-date="disabledDate" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD" placeholder="选择日期"> </el-date-picker></div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { setDomainEndTime } from '@api/ssl'
import { getSslStore } from '@ssl/useStore'
import { useDialog } from '@/hooks/tools'

const MessageMethod = useMessage()

const {
	refs: { isRefreshDomainList },
} = getSslStore()

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const dateValue = ref(props.compData.row.endtime || '') // 日期

const disabledDate = (time: Date) => {
	return time.getTime() < Date.now()
}

const onConfirm = async (close?: any) => {
	if (!dateValue.value) {
		MessageMethod.error('请选择到期时间')
		return false
	}
	let load
	let resultArr
	try {
		load = MessageMethod.load('正在设置到期时间,请稍后...')
		let ids: any = [props.compData.row.id]
		if (props.compData?.rowList && props.compData.rowList.length) {
			// 批量设置
			ids = props.compData.rowList.map((item: any) => item.id)
		}
		const ress = await setDomainEndTime({
			ids: JSON.stringify(ids),
			endtime: dateValue.value,
		})
		MessageMethod.request(ress)
		if (ress.status) {
			isRefreshDomainList.value = true
			dateValue.value = ''
			close && close()
		}
		resultArr = props.compData.rowList.map((item: any) => {
			return {
				name: item.domain,
				status: true,
			}
		})
		useDialog({
			isAsync: true,
			title: '批量设置结果',
			area: 42,
			component: () => import('@/components/extension/bt-result/index.vue'),
			compData: {
				resultData: resultArr,
				resultTitle: '设置结果',
			},
		})
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

defineExpose({
	onConfirm,
})

onMounted(() => {
	if (props.compData.row.endtime === 0) {
		dateValue.value = ''
	}
})
</script>

<style lang="css" scoped>
:deep(.el-input--small input.el-input__inner) {
	padding-left: 2.8rem !important;
}
</style>

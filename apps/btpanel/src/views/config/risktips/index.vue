<template>
	<div class="p-[2rem]">
		<div class="flex text-extraLarge items-center">
			<i class="svgtofont-el-warning-filled text-warning !text-iconLarge pr-4"></i>
			<p class="">{{ compData.title || '风险操作,此功能不懂请勿开启!' }}</p>
		</div>
		<ul class="my-[2rem] py-[1.5rem] pl-32px list-disc bg-light">
			<li class="h-[2.4rem]" v-for="(item, index) in compData.content" :key="index" v-html="item"></li>
		</ul>
		<div class="overflow-hidden py-12px text-center" v-if="compData.isShowAppCode">
			<div class="mt-4px">Android/IOS应用 扫码下载</div>
			<div class="flex justify-center">
				<bt-image :src="'other/bt_app.png'" class="block w-[12rem] h-[12rem]" />
			</div>
		</div>

		<el-popover :visible="show" popper-class="popper-danger" width="160" placement="top-start" content="请勾选，已了解风险选项">
			<template #reference>
				<el-checkbox v-model="checked" class="mt-12px px-16px">
					<div class="text-small">
						<span v-if="compData.checkTip" v-html="compData.checkTip"></span>
						<span v-else>我已了解详情,并愿意承担风险！</span>
					</div>
				</el-checkbox>
			</template>
		</el-popover>
	</div>
	<!-- <div class="flex flex-wrap items-center">
		<el-popover
			v-model="show"
			trigger="manual"
			popper-class="risk-popper"
			placement="top-start"
			content="请勾选，已了解风险选项">
			<template #reference>
				<el-checkbox v-model="checked" class="ml-4px"></el-checkbox>
			</template>
		</el-popover>
		<span class="pl-8px flex-1 cursor-pointer" @click="checked = !checked">
			<slot name="content"></slot>
		</span>
	</div> -->
</template>

<script lang="ts" setup>
import type { RiskConfig } from '@config/types'

interface Props {
	compData: RiskConfig
}

const props = defineProps<Props>()

const show = ref(false)
const checked = ref(false)

// 验证
const validate = () => {
	return new Promise((resolve, reject) => {
		if (checked.value) {
			resolve(true)
		} else {
			show.value = true
			closePopover()
			return false
		}
	})
}

// 关闭提示防抖
const closePopover = useDebounceFn(() => {
	show.value = false
}, 2500)

const onConfirm = async (close: any) => {
	if (!checked.value) {
		show.value = true
		closePopover()
		return
	}
	await props.compData.onConfirm()
	close()
}

/**
 * @description 取消
 */
const onCancel = (close: any) => {
	close()
	props.compData.onCancel && props.compData.onCancel()
}

defineExpose({ onConfirm, onCancel })
</script>

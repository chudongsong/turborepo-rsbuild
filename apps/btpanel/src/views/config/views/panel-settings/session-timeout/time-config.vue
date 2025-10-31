<template>
	<div class="p-20px">
		<el-form>
			<el-form-item label="超时时间">
				<div class="flex items-center">
					<bt-select v-model="timeType" :options="options" class="!w-[14rem]" @change="onChangeEvent"></bt-select>
					<div v-show="timeType == '自定义'" class="ml-10px flex items-center">
						<bt-input-number class="!w-[10rem]" v-model="form.time" controls-position="right" :min="5" :step="1" @keyup.native="onKeyEvent($event)"></bt-input-number>
						<span class="ml-10px inline-block">分钟</span>
					</div>
				</div>
			</el-form-item>
		</el-form>
		<div class="mt-20px text-danger">注意：超时时间超过一天可能存在安全风险。</div>
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'

const {
	refs: { panelConfig },
	saveConfig,
} = getConfigStore()

const timeType = ref()
const form = reactive({ time: 5 })

const options = ref([
	{ num: 43200, label: '12小时', value: '12小时' },
	{ num: 86400, label: '24小时', value: '24小时' },
	{ num: 259200, label: '72小时', value: '72小时' },
	{ num: 604800, label: '7天', value: '7天' },
	{ num: 2592000, label: '30天', value: '30天' },
	{ num: 0, label: '自定义', value: '自定义' },
])

/**
 * @description 选择事件
 */
const onChangeEvent = (val: string) => {
	timeType.value = val
	if (val === '自定义') {
		form.time = 5
	} else {
		// options中获取对应的值
		const obj = options.value.find((item: any) => item.label === val) || { num: 86400 }
		form.time = Number(obj.num) / 60
	}
}

/**@description 判断是否为常规时间
 * @param val
 */
const isRoutineTime = (val: string) => {
	// 获取options中的title且排除自定义
	const arr = options.value.filter((item: any) => item.label !== '自定义').map((item: any) => item.label)
	return arr.includes(val)
}

/**
 * @description: 输入事件
 * @param e
 */
const onKeyEvent = (e: any) => {
	var keyNum = window.event ? e.keyCode : e.which //获取键盘码
	if ([189, 190, 109, 110].includes(keyNum)) {
		e.target.value = ''
	}
}

/**
 * @description: 确认事件
 * @param close
 */
const onConfirm = async (close: () => void) => {
	let _time: any = 0
	if (timeType.value === '自定义') {
		_time = form.time * 60
	} else {
		_time = options.value.find((item: any) => item.label === timeType.value)?.num
	}
	await saveConfig('正在设置超时时间，请稍候...', { session_timeout: _time })
	close()
}

onMounted(() => {
	if (isRoutineTime(panelConfig.value.session_timeout)) {
		timeType.value = panelConfig.value.session_timeout
	} else {
		timeType.value = '自定义'
		form.time = panelConfig.value.session_timeout_source / 60
	}
})

defineExpose({ onConfirm })
</script>

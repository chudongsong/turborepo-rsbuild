<template>
	<div class="mr-[10px]">
		<div class="flex items-center">
			<el-button class="h-[3.2rem] refresh-btn" @click="onClickRefresh">
				<div class="flex items-center">
					<el-progress v-if="refreshData.status" class="mr-8px" :width="22" :show-text="true" :stroke-width="1" type="circle" color="var(--el-color-primary)" :text-color="'var(--el-color-primary)'" :percentage="percentage">
						<template #default>
							<span class="text-primary">{{ Number(realRefreshTime) }}</span>
						</template>
					</el-progress>
					<span>刷新日志</span>
				</div>
			</el-button>

			<el-popover placement="bottom-start" width="280" trigger="click" popper-class="el-tooltip-white" @hide="popoverHideEvent">
				<div class="flex flex-col text-secondary p-12px">
					<div class="flex items-center">
						<span class="mr-4px">定时刷新</span>
						<el-switch v-model="refreshData.status" @change="handleChangeTimeRefresh" />
					</div>
					<div v-show="refreshData.status" class="flex items-center mt-[8px] w-full">
						<span class="mr-4px flex-nowrap">时间间隔</span>
						<bt-input v-model="refreshData.time" text-type="秒" :min="1" type="number" class="!w-[10rem]"></bt-input>
						<el-button class="!ml-4px" type="primary" @click="saveRefresh">保存</el-button>
					</div>
				</div>
				<template #reference>
					<el-button class="down-button !ml-0" @click="visible = !visible">
						<i class="svgtofont-el-arrow-down"></i>
					</el-button>
				</template>
			</el-popover>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'

interface Props {
	refreshFn: () => void
	sessionConfig?: {
		time: number
		status: boolean
	} // 使用session配置
}

const props = withDefaults(defineProps<Props>(), {
	refreshFn: () => ({}),
	sessionConfig: () => {},
})
// 消息提示
const Message = useMessage()

// 定义emit
const emit = defineEmits(['save'])

// 是否显示下拉框
const visible = ref(false)

const sessionConfig = ref() // 使用session配置

const isInit = ref(true) // 是否初始化

// 定时器配置
const refreshPercentTimer = ref(0) // 定时刷新百分比 定时器
const percentage = ref(100) // 时间百分比
const realRefreshTime = ref(5) // 实时刷新时间间隔-实时展示数字
const timeSave = ref(5) // 保存时间-存档-避免变化输入框值时错乱

const refreshData = reactive({
	status: false, // 是否开启定时刷新
	time: 5, // 刷新时间间隔-输入框
	timer: 0, // 定时器
})
let isDestroy = false // 是否销毁

/**
 * @description 定时刷新
 * @param {boolean} val 是否开启
 */
const handleChangeTimeRefresh = async (val: boolean) => {
	refreshData.status = val
	refreshData.time = timeSave.value
	if (!refreshData.time || refreshData.time < 1) {
		refreshData.time = 5
		timeSave.value = 5
	}
	// 设置定时器
	if (val) {
		// 设置请求刷新定时器
		refreshData.timer = setInterval(() => {
			if (isDestroy) return
			props.refreshFn()
		}, timeSave.value * 1000)
		// 设置百分比显示定时器，每1s刷新一次
		refreshPercentTimer.value = setInterval(() => {
			if (isDestroy) return
			realRefreshTime.value--
			if (realRefreshTime.value === 0) realRefreshTime.value = timeSave.value // 读取存档值
			percentage.value = (realRefreshTime.value / timeSave.value) * 100
		}, 1000)
	} else {
		clearInterval(refreshData.timer)
		clearInterval(refreshPercentTimer.value)
		realRefreshTime.value = timeSave.value // 读取存档值
		percentage.value = 100
		if (!isInit.value) Message.success('关闭成功')
	}
	emit('save', refreshData)
}

/**
 * @description 保存-定时刷新
 */
const saveRefresh = async () => {
	if (refreshData.time < 1 || !Number.isInteger(parseFloat(refreshData.time.toString())) || refreshData.time > 99) {
		Message.error('时间间隔须在范围1~99秒内的整数')
		return
	}
	realRefreshTime.value = refreshData.time
	timeSave.value = refreshData.time
	Message.success('保存成功')
	clearInterval(refreshData.timer)
	clearInterval(refreshPercentTimer.value)
	handleChangeTimeRefresh(true)
	emit('save', refreshData)
}

/**
 * @description 刷新
 */
const onClickRefresh = async () => {
	await props.refreshFn()
	Message.success('刷新成功')
}

/**
 * @description 隐藏弹框
 */
const popoverHideEvent = () => {
	visible.value = false
	refreshData.time = timeSave.value // 读取存档值
}

watch(
	() => props.sessionConfig,
	form => {
		sessionConfig.value = form
		if (form?.time) {
			if (isInit.value) {
				// 存在本地配置，则进入便设置状态+时间
				timeSave.value = form.time
				realRefreshTime.value = form.time
				handleChangeTimeRefresh(form.status)
				isInit.value = false
			}
		}
	},
	{ deep: true }
)

const clearIntervalFn = () => {
	clearInterval(refreshData.timer)
	clearInterval(refreshPercentTimer.value)
}

onUnmounted(() => {
	// 销毁
	isDestroy = true
	clearIntervalFn()
})

defineExpose({ clearIntervalFn })
</script>

<style lang="css" scoped>
.down-button {
	height: 3.2rem;
	border-left: none !important;
	border-top-left-radius: 0 !important;
	border-bottom-left-radius: 0 !important;
}

:deep(.el-progress .el-progress__text) {
	font-size: var(--el-font-size-small) !important;
	min-width: 18px !important;
}

:deep(.el-input-group__append) {
	padding: 0 10px;
}

.refresh-btn {
	padding: 0px 12px;
	border-top-right-radius: 0 !important;
	border-bottom-right-radius: 0 !important;
}
</style>

<template>
	<div class="p-[2rem]">
		<div>
			<el-descriptions title="项目组信息" border :column="3" class="table-descriptions">
				<!-- <el-descriptions-item label="当前状态">{{ javaGroupData?.msg }}</el-descriptions-item> -->
				<el-descriptions-item label="总项目数">{{ javaGroupData?.running_data?.length > -1 ? javaGroupData?.running_data?.length : '--' }}</el-descriptions-item>
				<el-descriptions-item label="未执行的项目数">{{ javaGroupData?.running_data?.remaining > -1 ? javaGroupData?.running_data?.remaining : '--' }}</el-descriptions-item>
				<el-descriptions-item label="正在执行中的项目数">{{ javaGroupData?.running_data?.executing > -1 ? javaGroupData?.running_data?.executing : '--' }}</el-descriptions-item>
				<el-descriptions-item label="当前执行步骤">{{ getMsg }}</el-descriptions-item>
			</el-descriptions>
		</div>
		<div class="text-medium text-secondary mb-[2rem] mt-[1.6rem] font-bold flex justify-between">
			项目日志
			<el-button v-show="!complate && !notLog" type="default" @click="getLogsInfo(defaultActive)">刷新</el-button>
		</div>
		<bt-tabs v-show="!notLog" class="h-[30rem]" type="card" v-model="defaultActive" @tab-click="getLogsInfo(defaultActive)">
			<el-tab-pane v-for="project in projectList" :key="project" :label="project" :name="project">
				<bt-log
					:content="staticContent"
					:isHtml="true"
					class="mt-16x"
					:fullScreen="{
						title: `全屏查看【项目】日志`,
						onRefresh: () => getLogsInfo(defaultActive),
					}"
					:style="{ height: '48rem', width: '99.5%' }"></bt-log>
			</el-tab-pane>
		</bt-tabs>
		<span v-show="notLog" class="mt-[2rem]">暂无日志</span>
	</div>
</template>

<script setup lang="ts">
import { getProjectLogs } from '@/api/site'
import { javaGroupData } from './useController'
import { useMessage } from '@/hooks/tools'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

const close = inject('popupClose', () => {})
const defaultActive = ref('') // 菜单默认展开项
// let requestTime = 0 // 请求时间
const projectList = computed(() => javaGroupData.value.running_step?.names || [])
const textLoading = ref(false) // 文本加载
const staticContent = ref('') // 静态内容
const notLog = computed(() => !projectList.value.length) // 没有日志
let complate = computed(() => {
	return !javaGroupData.value.running
}) // 是否执行完毕
watch(
	() => javaGroupData.value.running_step,
	(val: any) => {
		if (val) {
			defaultActive.value = projectList.value[0]
			getLogsInfo(defaultActive.value)
		}
	},
	{ immediate: true }
)

watch(complate, val => {
	if (val) {
		Message.success('项目组已经执行完毕')
		close()
	}
})

// 获取当前执行步骤
const getMsg = computed(() => {
	return javaGroupData.value.running_step?.msg || javaGroupData.value.running_data?.msg || javaGroupData.value.msg || '--'
})
/**
 * @description 获取项目日志
 * @param {String} name 项目名称
 */
const getLogsInfo = async (name: string) => {
	textLoading.value = true
	try {
		const res = await getProjectLogs(
			{
				data: JSON.stringify({ project_name: name }),
			},
			'java'
		)
		if (res.status) {
			staticContent.value = res.data.data
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
	} finally {
		textLoading.value = false
	}
}
// /**
//  * @description 获取项目组信息
//  */
// const getInfo = async (type: string) => {
// 	try {
// 		const res = await getGroupLog({
// 			group_id: props.compData.group_id,
// 			last_write_time: requestTime,
// 		})
// 		if (res.status) {
// 			// 判断是否执行完毕
// 			if (!res.data.running_step && type === 'first') {
// 				// 初次进入，直接关闭弹窗
// 				Message.error(res.data.msg)
// 				vm.$root.close()
// 				return
// 			} else if (!res.data.running_step) {
// 				// 刷新后执行完毕，取消刷新功能
// 				// complate.value = true
// 				Message.success('项目组已经执行完毕')
// 				return
// 			}
// 			javaGroupData.value = res.data
// 			requestTime = res.data.last_write_time
// 			if (type === 'first') {
// 				defaultActive.value = javaGroupData.value.running_step?.names[0]
// 			}
// 			if (!javaGroupData.value.running_step?.names.includes(defaultActive.value)) {
// 				defaultActive.value = javaGroupData.value.running_step?.names[0]
// 			}
// 			getLogsInfo(defaultActive.value)
// 		} else {
// 			Message.error(res.msg)
// 		}
// 	} catch (error) {}
// }

onMounted(() => {
	// getInfo('first')
})
</script>

<template>
	<div class="overflow-auto p-2rem" :style="`max-height:${isEdit ? 68 : 64}rem`">
		<el-form v-bt-loading="viewLoading" :model="javaAddForm" label-width="100px">
			<el-form-item v-if="!isEdit" label="项目类型">
				<div class="flex items-center">
					<bt-radio
						v-model="javaAddForm.radioType"
						type="button"
						:options="[
							{ label: 'SpringBoot', value: 'SpringBoot' },
							{ label: 'Tomcat项目', value: 'tomcat' },
							// { label: '内置项目', value: '内置项目' },
							// { label: '独立项目', value: '独立项目' },
						]"
						:disabled="isEdit"
						@change="initUserList" />
					<!-- <el-radio-group v-model="param.radioType" size="default" :disabled="isEdit">
						<el-radio-button value="SpringBoot">SpringBoot</el-radio-button>
						<el-radio-button value="内置项目">内置项目</el-radio-button>
						<el-radio-button value="独立项目">独立项目</el-radio-button>
					</el-radio-group> -->
					<div class="flex items-center ml-[12px]">
						<bt-link href="https://www.bt.cn/bbs/thread-76217-1-1.html">Java项目教程</bt-link>
						<i class="svgtofont-el-link text-primary text-medium ml-[4px]"></i>
					</div>
				</div>
			</el-form-item>
			<SpringBoot ref="SpringBootFormRef" v-show="javaAddForm.radioType == 'SpringBoot'" :isEdit="compData.isEdit" @closeEvent="compData.closeEvent" :projectData="projectData"></SpringBoot>

			<!-- <BuiltinProject v-show="javaAddForm.radioType == '内置项目'" ref="BuiltinProjectFormRef" :isEdit="compData.isEdit" :projectData="projectData"></BuiltinProject>

			<IndependentProject v-show="javaAddForm.radioType == '独立项目'" ref="IndependentProjectRef" :isEdit="compData.isEdit" :projectData="projectData"></IndependentProject> -->

			<TraditionalProject v-show="javaAddForm.radioType == 'tomcat'" ref="TraditionalProjectRef" :isEdit="compData.isEdit" :projectData="projectData"></TraditionalProject>
		</el-form>

		<bt-help :options="[{ content: '过往内置Tomcat项目、独立Tomcat项目的添加已经整合到Tomcat项目中' }]" class="ml-[40px] mt-[20px]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import SpringBoot from '@site/views/java-model/add-java/spring-boot.vue'
import TraditionalProject from '@site/views/java-model/add-java/traditional-project.vue'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import { getJavaInfo, getTomcat } from '@/api/site'
import { isEdit } from '../useController'
import { Message } from '@/hooks/tools'

interface Props {
	compData: {
		isEdit: boolean
		closeEvent?: AnyFunction
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isEdit: false,
	}),
})
const { siteInfo } = useSiteStore()
const { getRootUser } = SITE_STORE()

const SpringBootFormRef = ref<any>() // 表单ref
// const BuiltinProjectFormRef = ref<any>() // 表单ref
// const IndependentProjectRef = ref<any>() // 表单ref
const TraditionalProjectRef = ref<any>() // 表单ref

const projectData = reactive<any>({
	userList: [],
	jdk_info: [],
	tomcat_list: [],
}) // 项目数据

const javaAddForm = reactive<any>({
	radioType: 'SpringBoot',
})
const viewLoading = ref<boolean>(false) // 加载状态

/**
 * @description 获取系统信息
 */
const getSystemInfoEvent = async (refreshStr: string = '') => {
	try {
		const res = await getJavaInfo()
		projectData.jdk_info = res.data.jdk_info?.filter((item: any) => item.operation !== 0)
		// projectData.tomcat_list = []
		// res.data.tomcat_status?.forEach((item: any) => {
		// 	if (item.status) {
		// 		projectData.tomcat_list.push({
		// 			name: 'tomcat' + item.version,
		// 			version: item.version,
		// 			...item,
		// 		})
		// 	}
		// })
		const tomcatList = await getTomcat()
		Object.entries(tomcatList.data).forEach(([key, item]: [string, any]) => {
			if (item.status) {
				projectData.tomcat_list.push({
					...item,
					name: key,
					version: Number(item.version.split('.')[0]),
				})
			}
		})
		if (refreshStr) Message.success(`${refreshStr}，刷新成功`)
	} catch (error) {
		console.log(error)
	}
}

provide('getSystemInfoEvent', getSystemInfoEvent)

const initUserList = async () => {
	if (javaAddForm.radioType === 'tomcat') return
	const { data } = await getRootUser({ springboot: Number(javaAddForm.radioType === 'SpringBoot') })
	projectData.userList = data
}

/**
 * @description 初始化数据
 */
const initData = async () => {
	viewLoading.value = true
	await initUserList()
	await getSystemInfoEvent()
	viewLoading.value = false
	if (isEdit.value) {
		javaAddForm.radioType = siteInfo.value.project_config?.java_type === 'springboot' ? 'SpringBoot' : 'tomcat'
	}
}

const onConfirm = async (close: any) => {
	// 判定当不同type时，获取不同的调用方法
	let formRef = javaAddForm.radioType === 'SpringBoot' ? SpringBootFormRef.value : TraditionalProjectRef.value
	const res = await formRef.onConfirm(close)
	if (res) close && close()
}

onMounted(initData)

defineExpose({
	init: initData,
	onConfirm,
})
</script>

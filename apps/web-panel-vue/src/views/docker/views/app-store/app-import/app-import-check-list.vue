<template>
	<div class="app-import-check-list">
		<div class="flex items-center mb-2 text-small justify-between">
			<div>应用列表</div>
		</div>
		<div class="max-h-[32rem] overflow-auto pr-2">
			<div v-for="item in computedList" :key="item.appid" class="flex items-center p-[1rem] mb-4 rounded-xl bg-white border border-gray-200 transition-all w-full hover:border-[rgba(var(--el-color-primary-rgb),0.8)]">
				<div class="flex flex-col justify-center text-small leading-[1.2]">
					<div class="mb-3 font-bold">{{ item.apptitle }}</div>
					<div class="mb-2 text-gray-400 break-all leading-[1.5]">{{ item.appdesc }}</div>
					<div class="text-gray-400">版本：{{ item.appversion }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
interface AppItem {
	appid: string | number
	apptitle: string
	appdesc: string
	appversion: any[]
}

const props = defineProps<{
	list: AppItem[]
}>()
console.log('props.list', props.list)
// 适配原始接口数据为 AppItem[]
const computedList = computed<AppItem[]>(() => {
	return props.list.map(item => ({
		appid: item.appid,
		apptitle: item.apptitle,
		appdesc: item.appdesc,
		appversion: item.appversion[0].m_version || '',
	}))
})
</script>

<style scoped lang="scss">
.app-import-check-list {
	width: 100%;
}
</style>

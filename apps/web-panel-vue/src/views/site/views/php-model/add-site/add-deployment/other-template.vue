<template>
	<div class="flex h-[46rem]" v-bt-loading="loading">
		<div>
			<bt-tabs class="w-full !h-full" type="left-bg-card" v-model="defaultActive" :options="tabComponent" @change="handleTabClick" />
		</div>
		<div class="p-[20px] pl-0 grid grid-cols-2 gap-x-4 w-full h-[46rem] overflow-auto">
			<div v-for="item in contentList" :key="item.id" :class="{ 'template-focus': templateId === item.id }" class="mb-[8px] flex p-[20px] rounded-base h-[18rem] template-hover">
				<!-- <i class="el-icon-success text-iconLarge mr-[8px]"></i> -->
				<bt-image :src="`/site_dep_ico/${item.name.toLowerCase()}.png`" class="!max-h-[3.6rem] !max-w-[4rem] mr-[8px]"></bt-image>
				<div class="flex flex-col items-start leading-10 flex-1">
					<span class="text-medium mb-[4px]">{{ item.title }}</span>
					<span class="truncate inline-block w-[80%]"> 简介：<span v-html="item.ps"></span> </span>
					<span class="truncate inline-block w-[80%]"> 版本：{{ item.version }} </span>
					<span class="truncate inline-block w-[80%]"> 评分：{{ item.score }} </span>
					<div class="flex items-center flex-1">
						<span class="flex items-center flex-1">
							<div class="flex-1">官网：</div>
							<bt-link class="!truncate w-[10.6rem]" :href="item.official">{{ item.official }}</bt-link>
						</span>
						<el-button type="primary" class="!ml-[12px]" @click="selectTemplate(item)">选择模板</el-button>
					</div>
				</div>
			</div>
			<el-empty v-if="!contentList.length" description="暂无数据" class="w-200%"></el-empty>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const defaultActive = ref('') // 菜单默认展开项
const tabComponent = ref() // 菜单组件
const contentList = ref(props.compData.templateData.list) // 菜单列表
const templateId = ref(props.compData.templateId) // 模板id
const loading = ref(false) // 加载状态
const popupClose = inject<any>('popupClose') //     弹窗关闭

const handleTabClick = (name: any) => {
	if (name === 'all') {
		contentList.value = props.compData.templateData.list
	} else if (name === '') {
		contentList.value = props.compData.templateData.list.filter((item: any) => {
			return item.is_many === 0
		})
	} else {
		contentList.value = props.compData.templateData.list.filter((item: any) => {
			return String(item.type) === name
		})
	}
}

const selectTemplate = (item: any) => {
	templateId.value = item.id
	props.compData.selectTemplate(item.id)
	popupClose()
}

// watch(
// 	() => templateId.value,
// 	() => {
// 		console.log(templateId.value)
// 	},
// 	{ immediate: true }
// )

onMounted(() => {
	loading.value = true
	tabComponent.value = props.compData.templateData.dep_type.map((item: any) => {
		return {
			label: item.title,
			name: String(item.tid),
			lazy: true,
		}
	})
	tabComponent.value.unshift({
		label: '全部',
		name: 'all',
		lazy: true,
	})
	tabComponent.value.unshift({
		label: '精选推荐',
		name: '',
		lazy: true,
	})
	defaultActive.value = String(tabComponent.value[0].name)
	// 筛选精选推荐
	contentList.value = props.compData.templateData.list.filter((item: any) => {
		return item.is_many === 0
	})
	loading.value = false
})
</script>

<style lang="css" scoped>
.template-hover {
	box-shadow: 0px 8px 12px rgba(192, 192, 192, 0.25);
}
.template-hover:hover {
	background-color: var(--el-fill-color-light);
	cursor: pointer;
}
.template-focus {
	@apply border border-primary;
}
</style>

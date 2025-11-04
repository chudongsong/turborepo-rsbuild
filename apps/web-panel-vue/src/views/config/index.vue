<template>
	<BtRouterTabs>
		<template #right>
			<div v-if="showSearch" class="mr-1rem">
				<bt-input-search class="search !w-24rem" placeholder="搜索设置项" v-model="settingSearch"></bt-input-search>
			</div>
		</template>
	</BtRouterTabs>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRoute } from 'vue-router'
import { desiredNpsDialog } from '@/public/index'

const { getGlobalConfig } = getConfigStore()
const {
	refs: { settingSearch, openSSLPopup, openPortPopup },
} = getConfigStore()
const route = useRoute()

const { BtRouterTabs } = useRouterTabs()

const tabActive = computed(() => {
	return route.name as string
})

const showSearch = computed(() => {
	return tabActive.value === 'whole' || tabActive.value === 'panel' || tabActive.value === 'safe'
})

// 将搜索结果渲染逻辑提取为独立函数
const renderSearchResults = () => {
	nextTick(() => {
		// 获取带有 empty-search 类的所有节点
		const emptySearchNodes = document.querySelectorAll('.empty-search')

		// 遍历并移除这些节点
		emptySearchNodes.forEach(function (node) {
			node.parentNode?.removeChild(node)
		})
		// 获取所有搜索结果
		const row = document.querySelectorAll('.config-rows[style="display: flex;"]')
		if (row.length == 0) {
			// 搜索结果为空
			const empty = document.createElement('div')
			empty.className = 'empty-search flex items-center justify-center w-full py-[1.5rem]'
			empty.innerHTML = '暂无搜索结果，<span class="text-primary cursor-pointer NpsDialog">提交需求反馈</span>'
			const nps: NodeListOf<HTMLElement> = empty.querySelectorAll('.NpsDialog')
			nps.forEach((element: HTMLElement) => {
				element.addEventListener('click', function () {
					desiredNpsDialog({ name: '面板设置', type: 23, id: 30 })
				})
			})
			const result = document.querySelector('.router-tabs-content .search-results')

			result && result.appendChild(empty)
		}
	})
}

// 监听搜索值变化
watch(() => settingSearch.value, renderSearchResults, { immediate: true })

// 监听标签页切换
watch(
	() => tabActive.value,
	newValue => {
		if (newValue === 'whole' || newValue === 'panel' || newValue === 'safe' || newValue === 'ui') {
			settingSearch.value = ''
		}
	}
)

const initRoute = () => {
	const type = window.localStorage.getItem('config-dialog')
	switch (type) {
		case 'ssl':
			openSSLPopup.value = true
			break
		case 'port':
			openPortPopup.value = true
			break
	}
	if (type) {
		window.localStorage.removeItem('config-dialog')
	}
}

onMounted(async () => {
	settingSearch.value = ''
	await getGlobalConfig()
	initRoute()
})
// 离开
onUnmounted(() => {
	// 取消初始化请求
	useRequestCanceler(['/config?action=get_menu_list'])
})
</script>

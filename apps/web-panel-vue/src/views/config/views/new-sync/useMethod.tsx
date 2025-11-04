// 默认tab选中
export const defaultBackTab = ref('list')
export const isRefreshBackList = ref(false) // 是否刷新备份列表

// 详情数据
export const detailData = ref<any>({
	operateType: 'add',
})

export const changeBackTAb = (tab: string) => {
	defaultBackTab.value = tab
	if (tab === 'add') detailData.value.operateType = 'add'
}

<template>
	<div>
		<!-- <bt-install-mask v-if="!softData.setup" :options="{ name: 'mysql', title: 'Mysql本地服务器' }"></bt-install-mask> -->
		<bt-tabs ref="reinforceTab" class="w-full h-full" v-model="defaultActive" :options="tabrender" />
	</div>
</template>

<script setup lang="tsx">
import ReinforceBase from '@database/views/mysql/advanced-setting/reinforce/reinforce-base.vue'
import ReinforcePassword from '@database/views/mysql/advanced-setting/reinforce/reinforce-password.vue'
import ReinforceLimit from '@database/views/mysql/advanced-setting/reinforce/reinforce-limit.vue'

import { DATABASE_MYSQL_ADVANCED_REINFORCE_STORE } from './useStore'
import { getDatabaseStore } from '@database/useStore'

const store = DATABASE_MYSQL_ADVANCED_REINFORCE_STORE()
const { resetData } = store
const {
	refs: { softData },
} = getDatabaseStore()

interface Props {
	compData: string
}
const props = withDefaults(defineProps<Props>(), {
	compData: 'base',
})

const reinforceTab = ref()

const defaultActive = ref(props.compData || 'base') // 菜单默认展开项

const tabrender = [
	{
		label: '基础设置',
		name: 'base',
		render: () => <ReinforceBase />,
	},
	{
		label: '密码复杂度',
		name: 'password',
		render: () => <ReinforcePassword />,
	},
	{
		label: '限制登录',
		name: 'limit',
		render: () => <ReinforceLimit />,
	},
]

// 刷新当前tab
const refreshTab = () => {
	const currentRef = reinforceTab.value?.getRef() || null
	if (currentRef) {
		currentRef[defaultActive.value].init()
	}
}
onUnmounted(() => {
	resetData()
})
defineExpose({
	init: refreshTab,
})
</script>

<style scoped></style>

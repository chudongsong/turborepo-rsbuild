<template>
	<div>
		<el-select v-model="type" @change="changeType" class="mr-[.8rem] !w-[12rem]">
			<div class="max-h-[20rem] overflow-auto" :class="{ 'no-hover': hovering }">
				<el-option v-for="(item, index) in typeList" :key="index" :label="item.name" :value="item.id">
					<span class="max-w-[200px] truncate" :title="item.name" style="float: left">{{ item.name }}</span>
				</el-option>
			</div>
			<div @click="openClassSettingDialog()" @mouseover="hovering = true" @mouseout="hovering = false" class="classify-item">分类设置</div>
		</el-select>
	</div>
</template>

<script setup lang="ts">
import { getSslStore } from '@ssl/useStore'
import { getDomainType, getCertGroup } from '@api/ssl'
import { checkVariable } from '@utils/check'
import { useDialog } from '@hooks/tools/dialog'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const {
	refs: { domainParams, tabActive, isRefreshDomainOrCertType, typeList, isRefreshDomainList, certificateParams },
} = getSslStore()

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const hovering = ref(false) // 分类设置hover
const type = ref(tabActive.value === 'domain' ? domainParams.value.type : certificateParams.value.type) // 分类设置hover

// 刷新事件
const refreshEvent = (query: string, isRefresh?: boolean) => {
	switch (tabActive.value) {
		case 'domain':
			domainParams.value.type = query
			isRefresh && (isRefreshDomainList.value = true)
			break
		case 'certificate':
			certificateParams.value.type = query
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			isRefresh && refreshMap[activeTabs.value as keyof typeof refreshMap]?.()

			break
	}
}

const getDataType = async () => {
	let data: any[] = []
	let idKey: string = ''

	switch (tabActive.value) {
		case 'domain':
			const { data: domainData } = await getDomainType()
			data = domainData
			idKey = 'type_id'
			break
		case 'certificate':
			const { data: certData } = await getCertGroup()
			data = certData
			idKey = 'group_id'
			break
	}

	typeList.value = checkVariable(data, 'array', []).map((item: any) => ({
		name: item.name,
		id: item[idKey],
	}))

	if (typeList.value[0]?.id !== '-1') {
		typeList.value.unshift({ id: '-1', name: '全部分组' })
	}
}

// 域名、证书分类弹窗
const classSettingDialog = (typeList: any, type?: string) =>
	useDialog({
		isAsync: true,
		title: `${type === 'domain' ? '域名' : '证书'}分类管理`,
		area: 50,
		component: () => import('@ssl/public/group-search/group/set-type/index.vue'),
		compData: {
			typeList,
		},
	})

const openClassSettingDialog = () => {
	classSettingDialog(typeList.value, tabActive.value)
}

const changeType = (val: string) => {
	refreshEvent(val, true)
}

watch(isRefreshDomainOrCertType, val => {
	if (val) {
		getDataType()
		isRefreshDomainOrCertType.value = false
	}
})

onMounted(() => {
	getDataType()
})

provide('typeList', typeList)
</script>

<style lang="css" scoped>
.classify-item {
	@apply px-2rem border-top-[0.1rem] border-[rgb(228,231,237)] leading-[3.2rem] cursor-pointer;
}
.classify-item:hover {
	@apply bg-[#F5F7FA];
}
.no-hover :deep(.el-select-dropdown__item .no-hover.hover),
.no-hover .el-select-dropdown__item :hover {
	background-color: transparent !important;
}
</style>

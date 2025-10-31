<template>
	<div>
		<config-rows label="User-Agent限制">
			<template #value>
				<el-switch v-model="safeConfig.uaAstrict" @change="onChange(safeConfig.uaAstrict)"></el-switch>
				<el-button size="small" class="!ml-12px" @click="uaPopup = true">User-Agent限制配置</el-button>
			</template>
			<template #desc>
				<span>设置限制访问User-Agent</span>
			</template>
		</config-rows>

		<bt-dialog v-model="uaPopup" :area="70" title="User-Agent限制配置">
			<div class="px-[2rem]">
				<bt-table-group class="py-20px">
					<template #header-left>
						<el-button @click="addUaPopup = true" type="primary">添加User-Agent</el-button>
					</template>
					<template #content>
						<bt-table ref="uaTable" :column="tableColumn" :data="uaList" :description="'User-Agent列表为空'" v-bt-loading="uaLoading" :max-height="400" v-bt-loading:title="'正在加载User-Agent列表，请稍后...'" />
					</template>
				</bt-table-group>
			</div>
		</bt-dialog>
		<bt-dialog v-model="addUaPopup" :area="50" :title="(isEditID ? '编辑' : '添加') + 'User-Agent'" showFooter @confirm="setUaEvent">
			<div class="p-[2rem]">
				<el-form ref="uaFormRef" :model="uaValue" label-position="left">
					<el-form-item label="User-Agent" prop="name">
						<bt-input v-model="uaValue" type="textarea" width="32rem" :rows="4"></bt-input>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="tsx" setup>
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { modifyLimitUa, getLimitUa, delLimitUa, addLimitUa } from '@/api/config'
import { useOperate } from '@hooks/tools/table/column'

import ConfigRows from '@config/public/config-rows-new'
import { Message } from '@hooks/tools'

const {
	refs: { safeConfig },
} = getConfigStore()

const uaPopup = ref(false) // UA弹窗
const uaLoading = ref(false) // UA列表加载状态
const uaList = ref<any>([]) // UA列表

const addUaPopup = ref(false) // 添加UA弹窗
const uaValue = ref()
const isEditID = ref(false) // 是否编辑UA

/**
 * @description: 开启或关闭User-Agent限制按钮开关
 */
const onChange = async (val: boolean) => {
	await useDataHandle({
		loading: '正在设置，请稍候...',
		request: modifyLimitUa({ status: val ? 1 : 0 }),
		message: true,
		success: (res: any) => {
			if (!res.status && res.msg === '请先添加ua后再开启！') {
				uaPopup.value = true
			}
		},
	})
	getLimitUaInfo()
}

/**
 * @description: 获取User-Agent限制信息
 */
const getLimitUaInfo = async () => {
	await useDataHandle({
		request: getLimitUa(),
		success: ({ data: res }: any) => {
			const { status, ua_list } = res.msg || res
			safeConfig.value.uaAstrict = Number(status) === 1
			uaList.value = ua_list
		},
	})
}

/**
 * @description: 删除User-Agent
 */
const deleteRow = async (data: any) => {
	await useDataHandle({
		loading: '正在删除，请稍候...',
		request: delLimitUa({ id: data.id }),
		message: true,
	})
	getLimitUaInfo()
}

/**
 * @description: 添加User-Agent
 */
const setUaEvent = async () => {
	if (!uaValue.value) return Message.error('请输入User-Agent')
	await useDataHandle({
		loading: '正在设置，请稍候...',
		request: isEditID.value ? modifyLimitUa({ new_name: uaValue.value, id: isEditID.value }) : addLimitUa({ ua_list: uaValue.value }),
		message: true,
	})
	getLimitUaInfo()
	isEditID.value = false
	uaValue.value = ''
	addUaPopup.value = false
}

const tableColumn = [
	{ label: 'User-Agent', prop: 'name' },
	useOperate([
		{
			onClick: (row: any) => {
				isEditID.value = row.id
				uaValue.value = row.name
				addUaPopup.value = true
			},
			title: '编辑',
		},
		{
			onClick: (row: any) => deleteRow(row),
			title: '删除',
		},
	]),
]

onMounted(() => getLimitUaInfo())
</script>

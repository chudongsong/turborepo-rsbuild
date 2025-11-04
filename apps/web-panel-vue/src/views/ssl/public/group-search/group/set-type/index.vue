<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addClass">添加分类</el-button>
			</template>
			<template #content>
				<bt-table :column="tableColumns" max-height="250" :data="typeList" v-bt-loading="tableLoading" />
			</template>
			<template #popup>
				<bt-dialog v-model="addClassPopup" :area="40" showFooter @confirm="addClassEvent" @cancel="onCancel" :title="classFormTitle">
					<div class="p-[2rem]">
						<el-form :model="classForm" :rules="rules" ref="crontabClassForm">
							<el-form-item label="分类名称" prop="name">
								<bt-input v-model="classForm.name" placeholder="请输入分类名称"></bt-input>
							</el-form-item>
						</el-form>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { getSslStore } from '@ssl/useStore'
import { delDomainType, delCertGroup, addCertGroup, addDomainType } from '@api/ssl'
import { useMessage } from '@hooks/tools/message'
import { useConfirm } from '@hooks/tools/confirm'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

interface classForm {
	name: string
	id: string
}

interface Props {
	compData: any
}

const {
	refs: { tabActive, isRefreshDomainOrCertType, isRefreshDomainList, domainParams, certificateParams, typeList },
} = getSslStore()

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const addClassPopup = ref(false) // 添加分类弹窗
const classFormTitle = ref<string>('添加分类') // 表单数据
const classForm = ref<classForm>({
	name: '',
	id: '',
}) // 表单数据
const tableLoading = ref(false) // 表格加载中

const crontabClassForm = ref<any>(null)

const rules = {
	name: [
		{ required: true, message: '请输入分类名称', trigger: 'blur' },
		{ max: 16, message: '分类名称不能超过16个字符', trigger: 'blur' },
	],
}

const tableColumns = ref<any>([
	{
		label: '分类名称',
		prop: 'name',
	},
	{
		label: '操作',
		align: 'right',
		render: (row: any) => {
			if (row.id <= 0) return '不可操作'
			return h(
				'div',
				{
					class: 'text-primary cursor-pointer',
					onClick: async () => {
						await useConfirm({
							title: '提示',
							icon: 'warning',
							content: '是否确定删除分类？',
						})
						delType(row)
					},
				},
				'删除'
			)
		},
	},
]) // 响应式数据

// 删除分类
const delType = async (row: classForm) => {
	try {
		tableLoading.value = true
		switch (tabActive.value) {
			case 'domain':
				const delDomainTyp = await delDomainType({
					name: row.name,
					type_id: row.id,
				})
				useMessage().request(delDomainTyp)
				isRefreshDomainOrCertType.value = true
				if (checkList(row.id)) {
					// 初始化分类选择框
					domainParams.value.type = '-1'
					isRefreshDomainList.value = true
				}
				break
			case 'certificate':
				const delCertGroupTyp = await delCertGroup({
					group_id: row.id,
				})
				useMessage().request(delCertGroupTyp)
				isRefreshDomainOrCertType.value = true
				if (checkList(row.id)) {
					// 初始化分类选择框
					domainParams.value.type = '-1'
					const refreshMap = {
						ssl: () => (sslIsRefresh.value = true),
						test: () => (testIsRefresh.value = true),
						encrypt: () => (encryptIsRefresh.value = true),
						other: () => (otherIsRefresh.value = true),
					} as const
					refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
				}
				break
		}
	} catch (error) {
		console.log(error)
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description 校验当前列表是否与删除分类一致
 * @param {any} id
 */
const checkList = (id: any) => {
	switch (tabActive.value) {
		case 'domain':
			return id === domainParams.value.type
		case 'certificate':
			return id === certificateParams.value.type
	}
}

/**
 * @description 添加分类
 */
const addClass = () => {
	classFormTitle.value = '添加分类'
	addClassPopup.value = true
}

/**
 * @description 添加分类提交事件
 */
const addClassEvent = async () => {
	if (!crontabClassForm.value) {
		console.error('表单ref未找到')
		return
	}

	try {
		// 使用await等待校验结果
		const valid = await crontabClassForm.value.validate()
		if (!valid) return false

		tableLoading.value = true

		switch (tabActive.value) {
			case 'domain':
				const addDomainTyp = await addDomainType({
					name: classForm.value.name,
				})
				useMessage().request(addDomainTyp)
				isRefreshDomainOrCertType.value = true
				break
			case 'certificate':
				const addCertGroupTyp = await addCertGroup({
					name: classForm.value.name,
					group_id: Date.now(),
				})
				useMessage().request(addCertGroupTyp)
				isRefreshDomainOrCertType.value = true
				break
		}
		onCancel()
		addClassPopup.value = false
	} catch (error) {
		console.log('表单校验失败:', error)
		return false
	} finally {
		tableLoading.value = false
	}
}

const onCancel = () => {
	classForm.value = {
		name: '',
		id: '',
	}
}
</script>

<style scoped></style>

<template>
	<div>
		<bt-table max-height="560" :column="tableColumn" :data="tableData" v-bt-loading="tableLoading"> </bt-table>
		<bt-dialog title="切换网站" v-model="switchPopup" :area="42" show-footer @confirm="onConfirm">
			<div class="p-[20px]">
				<el-form v-model="websiteForm">
					<el-form-item label="数据库">
						<bt-input disabled v-model="websiteForm.database" width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label="站点名称">
						<el-select v-model="websiteForm.pid" class="!w-[24rem]">
							<el-option v-for="(item, index) in siteOptions" :key="index" :label="item.rname" :value="item.id"></el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="tsx" setup>
import { useDataHandle } from '@hooks/tools'
import { getSiteInfo, modifyFtpLink, modifyMysqlLink, getFtpInfo, getMysqlInfo } from '@/api/database'

const switchPopup = ref(false) // 切换网站弹窗
const tableLoading = ref(false) // 表格加载中
const siteOptions = ref<any>([]) // 站点列表
const tableData = ref([]) // 表格数据

const websiteForm = ref({
	sql_id: '',
	pid: '',
	database: '',
}) // 切换网站表单

const tableColumn = [
	{ prop: 'name', label: '数据库' },
	{
		label: '站点名称',
		render: function (row: any) {
			return (
				<div>
					{row.rname || '--'}{' '}
					<span class="cursor-pointer bt-link" onClick={() => switchWebSite(row)}>
						切换
					</span>
				</div>
			)
		},
	},
]

/**
 * @description 切换站点
 * @param row
 */
const switchWebSite = async (row: any) => {
	try {
		const res: any = await getSiteInfo()
		siteOptions.value = res.data
		websiteForm.value.database = row.name
		websiteForm.value.sql_id = row.id
		websiteForm.value.pid = row.pid ? row.pid : siteOptions.value[0]?.id
		switchPopup.value = true
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取关联信息
 */
const getSiteInfoData = async () => {
	await useDataHandle({
		request: getMysqlInfo(),
		loading: tableLoading,
		data: [Array, tableData],
	})
}

/**
 * @description 确认切换
 */
const onConfirm = async () => {
	const params: any = { pid: websiteForm.value.pid, sql_id: websiteForm.value.sql_id }

	await useDataHandle({
		request: modifyMysqlLink(params),
		loading: '正在切换中...',
		message: true,
		success: () => {
			switchPopup.value = false
			getSiteInfoData()
		},
	})
}

onMounted(getSiteInfoData)
defineExpose({ init: getSiteInfoData })
</script>

<template>
	<div>
		<bt-table max-height="560" :column="tableColumn" :data="tableData" v-bt-loading="tableLoading"></bt-table>
		<bt-dialog :title="websiteForm.type === 'ftp' ? '切换FTP用户' : '切换数据库用户'" v-model="switchPopup" :area="42" show-footer @confirm="onConfrim">
			<div class="p-[20px]">
				<el-form v-model="websiteForm" ref="websiteFormRef">
					<el-form-item label="站点名称">
						<bt-input class="!w-[24rem]" disabled v-model="websiteForm.site"></bt-input>
					</el-form-item>
					<el-form-item :label="websiteForm.type === 'ftp' ? 'ftp用户' : '数据库用户'" prop="pid">
						<el-select v-model="websiteForm.pid" class="!w-[24rem]">
							<el-option v-for="(item, index) in siteOptions" :key="index" :label="item.name" :value="item.id"></el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="tsx" setup>
import { Message, useDataHandle, useMessage } from '@/hooks/tools'
import { getFtpInfo, getMysqlInfo, getSiteInfo, modifyFtpLink, modifyMysqlLink } from '@api/site'

const switchPopup = ref(false) // 切换网站弹窗
const tableLoading = ref(false) // 表格加载中
const siteOptions = ref<any>([]) // 站点列表
const tableData = ref([]) // 表格数据

const websiteForm = ref({
	pid: '',
	site: '',
	id: '',
	type: 'mysql',
}) // 切换网站表单

const tableColumn = ref([
	{
		prop: 'rname',
		label: '站点名称',
	},
	{
		label: 'FTP用户',
		render: function (row: any) {
			return (
				<div>
					{row.ftp.name ? row.ftp.name : '--'}{' '}
					<span
						class="cursor-pointer bt-link"
						onClick={() => {
							switchWebSite(row, 'ftp')
						}}>
						切换
					</span>
				</div>
			)
		},
	},
	{
		label: '数据库',
		render: function (row: any) {
			return (
				<div>
					{row.mysql.name ? row.mysql.name : '--'}{' '}
					<span
						class="cursor-pointer bt-link"
						onClick={() => {
							switchWebSite(row, 'mysql')
						}}>
						切换
					</span>
				</div>
			)
		},
	},
]) // 表格列

/**
 * @description 切换站点
 * @param row
 */
const switchWebSite = async (row: any, type: string) => {
	websiteForm.value.type = type
	await useDataHandle({
		request: type === 'ftp' ? getFtpInfo() : getMysqlInfo(),
		data: [Array, siteOptions],
	})
	websiteForm.value.pid = row[type].id
	websiteForm.value.site = row.rname
	switchPopup.value = true
	websiteForm.value.id = row.id
}

/**
 * @description 获取关联信息
 */
const getSiteInfoData = async () => {
	useDataHandle({
		loading: tableLoading,
		request: getSiteInfo(),
		data: [Array, tableData],
	})
}

/**
 * @description 确认切换
 */
const onConfrim = async () => {
	const { type, pid, id } = websiteForm.value
	if (!pid) {
		Message.error('请选择用户')
		return
	}
	const params = {
		[type === 'ftp' ? 'ftp_id' : 'sql_id']: pid,
		pid: id,
	}
	const requestFun = type === 'ftp' ? modifyFtpLink : modifyMysqlLink
	const res: AnyObject = await useDataHandle({
		loading: '正在切换，请稍后...',
		request: requestFun(params),
		message: true,
	})
	if (res.status) {
		switchPopup.value = false
		getSiteInfoData()
	}
}

onMounted(getSiteInfoData)
</script>

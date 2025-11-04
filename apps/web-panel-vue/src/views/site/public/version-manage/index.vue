<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<template #header-right></template>
			<template #content>
				<bt-table max-height="500" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left></template>
			<template #footer-right></template>
			<template #popup>
				<bt-dialog title="添加版本" :area="44" v-model="addPopup" show-footer :confirmText="'上传文件'" @confirm="selectFile">
					<el-form class="p-[2rem]" ref="addFromRef" :model="addFrom" :rules="addRules">
						<el-form-item label="版本号" prop="version">
							<bt-input v-model="addFrom.version" placeholder="请输入版本号" width="24rem"></bt-input>
						</el-form-item>
						<el-form-item label="备注" prop="ps">
							<bt-input v-model="addFrom.ps" placeholder="请输入备注" width="24rem"></bt-input>
						</el-form-item>
						<uploadVersionFile
							ref="fileIpRef"
							@upload-success="changeInputFile"
							:compData="{
								...addFrom,
								sitename: siteInfo.name,
								getVersion,
								close: () => {
									addPopup = false
								},
							}"></uploadVersionFile>
						<bt-help :options="[{ content: '支持zip,tar.gz,tar,bz2,gz,xz格式' }]" class="list-disc ml-[7rem]" />
					</el-form>
				</bt-dialog>
				<bt-dialog title="当前目录生成版本" :area="44" v-model="nowPopup" show-footer @confirm="nowFileBackupEvent">
					<el-form class="p-2rem" ref="nowFromRef" :model="nowFrom" :rules="addRules">
						<el-form-item label="版本号" prop="version">
							<bt-input v-model="nowFrom.version" placeholder="请输入版本号" width="26rem"></bt-input>
						</el-form-item>
					</el-form>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { useConfirm, useMessage, useOperation } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { getVersionProject, nowFileBack, recoverVersionProject, removeVersionProject, setVersionPs } from '@api/site'
import uploadVersionFile from '@site/public/version-manage/upload-version-file.vue'
import { useSiteStore } from '@site/useStore'

const { siteInfo, activeType } = useSiteStore()
const type = activeType.value

const Message = useMessage() // 消息提示
const fileIpRef = ref() // 上传文件ref

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 表格loading

const addPopup = ref(false) // 添加版本弹窗
const addFromRef = ref() // 添加版本表单ref
const addFrom = reactive({
	name: '',
	version: '',
	ps: '',
})
const addRules = {
	version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
}

const nowPopup = ref(false) // 当前目录生成版本弹窗
const nowFromRef = ref() // 当前目录生成版本表单ref
const nowFrom = reactive({
	version: '',
})

const { BtOperation } = useOperation({
	options: [
		{
			label: '添加版本',
			type: 'button',
			active: true,
			onClick: () => {
				addFrom.ps = ''
				addFrom.version = ''
				addPopup.value = true
			},
		},
		{
			label: '当前目录生成版本',
			type: 'button',
			onClick: () => {
				nowFrom.version = ''
				nowPopup.value = true
			},
		},
	],
})

const deleteVersion = async (row: any) => {
	try {
		await useConfirm({
			title: `删除版本【${row.version}】`,
			isHtml: false,
			content: '删除版本，是否继续操作？',
			icon: 'warning-filled',
		})
		const rdata = await removeVersionProject(
			{
				sitename: siteInfo.value.name,
				version: row.version,
			},
			type
		)
		Message.request(rdata)
		if (rdata.status) getVersion()
	} catch (error) {}
}

/**
 * @description 恢复版本
 * @param {any} row 行数据
 * @return {Promise<void>} void
 */
const recoverVersion = async (row: any) => {
	let load: any
	try {
		await useConfirm({
			title: `恢复版本【${row.version}】`,
			isHtml: false,
			content: '恢复版本，会删除目录下所有文件后恢复，请将【当前目录生成版本】备份后继续操作？',
			type: 'calc',
			icon: 'warning-filled',
		})
		load = Message.load('正在恢复版本，请稍后...')
		const data = await recoverVersionProject(
			{
				sitename: siteInfo.value.name,
				version: row.version,
			},
			type
		)
		Message.request(data)
	} catch (error) {
	} finally {
		load.close()
	}
}

/**
 * @description 设置版本备注
 */
const setPsEvent = async (row: any) => {
	try {
		const rdata = await setVersionPs(
			{
				sitename: siteInfo.value.name,
				version: row.version,
				ps: row.ps,
			},
			type
		)
		Message.request(rdata)
		getVersion()
	} catch (error) {}
}

const tableColumns = ref([
	{
		label: '版本号',
		prop: 'version',
	},
	{
		label: '备注',
		prop: 'ps',
		minWidth: 120,
		isCustom: true,
		showOverflowTooltip: false,
		render: (row: { ps: string; id: number }) => {
			const arrEntities: any = {
				lt: '<',
				gt: '>',
				nbsp: ' ',
				amp: '&',
				quot: '"',
			}
			row.ps = row.ps?.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
				return arrEntities[t]
			})
			return (
				<input
					type="text"
					value={row.ps}
					class={'bt-table-input w-full !whitespace-pre-line'}
					placeholder={`点击编辑备注`}
					// eslint-disable-next-line consistent-return
					onBlur={(e: any) => {
						if (row.ps === e.target.value) return false
						row.ps = e.target.value
						setPsEvent(row)
					}}
				/>
			)
		},
	},
	useOperate([
		{
			onClick: recoverVersion,
			title: '恢复',
		},
		{
			onClick: deleteVersion,
			title: '删除',
		},
	]),
])

const getVersion = async () => {
	// 获取反向代理列表
	tableLoading.value = true
	try {
		const { data } = await getVersionProject(
			{
				sitename: siteInfo.value.name,
			},
			type
		)
		tableData.value = data.data
		tableLoading.value = false
	} catch (error) {
		console.log(error)
	}
}

const nowFileBackupEvent = async () => {
	await nowFromRef.value.validate()
	let load: any
	try {
		load = Message.load('正在生成版本，请稍后...')
		const rdata = await nowFileBack({ sitename: siteInfo.value.name, version: nowFrom.version }, type)
		Message.request(rdata)
		if (rdata.status) {
			nowPopup.value = false
			getVersion()
		}
	} catch (error) {
	} finally {
		load.close()
	}
}

const selectFile = async () => {
	await addFromRef.value.validate()
	fileIpRef.value.open()
	return false
}

/**
 * @description 上传文件
 * @param {any} e 上传文件
 */
const changeInputFile = async (e: any) => {
	// getThesaurusEvent()
}

onMounted(getVersion)

defineExpose({ init: getVersion })
</script>

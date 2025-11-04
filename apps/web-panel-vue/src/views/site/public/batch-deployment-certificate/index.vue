<!-- 批量证书设置-->
<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-button type="default" @click="getList">从云端同步</el-button>
			</template>
			<template #header-right><bt-table-refresh @refresh="getList" /></template>
			<template #content>
				<bt-table :column="tableColumns" :data="tableData" :max-height="500" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载中，请稍后...'" />
			</template>
			<template #popup>
				<bt-dialog title="部署当前证书" v-model="setPopup" :area="[52, 36]">
					<div class="relative h-full">
						<div class="p-[20px]">
							<div class="flex flex-col p-[12px] bg-light">
								<span class="mb-[4px]">认证域名：{{ certData.subject }}</span>
								<span class="mb-[4px]">证书类型：{{ certData.info?.issuer }}</span>
								<span class="mb-[4px]">到期时间：{{ certData.not_after }}</span>
							</div>
							<span class="!mt-[24px] !mb-[4px] inline-block">如下是需要批量部署证书的站点：</span>
							<div class="overflow-auto h-[12rem] border border-lighter p-[12px]">
								<div v-for="(item, index) in compData" :key="index" class="p-[4px] w-full">
									{{ item.name }}
								</div>
							</div>
						</div>
						<div class="absolute bottom-0 w-full bg-light flex items-center justify-end p-[12px]">
							<el-button type="warning" @click="setPopup = false">取消</el-button>
							<el-button type="primary" @click="handleConfirm()">部署({{ compData.length }}项目)</el-button>
						</div>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { getCertList } from '@api/global'
import { removeCloudCert, uploadCertToCloud } from '@api/site'
import { useSiteStore } from '@site/useStore'
import { setCertFolderDeployEvent } from '../ssl-arrange/useController'

interface Props {
	compData: any
}

const { siteInfo } = useSiteStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const siteType = ref<string>(siteInfo.value?.project_type?.toLowerCase()) // 项目类型

const setPopup = ref(false) // 弹窗开关
const certData = ref<any>({}) // 证书数据
const tableColumns = ref([
	{ label: '域名', prop: 'subject' },
	{ label: '到期时间', prop: 'not_after' },
	{ label: '品牌', prop: 'info.issuer', showOverflowTooltip: true },
	{ label: '位置', render: (row: any) => h('span', [row.cloud_id > 0 ? '云端' : '本地']) },
	useOperate([
		{
			width: 70,
			onClick: async (row: any) => {
				await useConfirm({
					title: '上传云端证书',
					content: '将会上传证书信息至云端进行替换，是否继续操作？',
					icon: 'warning-filled',
					type: 'calc',
				})
				const res: AnyObject = await useDataHandle({
					loading: '正在上传证书...',
					request: uploadCertToCloud({ ssl_hash: row.hash }),
					message: true,
				})
				if (res.status) await getList()
			},
			isHide: (row: any) => row.cloud_id > 0,
			title: '上传云端',
		},
		{
			onClick: (row: any) => {
				certData.value = row
				setPopup.value = true
			},
			title: '部署',
		},
		{
			width: 70,
			onClick: async (row: any) => {
				await useConfirm({
					title: '删除证书',
					content: '删除后该证书将不会显示在证书夹，是否继续操作？',
					icon: 'warning-filled',
				})
				const res: AnyObject = await useDataHandle({
					loading: '正在删除证书...',
					request: removeCloudCert({
						local: row.cloud_id > 0 ? 0 : 1,
						ssl_hash: row.hash,
					}),
					message: true,
				})
				if (res.status) await getList()
			},
			title: '删除',
		},
	]),
]) // 响应式数据
const tableData = ref([]) // 响应式数据
const tableLoad = ref(false) // 响应式数据

const getList = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getCertList(),
		data: [Array, tableData],
	})
}

const popupClose = inject<any>('popupClose') //     弹窗关闭
const handleConfirm = async (type: string = siteType.value) => {
	const { hash, subject } = certData.value
	await setCertFolderDeployEvent({
		hash,
		subject,
		list: props.compData,
		type,
	})
	setPopup.value = false
	popupClose()
}

onMounted(getList)
</script>

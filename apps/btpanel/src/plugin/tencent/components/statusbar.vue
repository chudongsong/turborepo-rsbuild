<template>
	<div>
		<div v-if="tencentShow" v-bt-loading="refresh" class="tencent min-h-[5.2rem] module-ui !p-0" >
			<div class="flex items-center px-[1rem] py-[1.4rem] flex-wrap gap-y-1rem">
				<div class="tencent_division flex items-center">
					<i class="tencent_ico"></i>
					<span class="text-base text-secondary font-semibold ml-[5px]">腾讯云专享版</span>
				</div>
				<div class="mx-[1rem]">
					<span>主机IPv4：</span>
					<span v-html="hostIp"></span>
				</div>
				<div class="mx-[1rem]">
					<span>区域：</span>
					<span>{{ hostPath }}</span>
				</div>
				<div class="mx-[1rem]">
					<span>到期时间：</span>
					<span>{{ hostExpiredTime }}</span>
				</div>
				<div v-if="tencentData.requestPack.InstanceTrafficPackageSet.length > 0" class="mx-[1rem]">
					<span>流量包：</span>
					<span>{{ hostRequestPackage }}</span>
					<BtLink class="ml-[0.5rem]" @click="tencentData.requestInfoShow = true">详情</BtLink>
				</div>
				<el-button v-if="tencentData.show" class="ml-[1rem]" @click="tencentCloudPopup(false)">关联腾讯云API密钥</el-button>
				<div v-else>
					<el-button class="ml-[1rem]" @click="gotoTencentCloud">续费</el-button>
					<el-button class="ml-[1rem]" @click="gotoTencentCloud">升级套餐</el-button>
					<el-button type="default" class="ml-[1rem]" @click="tencentCloudPopup(true)">密钥管理</el-button>
					<el-button type="default" class="ml-[1rem]" @click="getFirstPhoto()">快照</el-button>
					<el-button type="default" class="ml-[1rem]" @click="updateTencentPanel">更新</el-button>
					<el-button type="default" class="ml-[1rem]" @click="tencentCheck(true)">刷新<i class="svgtofont-el-refresh-right el-icon--right size-[1.3rem]"></i></el-button>
					<BtLink class="ml-[1rem]" @click="gotHtml('https://www.bt.cn/bbs/thread-66887-1-1.html')">查看教程</BtLink>
				</div>
			</div>
			<BtDialog v-model="tencentData.requestInfoShow" title="流量包管理" :area="[80, 30]">
				<div class="p-[2rem]">
					<el-table :data="requestPackTableData" border :max-height="250">
						<el-table-column prop="TrafficPackageId" label="流量包ID" width="120"></el-table-column>
						<el-table-column prop="TrafficPackageTotal" label="总量"></el-table-column>
						<el-table-column prop="TrafficUsed" label="已用"></el-table-column>
						<el-table-column prop="TrafficPackageRemaining" label="剩余"></el-table-column>
						<el-table-column prop="TrafficPackageStart" label="开始时间" width="150"></el-table-column>
						<el-table-column prop="TrafficPackageEnd" label="结束时间" width="150"></el-table-column>
					</el-table>
				</div>
			</BtDialog>
			<BtDialog v-model="tencentData.firstPhotoShow" title="腾讯云硬盘快照" :area="[62]">
				<div class="p-[2rem]">
					<div class="alert alert-danger leading-2rem mb-1rem">
						温馨提示：
						<template v-if="!tencentCVM">
							<div>1、每个地域的免费快照配额为已创建实例数<span style="font-weight: 600">(待回收实例和存储型套餐实例除外)乘以2</span>，且最多不超过4个。</div>
							<div>2、使用存储型套餐的实例不支持创建快照。</div>
							<div>3、创建快照通常可以在5分钟内完成，请耐心等待，创建过程中无需关机。</div>
						</template>
						<template v-else>
							<div>
								1、快照仅能捕获该时刻已经在云硬盘上的数据，而无法将在内存中的数据记录下来。因此，为了保证快照能尽可能回复完整的数据，建议您在制作快照前进行以下操作：
								<ul class="pl-1.6rem list-disc">
									<li>数据库业务：进行 flush and lock 表操作，加锁并下刷表数据</li>
									<li>文件系统：进行 sync 操作，下刷内存数据</li>
								</ul>
							</div>
							<div>
								2、快照已正式商业化，请您关注因此产生的费用。有关快照的更多信号可参考<bt-link href="https://cloud.tencent.com/document/product/362/5754" class="BtLink" target="_blank">快照概述</bt-link>以及<bt-link
									href="https://cloud.tencent.com/document/product/362/17935"
									class="BtLink"
									target="_blank"
									>快照商业化FAQ</bt-link
								>
							</div>
						</template>
					</div>
					<div class="flex items-center justify-between">
						<el-popover v-model="visible" placement="right" popper-class="myPopover" width="200">
							<div class="p-[1rem]">
								<el-input v-model="tencentData.SnapshotName" :disabled="tencentData.createSnapshotDisable" size="small" class="mb-[1rem]" placeholder="请输入快照名称"></el-input>
								<div style="text-align: right; margin: 0">
									<el-button size="small" type="default" @click="visible = false">取消</el-button>
									<el-button type="primary" size="small" :loading="tencentData.createSnapshotDisable" @click="createSnapshotEvent">确定</el-button>
								</div>
							</div>
							<template #reference>
								<el-button type="primary">创建快照</el-button>
							</template>
						</el-popover>
						<el-button type="default" @click="getFirstPhoto(true)"><span class="svgtofont-el-refresh"></span></el-button>
					</div>
					<el-table :data="tencentData.snapshotsList" border :max-height="250" class="mt-[1rem]">
						<el-table-column prop="SnapshotName" label="快照名称" width="120"></el-table-column>
						<el-table-column prop="CreatedTime" label="创建时间" :formatter="row => timeFormate(row.CreatedTime)"></el-table-column>
						<el-table-column prop="TrafficUsed" label="操作" align="right">
							<template #default="scope">
								<BtLink @click="gotHtml('https://console.cloud.tencent.com/cvm/snapshot/list')">回滚</BtLink>
								<div class="el-divider el-divider--vertical"></div>
								<BtLink @click="deleteSnapshotEvent(scope.row)">删除</BtLink>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</BtDialog>
		</div>
		<div v-if="isError" shadow="always" :body-style="{ padding: '0', display: 'flex', minHeight: '5.2rem' }" class="module-ui min-h-[5.2rem] !text-danger !bg-[var(--el-color-warning-light-8)] px-1.6rem">
			<el-icon name="svgtofont-el-warning" class="text-danger"></el-icon>
			<div class="flex items-center">
				密钥连接错误，请重新绑定或取消当前密钥关联!
				<BtLink class="ml-1rem" @click="tencentCloudDialog()">[ 密钥管理 ]</BtLink>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { setInstance, getTencentInfo, getRequestPack, getLocalLighthouse, getSnapshotsList, getDiskSnapshotsList, updateTencent, createSnapshots, createDiskSnapshots, deleteSnapshots, deleteDiskSnapshots } from '../api'

import { tencentCVM, tencentDataG } from '../store'

interface Props {
	dependencies: AnyObject
}
const props: any = withDefaults(defineProps<Props>(), {
	dependencies: () => ({}),
})

// eslint-disable-next-line @typescript-eslint/naming-convention
const { BtDialog, BtLink, ElCard, ElIcon, ElPopover, ElTable, ElTableColumn, ElInput, ElButton } = unref(props.dependencies.components)
const { getByteUnit } = unref(props.dependencies.utils)
// eslint-disable-next-line vue/no-setup-props-destructure
const { useAxios: instance, useMessage, useConfirm, useDialog } = unref(props.dependencies.hooks)

const Message = useMessage()

const tencentShow = ref<boolean>(false)
const refresh = ref<boolean>(false)
const isError = ref<boolean>(false) // 密钥错误
const visible = ref<boolean>(false) // 创建快照弹窗
const tencentData = reactive({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	InstanceId: '', // 跳转腾讯云需要的ID
	appId: '', // 腾讯云APPID
	secretId: '', // 腾讯云密钥Id
	secretKey: '', // 腾讯云密钥
	show: true, // 是否显示
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PrivateAddresses: [], // 内网IP
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PublicAddresses: [], // 外网IP
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Region: '', // 区域英文
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Region_title: '', // 区域中文
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ExpiredTime: '', // 到期时间
	requestPack: {
		// 流量包
		// eslint-disable-next-line @typescript-eslint/naming-convention
		InstanceTrafficPackageSet: [], // 流量包信息
		// eslint-disable-next-line @typescript-eslint/naming-convention
		RequestId: '', // 请求ID
		// eslint-disable-next-line @typescript-eslint/naming-convention
		TotalCount: 0, // 总数
	},
	requestInfoShow: false, // 流量包详情
	firstPhotoShow: false, // 快照详情
	snapshotsList: [], // 快照列表
	// eslint-disable-next-line @typescript-eslint/naming-convention
	SnapshotName: '', // 快照名称
	createSnapshotDisable: false, // 创建快照按钮禁用
})

/**
 * @description 主机IP
 */
const hostIp = computed(() => {
	const formatAddresses = (addresses: any[], type: string) => {
		return `<span>${addresses.join('、')}(${type})</span>`
	}
	if (tencentData.PrivateAddresses.length > 0 && tencentData.PublicAddresses.length > 0) {
		const privateStr = formatAddresses(tencentData.PrivateAddresses, '内')
		const publicStr = formatAddresses(tencentData.PublicAddresses, '外')
		return `${privateStr} / ${publicStr}`
	}
	return '----'
})

/**
 * @description 区域
 */
const hostPath = computed(() => {
	if (tencentData.Region !== '' && tencentData.Region_title !== '') {
		return `${tencentData.Region_title}-${tencentData.Region}`
	}
	return '----'
})

/**
 * @description 到期时间
 */
const hostExpiredTime = computed(() => {
	if (tencentData.ExpiredTime !== '') {
		return timeFormate(tencentData.ExpiredTime)
	}
	return '----'
})

/**
 * @description 腾讯云快照
 */
const requestPackTableData = computed(() => {
	const tableData = []
	for (let i = 0; i < tencentData.requestPack.InstanceTrafficPackageSet.length; i++) {
		const item: any = tencentData.requestPack.InstanceTrafficPackageSet[i]
		for (let j = 0; j < item.TrafficPackageSet.length; j++) {
			const item2 = item.TrafficPackageSet[j]
			tableData.push({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TrafficPackageId: item2.TrafficPackageId,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TrafficPackageTotal: getByteUnit(item2.TrafficPackageTotal),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TrafficUsed: getByteUnit(item2.TrafficUsed),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TrafficPackageRemaining: getByteUnit(item2.TrafficPackageRemaining),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TrafficPackageStart: timeFormate(item2.StartTime),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TrafficPackageEnd: timeFormate(item2.EndTime),
			})
		}
	}
	return tableData
})

/**
 * @description 流量包
 */
const hostRequestPackage = computed(() => {
	if (tencentData.requestPack.InstanceTrafficPackageSet.length > 0) {
		const packageSet: any = tencentData.requestPack.InstanceTrafficPackageSet[0]
		let total = 0
		let used = 0
		for (let i = 0; i < packageSet.TrafficPackageSet.length; i++) {
			const item = packageSet.TrafficPackageSet[i]
			total += item.TrafficPackageTotal
			used += item.TrafficUsed
		}
		if (!packageSet.TrafficPackageSet.length) return '不限制流量/无法获取流量包信息'
		return `${getByteUnit(used)}/${getByteUnit(total)}`
	}
	return '----'
})

/**
 * @description 时间格式化
 */
const timeFormate = (time: string) => {
	if (!time) return '--'
	const date = new Date(time)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed in JavaScript
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * @description 跳转腾讯云
 */
const gotoTencentCloud = () => {
	window.open(`https://console.cloud.tencent.com/lighthouse/instance/detail?id=${tencentData.InstanceId}`, '_blank', 'noopener,noreferrer')
}

/**
 * @description 跳转页面
 */
const gotHtml = (html: any) => {
	window.open(html, '_blank', 'noopener,noreferrer')
}

/**
 * @description 删除快照
 */
const deleteSnapshotEvent = async (row: any) => {
	try {
		await useConfirm({
			title: `删除[${row.SnapshotName}]快照`,
			content: `是否删除当前【${row.SnapshotName}】快照，删除后将无法恢复，是否继续？`,
		})
		const loadT = Message.load('正在删除快照，请稍后...')

		const requestFun = tencentCVM.value ? deleteDiskSnapshots : deleteSnapshots

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const res = await requestFun({ SnapshotId: row.SnapshotId })
		loadT.close()
		Message.request(res)
		await getFirstPhoto()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 腾讯云API配置
 */
const tencentCloudDialog = (data?: any) => {
	data = data || {}
	data.alert = isError.value ? '当前密钥错误，请重新关联API密钥' : ''
	useDialog({
		isAsync: true,
		component: () => import('./config.vue'),
		title: false,
		area: [48],
		compData: {
			...data,
			dependencies: props.dependencies,
		},
	})
}

/**
 * @description 密钥管理
 */
const tencentCloudPopup = (isEdit: boolean) => {
	if (isEdit) {
		tencentCloudDialog({
			appId: tencentData.appId,
			secretId: tencentData.secretId,
			secretKey: tencentData.secretKey,
			isEdit: isEdit || false,
		})
	} else {
		tencentCloudDialog()
	}
}

/**
 * @description 腾讯云检测
 */
const tencentCheck = async (isForce: boolean = false) => {
	try {
		isError.value = false
		tencentShow.value = true
		refresh.value = true
		const { data } = await getTencentInfo()
		if (data?.status === false && data?.msg) {
			return
		}
		if (data) {
			tencentData.show = false
			tencentData.secretKey = data.secretKey
			tencentData.appId = data.appid
			tencentData.secretId = data.secretId
			const { data: data2 } = await getLocalLighthouse(isForce ? { force: 1 } : {})
			tencentDataG.value = data2
			Object.assign(tencentData, data2)
			if (data2?.server_type !== 'cvm') {
				tencentCVM.value = false
				getRequestPackData()
			} else {
				tencentCVM.value = true
			}
			refresh.value = false
		} else {
			refresh.value = false
		}
	} catch (e) {
	} finally {
		refresh.value = false
	}
}

/**
 * @description 获取流量包
 */
const getRequestPackData = async () => {
	try {
		const { data: data3 } = await getRequestPack()
		if (data3 && data3.msg && (data3.msg.indexOf('密钥连接错误') > -1 || data3.msg.indexOf('获取失败') > -1)) {
			tencentCloudDialog({ tips: '当前密钥错误，请重新绑定或取消当前密钥关联' })
		} else {
			tencentData.requestPack = data3
		}
	} catch (error) {
		tencentShow.value = false
		isError.value = true
	}
}

/**
 * @description 腾讯云快照
 */
const getFirstPhoto = async (isRefresh: boolean = false) => {
	try {
		tencentData.firstPhotoShow = true
		const { data } = tencentCVM.value ? await getDiskSnapshotsList() : await getSnapshotsList()
		tencentData.snapshotsList = data.SnapshotSet
		if (isRefresh) Message.success('刷新成功')
	} catch (error) {}
}

/**
 * @description 创建快照
 */
const updateTencentPanel = async () => {
	await useConfirm({
		title: '更新腾讯云专版数据',
		content: `更新当前腾讯专版功能 (面板功能除外，面板更新请使用自带更新功能) ，是否继续操作?`,
	})
	const res = await updateTencent()
	Message.request(res)
}

/**
 * @description 创建快照
 */
const createSnapshotEvent = async () => {
	if (!tencentData.SnapshotName) {
		Message.error('请输入快照名称')
		return
	}
	try {
		const loadT = Message.load('正在创建快照，请稍后...')
		tencentData.createSnapshotDisable = true
		const requestFun = tencentCVM.value ? createDiskSnapshots : createSnapshots
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { data } = await requestFun({ SnapshotName: tencentData.SnapshotName })
		loadT.close()
		tencentData.createSnapshotDisable = false
		visible.value = false
		Message.request(data)
		tencentData.SnapshotName = ''
		if (data.status) await getFirstPhoto()
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	// 设置接口调用实例
	setInstance(instance)
	tencentCheck()
})

defineExpose({
	tencentCloudDialog,
})
</script>

<style lang="css">
.tencent_division {
	padding-right: 15px;
}
.tencent_division::after {
	content: '';
	display: inline-block;
	position: absolute;
	border-right: 1px solid var(--el-color-border-dark-tertiaryer);
	height: 25px;
	left: 136px;
}
.tencent_ico {
	display: inline-block;
	height: 25px;
	width: 25px;
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAACvElEQVRIS+2VS0iUYRSGn/PPhNLFpPsQhiHhiNFFoUUXKKhFUQuLCslxIgKlzDKidNXMKouImNrkJp2iKwZFoIsgCSkDR1wYNk7BLDKDkG50UZw58c+MGs0/Y7ZwU2d7zvc+3znn/fiEKQiZAgb/GqRSFzAtsg1kNcgKkDAaHcAwmvFJYKKRTzyuqshRRI4CSy3FVBu4bKtIB0oPOaJ+UFdCIIDoE6LRBxh2J7AT1S2xnHAXn7EnFSg1pDpyBpXauIhU4JOGJJFqPYnq2UTNOXxyygpkDTmgs5hBCHQhKnVclvqU46iKeBA5HctnyEzOy9ffa60h1SMlqHEvXiyZXJKhtMs9prlclPCfjasjlIVt5Djfpm3ApjMYMgbIHr5PcUFjSkiTejBYirIE5RXQj1s8v9aPdxLo245oPaqFyYLSyILph8jJ+T6W8+ty4BKw0eICbSgVuKUv7gszOsMO5MdTIBehDdVmxHhNNFoIchAhH2jHbitl5bI3XNVV2LgJmC4DxYtBN8pcoAYoRLmOW2LOjEMCvRdAahB5QVG+ecPx6AzOw+BGzK5R9dLrfIhyCyEPGAZKKZfE/hLH/Po41qGwFZe0xiFdwZ7YmETXUlTwLKn9rtB8IiOHCTpbiXIbWAJ8wWAvZdKSVN+o6zBoR6nHLXWJcb0cRJhDsTP1u2nS9Qh3AAcwiLIbt5g3tg6/KtBGuWwa7eQ5qmtSdnJNN6LcBeYhvEXYRZl0pASMdiL4cYl7FFKL6hnLnTTpZoRmIAsljJ0S9kl32nczuhPTEG7xxCGhUAafI6a7isbcFaWHd441fJjtBTKBIBEq04rbWYxSF3OX0IJLto27a9zGV4AdMaFPWUH6HXko9rTCVknTvgZeXGI+ToufMdC7n4/ZJ+hf9H7S4hBAeGTa9tezE/8nf0H6/ch/yKSG+BPZWO0aiPkdwgAAAABJRU5ErkJggg==);
}
</style>

<style>
.tencent .el-card__body {
	padding: 0;
}
</style>

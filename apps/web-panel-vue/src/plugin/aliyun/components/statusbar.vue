<!-- eslint-disable @typescript-eslint/naming-convention -->
<template>
	<div>
		<el-card v-if="aliyunShow" v-bt-loading="aliyunLoading" class="aliyun min-h-[5.2rem] module-box">
			<div class="flex items-center px-[1rem] py-[1.4rem] mx-[1.5rem]">
				<div class="aliyun_division flex items-center pr-[1rem] text-warning">
					<div><aliyun-icon class="mr-[0.5rem]" /></div>
					<span class="text-base font-semibold">阿里云专享版</span>
				</div>
				<el-divider direction="vertical" />
				<div class="flex h-full items-center justify-center <2xl:flex-col <2xl:items-start">
					<div class="flex <2xl:mb-[.8rem]">
						<div class="mx-[1.5rem] <2xl:mx-[1rem]">
							<span class="font-bold text-secondary">主机IPv4：</span>
							<span v-html="aliyunIpInfo"></span>
						</div>
						<div class="mx-[1.5rem] <2xl:mx-[1rem]">
							<span class="font-bold text-secondary">区域：</span>
							<span>{{ aliyunData.region }}</span>
						</div>
						<div class="mx-[1.5rem] <2xl:mx-[1rem]">
							<span class="font-bold text-secondary">到期时间：</span>
							<span>{{ aliyunData.maturityTime }}</span>
						</div>
						<div v-if="aliyunData.requestPack.has_traffic_package" class="mx-[1rem]">
							<span class="font-bold text-secondary">流量包：</span>
							<span>{{ hostRequestPackage }}</span>
							<BtLink class="ml-[0.5rem]" @click="aliyunData.requestInfoShow = true">详情</BtLink>
						</div>
						<div v-else class="flex-1">
							<span class="font-bold">网络:</span>
							<span class="ml-[1rem]">固定带宽</span>
						</div>
					</div>

					<el-button v-if="!aliyunBind" type="primary" class="!ml-[1rem]" @click="aliyunCloudPopup(false)"> 关联阿里云API密钥 </el-button>
					<div v-if="aliyunBind" class="flex 2xl:ml-[4rem]">
						<el-button type="primary" class="ml-[1rem]" @click="gotoAliCloud"> 续费 </el-button>
						<el-button class="ml-[1rem]" @click="aliyunCloudPopup(true)"> 密钥管理 </el-button>
						<el-button class="ml-[1rem]" @click="getFirstPhoto()"> 快照 </el-button>
						<el-button class="ml-[1rem]" @click="updateAliPanel()"> 更新 </el-button>
						<el-button class="ml-[1rem]" @click="renderAliyunServerInfo(true)">
							<span>刷新</span>
							<i class="svgtofont-el-refresh-right el-icon--right size-[1.3rem]"></i>
						</el-button>
						<BtLink target="_blank" class="ml-[1rem] !text-primary text-small" href="https://www.bt.cn/bbs/thread-66887-1-1.html"> 查看教程 </BtLink>
					</div>
				</div>
			</div>

			<!-- 
				<div v-else>
					<el-button class="ml-[1rem]" @click="gotoAliCloud">续费</el-button>
					<el-button class="ml-[1rem]" @click="gotoAliCloud">升级套餐</el-button>
					<el-button type="default" class="ml-[1rem]" @click="aliyunCloudPopup(true)">
						密钥管理
					</el-button>
					<el-button type="default" class="ml-[1rem]" @click="getFirstPhoto()">快照</el-button>
					<el-button type="default" class="ml-[1rem]" @click=" updateAliPanel">更新</el-button>
					<el-button type="default" class="ml-[1rem]" @click="aliyunCheck(true)">
						<span>刷新</span>
						<i class="svgtofont-el-refresh-right el-icon--right size-[1.3rem]"></i>
					</el-button>
					<el-link
						class="ml-[1rem]"
						@click="gotHtml('https://www.bt.cn/bbs/thread-66887-1-1.html')">
						查看教程
					</el-link> -->
			<!-- </div> -->
			<!-- </div> -->
			<!-- -->
		</el-card>
		<el-card v-if="aliyunShow && isError" shadow="always" :body-style="{ padding: '0', display: 'flex', minHeight: '5.2rem' }" class="module-box min-h-[5.2rem] !text-danger !bg-[var(--el-color-warning-light-8)] px-1.6rem">
			<div class="flex items-center">
				密钥连接错误，请重新绑定或取消当前密钥关联!
				<BtLink class="ml-1rem" @click="aliyunCloudPopup(aliyunBind)">[ 密钥管理 ]</BtLink>
			</div>
		</el-card>

		<BtDialog v-model="aliyunData.firstPhotoShow" title="阿里云硬盘快照" :area="[62]">
			<div class="p-[2rem]">
				<div class="alert alert-danger leading-2rem mb-1rem">
					温馨提示：
					<!-- <template> -->
					<div>1、每个地域的免费快照配额为已创建实例数<span style="font-weight: 600">(待回收实例和存储型套餐实例除外)乘以2</span>，且最多不超过4个。</div>
					<div>2、使用存储型套餐的实例不支持创建快照。</div>
					<div>3、创建快照通常可以在5分钟内完成，请耐心等待，创建过程中无需关机。</div>
					<!-- <div>
							1、快照仅能捕获该时刻已经在云硬盘上的数据，而无法将在内存中的数据记录下来。因此，为了保证快照能尽可能回复完整的数据，建议您在制作快照前进行以下操作：
							<ul class="pl-1.6rem list-disc">
								<li>数据库业务：进行 flush and lock 表操作，加锁并下刷表数据</li>
								<li>文件系统：进行 sync 操作，下刷内存数据</li>
							</ul>
						</div>
						<div>
							2、快照已正式商业化，请您关注因此产生的费用。有关快照的更多信号可参考<a
								href="https://cloud.aliyun.com/document/product/362/5754"
								class="BtLink"
								target="_blank"
								>快照概述</a
							>以及<a
								href="https://cloud.aliyun.com/document/product/362/17935"
								class="BtLink"
								target="_blank"
								>快照商业化FAQ</a
							>
						</div> -->
					<!-- </template> -->
				</div>
				<div class="flex items-center justify-between">
					<el-popover v-model="visible" placement="right" popper-class="myPopover" width="200">
						<div class="p-[1rem]">
							<el-input v-model="aliyunData.snapshot_name" :disabled="aliyunData.createSnapshotDisable" size="small" class="mb-[1rem]" placeholder="请输入快照名称"></el-input>
							<div style="text-align: right; margin: 0">
								<el-button type="default" @click="visible = false">取消</el-button>
								<el-button type="primary" :loading="aliyunData.createSnapshotDisable" @click="createSnapshotEvent">确定</el-button>
							</div>
						</div>
						<template #reference>
							<el-button type="primary" @click="visible = true">创建快照</el-button>
						</template>
					</el-popover>
					<el-button type="default" icon="svgtofont-el-refresh" @click="getFirstPhoto(true)"></el-button>
				</div>
				<el-table :data="aliyunData.snapshotsList" border :max-height="250" class="mt-[1rem]">
					<el-table-column prop="snapshot_name" label="快照名称" width="120"></el-table-column>
					<el-table-column prop="creation_time" label="创建时间" :formatter="row => timeFormate(row.creation_time)"></el-table-column>
					<el-table-column prop="TrafficUsed" label="操作" align="right">
						<template #default="scope">
							<BtLink href="https://console.cloud.aliyun.com/cvm/snapshot/list">回滚</BtLink>
							<div class="el-divider el-divider--vertical"></div>
							<BtLink @click="deleteSnapshotEvent(scope.row)">删除</BtLink>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</BtDialog>

		<BtDialog v-model="aliyunData.requestInfoShow" title="流量包管理" :area="[60, 30]">
			<div class="p-[2rem]">
				<el-table :data="requestPackTableData" border :max-height="250">
					<el-table-column prop="TrafficPackageTotal" label="总量"></el-table-column>
					<el-table-column prop="TrafficUsed" label="已用"></el-table-column>
					<el-table-column prop="TrafficPackageRemaining" label="剩余"></el-table-column>
				</el-table>
			</div>
		</BtDialog>
	</div>
</template>

<script setup lang="ts">
import { setAxios, getAliyunApiConfig, getAliyunSnapshotsList, getAliyunServerInfo, getAliyunDataPackageInfo, deleteAliyunSnapshots, createAliyunSnapshots } from '../api'
import aliyunIcon from './aliyun-icon.vue'

interface Props {
	dependencies: AnyObject
}

const props = withDefaults(defineProps<Props>(), {
	dependencies: () => [],
})

// eslint-disable-next-line vue/no-setup-props-destructure
const { ref, reactive, unref, computed, watch } = props.dependencies.vueMethods
// eslint-disable-next-line @typescript-eslint/naming-convention
const { BtDialog, ElButton, ElTable, ElTableColumn, BtLink, ElCard, ElDivider, ElPopover } = unref(props.dependencies.components)
const { getByteUnit } = unref(props.dependencies.utils)
// eslint-disable-next-line vue/no-setup-props-destructure
const { useAxios: instance, useMessage, useConfirm, useDialog } = props.dependencies.hooks

const Message = useMessage()

const aliyunLoading = ref(false) // 阿里云专享版加载状态
const aliyunShow = ref(true) // 阿里云专享版显示状态
const aliyunBind = ref(false) // 阿里云专享版密码绑定状态
const isError = ref(false) // 阿里云专享版密码绑定错误状态
const visible = ref<boolean>(false) // 创建快照弹窗

const aliyunConfig = reactive({
	secretId: '',
	secretKey: '',
})

// 阿里云专享版数据
const aliyunData = reactive({
	ipInfo: {
		outside: '',
		inside: '',
	},
	region: '--', // 区域
	maturityTime: '--', // 到期时间
	dataPackage: false, // 流量包状态
	firstPhotoShow: false, // 阿里云快照显示状态\

	createSnapshotDisable: false, // 创建快照按钮状态
	snapshot_name: '', // 快照名称
	snapshotsList: [], // 快照列表

	requestPack: {
		has_traffic_package: false,
		traffic_info: '',
	},
})

// 监听阿里云专享版显示状态
watch(aliyunShow, val => {
	if (val) getAliyunStatus()
})

// 监听阿里云专享版密码绑定状态
watch(aliyunBind, val => {
	if (val) renderAliyunServerInfo()
})

// 阿里云显示状态
const aliyunIpInfo = computed(() => {
	return `<span>${aliyunData.ipInfo.outside}(外)</span>、<span>${aliyunData.ipInfo.inside}(内)</span></span>`
})

/**
 * @description 流量包
 */
const hostRequestPackage = computed(() => {
	if (aliyunData.requestPack.traffic_info.length > 0) {
		const packageSet: any = aliyunData.requestPack.traffic_info[0]
		// const total = 0
		// const used = 0
		// for (let i = 0; i < packageSet.TrafficPackageSet.length; i++) {
		// 	const item = packageSet.TrafficPackageSet[i]
		// 	total += item.TrafficPackageTotal
		// 	used += item.TrafficUsed
		// }
		return `${getByteUnit(packageSet.TrafficUsed)}/${getByteUnit(packageSet.TrafficPackageTotal)}`
	}
	return '----'
})

/**
 * @description 获取阿里云专享版流量包
 */
const requestPackTableData = computed(() => {
	const tableData = []
	for (let i = 0; i < aliyunData.requestPack.traffic_info?.length; i++) {
		const item: any = aliyunData.requestPack.traffic_info[i]
		tableData.push({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			TrafficPackageTotal: getByteUnit(item.TrafficPackageTotal),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			TrafficUsed: getByteUnit(item.TrafficUsed),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			TrafficPackageRemaining: getByteUnit(item.TrafficPackageRemaining),
		})
	}
	return tableData
})

/**
 * @description 获取流量包
 */
const getRequestPackData = async () => {
	try {
		const { data: data3 } = await getAliyunDataPackageInfo()
		if (!data3.status) return
		aliyunData.requestPack = data3
	} catch (error) {
		isError.value = true
	}
}

/**
 * @description 获取阿里云专享版状态
 */
const getAliyunStatus = async () => {
	try {
		aliyunLoading.value = true
		const {
			data: { secretId, secretKey },
		} = await getAliyunApiConfig() // 获取阿里云API密钥，如果没有则不显示阿里云专享版
		aliyunBind.value = secretId && secretKey
	} catch (error) {
		console.error(error)
	} finally {
		aliyunLoading.value = false
		const mask = document.querySelector('.custom-loading--show')
		if (mask) mask.classList.remove('custom-loading--show')
	}
}

/**
 * @description 获取阿里云专享版信息
 * @param {boolean} isShow 是否显示加载状态
 */
const renderAliyunServerInfo = async (isRefresh?: boolean) => {
	aliyunLoading.value = true
	try {
		const rdata = await getAliyunServerInfo() // 获取阿里云专享版信息
		const { expired_time, inner_ip_address, public_ip_address, region_id, instance_id, image_id } = rdata.data
		aliyunData.ipInfo.outside = public_ip_address || '--'
		aliyunData.ipInfo.inside = inner_ip_address || '--'
		aliyunData.region = region_id || '--'
		if (expired_time) aliyunData.maturityTime = formatTime(new Date(expired_time), 'YYYY-MM-DD HH:mm:ss')

		if (isRefresh) Message.success('刷新成功')
	} catch (error) {
	} finally {
		aliyunLoading.value = false
		const mask = document.querySelector('.custom-loading--show')
		if (mask) mask.classList.remove('custom-loading--show')
	}
}

/**
 * @description 将日期对象格式化为指定格式的字符串
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串，例如 "YYYY-MM-DD HH:mm:ss"
 * @returns {string} 格式化后的日期字符串
 */
const formatTime = (date: Date, format: string): string => {
	const map: { [key: string]: string } = {
		YYYY: date.getFullYear().toString(),
		MM: (date.getMonth() + 1).toString().padStart(2, '0'),
		DD: date.getDate().toString().padStart(2, '0'),
		HH: date.getHours().toString().padStart(2, '0'),
		mm: date.getMinutes().toString().padStart(2, '0'),
		ss: date.getSeconds().toString().padStart(2, '0'),
	}
	return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched])
}

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
 * @description 设置阿里云专享版API密钥
 * @param {boolean} isShow 是否显示弹窗
 */
const aliyunCloudPopup = (isEdit: boolean) => {
	if (!isEdit) {
		aliyunConfig.secretId = ''
		aliyunConfig.secretKey = ''
	}
	useDialog({
		component: () => import('./bind-api.vue'),
		compData: {
			...aliyunConfig,
			dependencies: props.dependencies,
			isEdit: isEdit || false,
		},
		area: [48],
	})
}

/**
 * @description 快照
 */
const getFirstPhoto = async (isRefresh: boolean = false) => {
	try {
		aliyunData.firstPhotoShow = true
		const res = await getAliyunSnapshotsList()
		aliyunData.snapshotsList = res.data.value
		if (isRefresh) Message.success('刷新成功')
	} catch (error) {
		console.log('error', error)
	}
}

/**
 * @description 更新机器
 */
const updateAliPanel = async () => {
	await useConfirm({
		title: '更新阿里云专版数据',
		content: `更新当前阿里专版功能 (面板功能除外，面板更新请使用自带更新功能) ，是否继续操作?`,
	})
	// const res = await updateTencent()
	// Message.request(res)
}

/**
 * @description 创建快照
 */
const createSnapshotEvent = async () => {
	if (!aliyunData.snapshot_name) {
		Message.error('请输入快照名称')
		return
	}
	try {
		const loadT = Message.load('正在创建快照，请稍后...')
		aliyunData.createSnapshotDisable = true
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { data } = await createAliyunSnapshots({ snapshot_name: aliyunData.snapshot_name })
		loadT.close()
		aliyunData.createSnapshotDisable = false
		visible.value = false
		Message.request(data)
		aliyunData.snapshot_name = ''
		getFirstPhoto()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 跳转阿里云
 */
const gotoAliCloud = () => {
	// ${aliyunData.InstanceId}
	window.open(`https://account.aliyun.com`, '_blank', 'noopener,noreferrer')
}

/**
 * @description 删除快照
 */
const deleteSnapshotEvent = async (row: any) => {
	try {
		await useConfirm({
			icon: 'warning',
			title: `删除[${row.snapshot_name}]快照`,
			content: `是否删除当前【${row.snapshot_name}】快照，删除后将无法恢复，是否继续？`,
		})
		const loadT = Message.load('正在删除快照，请稍后...')
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const res = await deleteAliyunSnapshots({ snapshot_id: row.snapshot_id })
		loadT.close()
		Message.request(res)
		await getFirstPhoto()
	} catch (error) {
		console.log(error)
	}
}

setAxios(instance)
getAliyunStatus().then(() => {
	if (aliyunBind.value) getRequestPackData()
})
// if (aliyunBind.value) getRequestPackData()
// onMounted(async () => {})
</script>

<style>
.aliyun .el-card__body {
	padding: 0;
}
.st0 {
	fill: var(--el-color-warning);
}
</style>

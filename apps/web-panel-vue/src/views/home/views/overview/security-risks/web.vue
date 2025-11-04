<template>
	<div>
		<div class="text-large mb-6">网站漏洞检测</div>
		<div class="p-[1rem]">
			<div class="head mb-[2rem]">
				<div class="scan-header flex flex-row flex-wrap items-center justify-between">
					<div class="flex flex-row flex-wrap justify-center items-center">
						<div class="relative scan-header-cont" v-if="scanLoad == 'loading'">
							<!-- 图标-扫描中 -->
							<div v-if="loading" class="animate-spin absolute top-0 border-primary border-b-2 rounded-full h-full w-full"></div>
							<bt-icon icon="scanning-scan" :size="60" color="var(--el-color-primary)"></bt-icon>
						</div>
						<!-- 图标-扫描完成 -->
						<bt-icon icon="scanning-success" :size="60" color="var(--el-color-primary)" v-if="scanLoad == 'success'"></bt-icon>
						<bt-icon icon="scanning-danger" :size="60" color="#ef0808" v-if="scanLoad == 'danger'"></bt-icon>
						<div class="scan-header-cont flex justify-between flex-col px-[2rem]">
							<div class="scan-title text-extraLarge font-bold" v-html="scanInfo.scanTitle"></div>
							<div class="scan-subtitle text-medium mt-[1.2rem]">
								{{ scanInfo.scanTime }}
							</div>
						</div>
					</div>

					<div class="scan-header-cont justify-end relative">
						<bt-link class="btlink setScanAlarm absolute top-[5rem] right-1rem" @click="safeScanAlertDialog"> 自动扫描&gt;&gt; </bt-link>
						<el-button class="scan-btn h-[4rem] w-[10rem]" :type="scanLoad == 'loading' ? 'default' : 'primary'" size="large" @click="scanData">
							<span class="text-base">{{ scanInfo.scanCheckButton }}</span>
						</el-button>
						<!-- <el-button class="scan-btn h-[4rem] w-[10rem]" type="primary" size="large" v-if="scanLoad == 'danger'" @click="onlineServiceDialog()">
						<span class="text-base">立即修复</span>
					</el-button> -->
					</div>
				</div>
			</div>
			<el-divider class="!mt-0"></el-divider>
			<div class="content">
				<div v-if="contentShow" class="info">
					<div class="webedit-con flex items-center justify-center">
						<bt-image class="max-w-[90rem] mr-[4rem] w-[36rem]" src="/preview/site_scanning.png"></bt-image>
						<div class="thumbnail-introduce mt-[0rem]">
							<span class="text-large font-bold">漏洞扫描工具介绍：</span>
							<ul class="block leading-[2.6rem] mx-[2rem] list-square mt-[2rem]">
								<li>
									可识别多款开源CMS程序，支持如下：
									<br />
									迅睿CMS、pbootcms、苹果CMS、eyoucms、海洋CMS、
									<br />
									ThinkCMF、zfaka、dedecms、MetInfo、emlog、
									<br />帝国CMS、discuz、Thinkphp、Wordpress、Z-Blog、 <br />极致CMS、ShopXO、HYBBS、ECShop、SchoolCMS、 <br />phpcms、likeshop、iCMS、WellCMS、chanzhiEPS、 <br />PHPOK、LaySNS、骑士CMS、openSNS、齐博CMS、 <br />ZZZCMS、prestashop、ThinkphpSHOP、DouPHP、
									<br />cmseasy、piwigo、phpwind、行云海CMS
								</li>
								<li>可扫描网站中存在的漏洞</li>
								<li>提供修复/提供付费解决方案</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="scan" v-else>
					<div v-if="scanResShow" class="scan-success border-[0.1rem] p-[2rem] h-[38rem] border-light flex items-center justify-center">
						<div class="flex flex-column items-center">
							<bt-image :src="'/firewall/secure.png'" class="w-[34.0rem] h-[30.1rem]"></bt-image>
							<span class="absolute mt-[10.5rem] text-extraLarge leading-[0.14rem]"> 当前处于【安全状态】，请继续保持！ </span>
						</div>
					</div>

					<!-- 搜到危险项结果时 -->
					<div class="scan-dangerous" v-else>
						<div class="flex items-center mb-[2rem] text-default">
							<span class="w-[26rem]">网站</span>
							<span>类型</span>
						</div>
						<div class="overflow-auto h-[36rem]">
							<el-collapse v-model="activeNames" accordion>
								<el-collapse-item v-for="(item, index) in tableData" :key="index">
									<template #title>
										<div class="flex items-center">
											<div class="w-[26rem] flex items-center justify-start">
												<el-tag :type="item.cms.length > 0 ? 'warning' : 'success'" effect="dark"> {{ item.cms.length }}项 </el-tag>
												<span class="ml-[1.2rem]">{{ item.name }}</span>
											</div>
											<span>{{ item.cms_name + '--' + item.version_info }}</span>
											<div class="text-secondary text-small ml-[6rem]">无法自动修复,请在网站后台更新该软件版本。</div>
										</div>
									</template>

									<el-collapse accordion>
										<el-collapse-item v-for="(cms, cindex) in item.cms" :key="cindex">
											<template #title>
												<div class="flex items-center justify-between w-full">
													<div class="flex items-center ml-[1.2rem]">
														<el-tag :type="tagType[cms.dangerous][0]">
															{{ tagType[cms.dangerous][1] }}
														</el-tag>
														<span class="text-tertiary ml-[1.2rem]">
															{{ cms.ps }}
														</span>
													</div>
													<bt-link class="mb-[.2rem] mr-[1.6rem]">详情</bt-link>
												</div>
											</template>
											<div class="bg-light text-tertiary p-[2rem] ml-[1.2rem]">修复建议：{{ cms.repair }}</div>
										</el-collapse-item>
									</el-collapse>
								</el-collapse-item>
							</el-collapse>
						</div>
					</div>
				</div>
				<div class="mt-[1.2rem] ml-[2rem]">
					<div class="flex items-center">
						如需支持其他cms程序，请发帖反馈：
						<bt-link href="https://www.bt.cn/bbs/thread-89149-1-1.html"> https://www.bt.cn/bbs/thread-89149-1-1.html </bt-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	compData: any // 是否为站点模块
}
import { storeToRefs } from 'pinia'
import HOME_SECURITY_RISKS_STORE from './store'
import { startScan } from '@/api/firewall'
import { getVulnInfo } from '@/api/home'
import { useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { useGlobalStore } from '@store/global'
// import { getSiteStore } from '@/views/site/setting/site.store'

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({ isSiteModule: false }),
})

const { payment } = useGlobalStore()
const store = HOME_SECURITY_RISKS_STORE()
const { repairTypeActive } = storeToRefs(store)

const { authType } = toRefs(payment.value)

const Message = useMessage() // 消息提示

const contentShow = ref(true) // 内容显示
const scanResShow = ref(false) // 扫描结果显示

const scanInfo = ref({
	scanTitle: '立即进行漏洞扫描，确保您的网站安全。',
	scanTime: '您还未进行漏洞扫描!',
	scanCheckButton: '立即扫描',
}) // 扫描信息

const activeNames = ref(['1']) // 扫描结果

const tableData = shallowRef<any>([]) // 扫描结果数据
const tagType: Record<number, [any, string]> = {
	4: ['danger', '严重'],
	3: ['warning', '高危'],
	2: ['info', '中危'],
	1: ['success', '低危'],
}

const scanLoad = ref('success') // 扫描状态
const loading = ref(false) // 加载状态
/**
 * @description: 扫描
 */
const scanData = async () => {
	if (authType.value !== 'ltd') {
		// 弹出支付
		return store.openPayView()
	}
	scanLoad.value = 'loading'
	scanInfo.value.scanTitle = '正在扫描中，请稍后...'
	try {
		const { data }: any = await useDataHandle({
			request: startScan(),
			loading,
		})
		scanInfo.value.scanTitle = '扫描完成'
		scanInfo.value.scanTime = `扫描时间：${formatTime(data.time)}`
		scanInfo.value.scanCheckButton = '重新检测'
		contentShow.value = false
		if (!data.info.length) {
			scanResShow.value = true
			scanInfo.value.scanTitle = '当前网站没有风险项'
		} else {
			scanResShow.value = false
			tableData.value = data.info
			scanLoad.value = 'danger'
			scanInfo.value.scanCheckButton = '重新检测'
			scanInfo.value.scanTitle = `全部【${data.site_num}个】网站存在风险项<span class='text-danger'>${data.loophole_num}</span>个`
		}
		// 更新导航栏数量
		if (data.loophole_num !== store.tootipTotal.web) {
			store.getScanTotal()
		}
		if (data?.status !== false) {
			switch (true) {
				case props.compData.isSiteModule:
					// 更新网站扫描数据
					const { useSitePhpStore } = await import('@/views/site/views/php-model/useStore')
					const { scanData: scanDataStore } = useSitePhpStore()
					Object.assign(scanDataStore.value, data)
					break
			}
		}
	} catch (error) {
		console.log(error)
		scanLoad.value = 'success'
	} finally {
	}
}
const getVulnInfoData = async () => {
	const { data } = await getVulnInfo()
	const { loophole_num, site_num, time } = data.data
	if (loophole_num > 0) {
		scanInfo.value.scanTitle = `<span class='text-danger'>${loophole_num}</span>个高危网站漏洞待处理！ 总扫描网站数量${site_num}个`
		scanInfo.value.scanTime = `上一次扫描时间:${time}`
		scanLoad.value = 'danger'
		scanInfo.value.scanCheckButton = '立即查看'
	} else {
		scanInfo.value.scanTitle = `未扫描到网站漏洞，总扫描网站数量${site_num}个`
		scanInfo.value.scanTime = `上一次扫描时间:${time}`
		scanInfo.value.scanCheckButton = '重新检测'
		scanLoad.value = 'success'
	}
}
watch(repairTypeActive, val => {
	if (val === 'web') {
		getVulnInfoData()
	}
})
/**
 * @description 安全检测-扫描目录文件
 * @returns {Promise<App>}
 */
const safeScanAlertDialog = (): Promise<Component> => {
	return useDialog({
		title: '设置自动扫描',
		area: 54,
		component: () => import('./safe-scan-alert/index.vue'),
		showFooter: true,
	})
}
</script>

<style lang="css" scoped>
.alarmTip {
	@apply w-10 h-6.5 p-1.25 flex items-center justify-center mr-2.5 rounded-base ml-2.5;
}
:deep(.el-collapse-item__content) {
	padding-bottom: 0 !important;
}
</style>

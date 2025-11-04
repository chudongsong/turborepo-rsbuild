<template>
	<div class="p-2rem" v-bt-loading="viewLoading">
		<div class="mb-[2rem]">
			<div class="flex flex-row flex-wrap items-center justify-between">
				<div class="flex flex-row flex-wrap justify-center items-center">
					<bt-icon icon="scanning-success" :size="80" color="var(--el-color-primary)" v-if="scanLoad == 'success'"></bt-icon>
					<bt-icon icon="scanning-danger" :size="80" color="#ef0808" v-if="scanLoad == 'danger'"></bt-icon>
					<div class="flex justify-between flex-col px-[2rem]">
						<div class="text-extraLarge font-bold" v-html="scanInfo.scanTitle"></div>
						<div class="text-medium mt-[1.2rem]">上一次扫描时间:{{ scanData.time }}</div>
					</div>
				</div>
				<div class="justify-end relative">
					<el-button v-if="authType !== 'ltd'" class="scan-btn h-[4rem] w-[10rem]" type="primary" size="large" @click="productPaymentDialog({ sourceId: 168 })">
						<span class="text-base">立即查看</span>
					</el-button>
					<el-button class="scan-btn h-[4rem] w-[10rem]" type="primary" size="large" @click="getScanData">
						<span class="text-base">重新检测</span>
					</el-button>
				</div>
			</div>
		</div>
		<el-divider class="!mt-0"></el-divider>
		<div v-if="authType !== 'ltd'">
			<div class="webedit-con flex items-center justify-center">
				<el-image class="max-w-[90rem] mr-[4rem] w-[36rem]" :src="'https://www.bt.cn/Public/new/plugin/introduce/site/javaVulScan.png'" :custom="true"></el-image>
				<div class="thumbnail-introduce mt-[0rem]">
					<span class="text-large font-bold">漏洞扫描工具介绍：</span>
					<ul class="block leading-[2.6rem] mx-[2rem] list-square mt-[2rem]">
						<li>
							可识别多款Java组件漏洞，支持如下：<br />
							Apache Log4j2、Apache Shiro、Fastjson、<br />
							Spring Boot、Spring Framework、Struts2、<br />
							Tomcat、Weblogic、JBoss、Hibernate、Nexus<br />
							Dubbo、Nacos、Druid、MyBatis、Spring Cloud<br />
							Eureka、Ribbon、Hystrix、Zuul、Gateway<br />
							Thymeleaf、FreeMarker、Velocity<br />
						</li>
						<li>提供修复/提供付费解决方案</li>
						<li>提供详细的漏洞描述和风险等级(CVSS评分)</li>
					</ul>
				</div>
			</div>
		</div>
		<div v-else>
			<div class="scan-dangerous" v-if="scanResShow">
				<div class="flex items-center mb-[2rem] text-default">
					<span class="w-[26rem]">项目名称</span>
					<span>类型</span>
				</div>
				<div class="overflow-auto h-[36rem]">
					<el-collapse v-model="activeNames" accordion>
						<el-collapse-item v-for="(item, index) in scanData.list" :key="index">
							<template #title>
								<div class="flex items-center">
									<div class="w-[26rem] flex items-center justify-start">
										<el-tag type="warning" effect="dark"> {{ item.list.length }}项 </el-tag>
										<span class="ml-[1.2rem]">{{ item.title }}</span>
									</div>
									<!-- <span>{{ item.cms_name + '--' + item.version_info }}</span> -->
									<div class="text-secondary text-small">无法自动修复,请手动处理</div>
								</div>
							</template>

							<el-collapse accordion>
								<el-collapse-item v-for="(ccve, cindex) in item.list" :key="cindex">
									<template #title>
										<div class="flex items-center justify-between w-full">
											<div class="flex items-center ml-[1.2rem]">
												<el-tag :type="cvssType(ccve.cvss)[0]">
													{{ cvssType(ccve.cvss)[1] }}
												</el-tag>
												<span class="text-tertiary ml-[1.2rem]">
													{{ ccve.desc }}
												</span>
											</div>
											<bt-link class="mb-[.2rem] mr-[1.6rem]">详情</bt-link>
										</div>
									</template>
									<div class="bg-light text-tertiary">
										<div class="p-[3rem] bg-light">
											<div class="flex items-center">
												<div class="text-default collapse-title">漏洞编号</div>
												<div class="collapse-item">{{ ccve.CVE }}</div>
											</div>
											<div class="flex mt-[10px] items-center">
												<div class="text-default collapse-title">风险描述</div>
												<div class="collapse-item">
													{{ ccve.desc }}
												</div>
											</div>
											<div class="flex mt-[10px] items-center">
												<div class="text-default collapse-title">CVSS</div>
												<div class="collapse-item">
													{{ ccve.cvss }}
												</div>
											</div>
											<div class="flex mt-[10px] items-center">
												<div class="text-default collapse-title">JAR</div>
												<div class="collapse-item">
													{{ ccve.jar }}
												</div>
											</div>
											<div class="flex mt-[10px] items-center">
												<div class="text-default collapse-title">CLASS</div>
												<div class="collapse-item">
													{{ ccve.class }}
												</div>
											</div>
											<div class="flex mt-[10px] items-center">
												<div class="text-default collapse-title">HASH(16)</div>
												<div class="collapse-item">
													{{ ccve.hash256 }}
												</div>
											</div>
										</div>
									</div>
								</el-collapse-item>
							</el-collapse>
						</el-collapse-item>
					</el-collapse>
				</div>
			</div>
			<div v-else="scanResShow" class="scan-success border-[0.1rem] p-[2rem] h-[38rem] border-light flex items-center justify-center">
				<div class="flex flex-column items-center">
					<bt-image :src="'/firewall/secure.png'" class="w-[34.0rem] h-[30.1rem]"></bt-image>
					<span class="absolute mt-[10.5rem] text-extraLarge leading-[0.14rem]"> 当前处于【安全状态】，请继续保持！ </span>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { scanSitesVluList } from '@api/site'
import { useGlobalStore } from '@/store/global'
import { productPaymentDialog } from '@/public/index'
import { formatTime } from '@/utils/index'

type JavaVulScan = {
	title: string
	list: JavaVulScanList[]
}
type JavaVulScanList = {
	CVE: string
	class: string
	cvss: string
	desc: string
	hash256: string
	jar: string
	lib: string
	product: boolean
}

const { payment } = useGlobalStore()
const { authType } = toRefs(payment.value)
const tagType: Record<number, [any, string]> = {
	3: ['danger', '高危'],
	2: ['warning', '中危'],
	1: ['info', '低危'],
}
const scanLoad = ref('success') // 扫描状态
const scanResShow = computed(() => {
	return scanData.value.total > 0
}) // 扫描结果是否显示

const scanInfo = ref({
	scanTitle: '当前未发现风险项。',
}) // 扫描信息
const viewLoading = ref(false) // 加载状态
const scanData = ref({
	// 扫描数据
	list: [] as JavaVulScan[],
	total: 0,
	time: '',
})
const activeNames = ref(['1']) // 扫描结果

const cvssType = (num: number | string) => {
	num = Number(num)
	if (num >= 0.0 && num <= 3.9) {
		return tagType[1]
	} else if (num >= 4.0 && num <= 6.9) {
		return tagType[2]
	} else if (num >= 7.0 && num <= 10.0) {
		return tagType[3]
	} else {
		return ['default', '未知风险']
	}
}

const getScanData = async () => {
	viewLoading.value = true
	try {
		const { data } = await scanSitesVluList()
		scanData.value.list = data.list
		scanData.value.total = data.count
		scanData.value.time = formatTime(data.time)
		// 扫描结果
		scanResult(data.count)
	} finally {
		viewLoading.value = false
	}
}
/**
 * @description 扫描结果
 * @param total
 */
const scanResult = (total: number) => {
	if (total > 0) {
		scanLoad.value = 'danger'
		scanInfo.value.scanTitle = `<span class='text-danger'>${total}</span>个漏洞风险项待处理！`
	} else {
		scanLoad.value = 'success'
		scanInfo.value.scanTitle = '当前未发现风险项。'
	}
}

onMounted(getScanData)
</script>
<style lang="css" scoped>
.collapse-title {
	width: 70px;
}
.collapse-item {
	@apply text-secondary text-small w-[48rem] rounded-small;
	@apply border-lighter px-[1.6rem] border-1 bg-lighter ml-[1rem] py-[0.6rem];
	@apply flex items-center leading-[1.8rem];
}
:deep(.el-collapse) {
	border-bottom: none;
}
</style>

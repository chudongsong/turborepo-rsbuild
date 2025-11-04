<template>
	<div>
		<div class="text-large mb-6">安全风险</div>
		<div class="h-full p-2rem">
			<!-- 头部 -->
			<div class="scan-header flex items-center">
				<div class="flex items-center w-full">
					<!-- 扫描图标 -->
					<div v-if="!showAnimation" class="w-[10rem] h-[10rem] relative flex-shrink-0">
						<span class="inline-block scan-icon-img icon-img-safe"></span>
						<span class="scan-icon-img-bg"></span>
						<span class="text-iconLarge h-[4.4rem] w-[0.7rem] text-primary font-bold absolute-center">i</span>
					</div>
					<!-- 动画效果 -->
					<div v-if="showAnimation" class="w-[10rem] h-[10rem] relative flex-shrink-0">
						<p :class="'box-text w-[5.8rem] ' + scanTextClass">
							{{ scanScore }}
							<span>分</span>
						</p>
						<span :class="'scan-icon-img icon-img-' + scanOuterClass"></span>
						<span class="circle-inner"></span>
						<span :class="'circle-outer ' + scanOuterClass"></span>
						<div :class="'animate-box' + animateFlag">
							<div :class="'animate-box-left linear-' + scanOuterClass"></div>
							<div class="animate-box-right"></div>
							<div class="animate-box-bottom"></div>
						</div>
					</div>
					<!-- 扫描头部文字 -->
					<div class="w-full text-default text-extraLarge flex flex-col ml-[3rem]">
						<div class="flex items-center w-full justify-between">
							<span>
								<span v-html="scanPreText"></span>
								<span v-if="riskNum"
									>已检测到<span class="mx-[4px] text-subtitleLarge mx-[4px] text-danger">{{ riskNum }}</span
									>个风险</span
								></span
							>

							<div class="flex items-center">
								<el-button :class="'w-[9rem] ' + (scanButtonType == 'info' ? 'bg-darker' : '')" :type="scanButtonType" round v-if="!repairAutoRiskButton || !cookieRepair" @click.native="store.scanningProcess">
									{{ scanButtonType == 'info' ? '停止扫描' : '立即扫描' }}
								</el-button>
								<span round @click="store.scanningProcess" v-if="repairAutoRiskButton && cookieRepair" class="!p-[0] bt-link text-small mr-4px"> 重新扫描 </span>
								<el-button v-if="repairAutoRiskButton && cookieRepair" class="w-[9rem]" round :type="scanButtonType" @click="store.handleRepairAutoRisk"> 一键修复 </el-button>
							</div>
						</div>
						<span v-if="scanButtonType !== 'info' && !repairAutoRiskButton" class="text-base text-secondary mt-[1rem]"> 扫描后将自动修复所有可修复的风险项，并获取最新安全扫描报告 </span>
						<!-- store.handleDownloadReport -->
						<bt-link class="!p-0 !mt-[12px] w-[150px]" @click="reportPopup = true" v-if="scanButtonType !== 'info' && !repairAutoRiskButton"> >>查看当前安全扫描报告 </bt-link>
						<span v-if="scanButtonType == 'info'" class="text-base text-secondary mt-[1rem]">{{ scanItemText }}</span>
						<bt-progress v-if="scanButtonType == 'info'" class="mt-[1.6rem] h-[1rem]" :process-color="processData.processColor" :percentage="processData.processPercentage" :stroke-width="10" :show-text="false"></bt-progress>

						<span class="text-base mt-[12px] text-secondary flex items-center" v-if="repairAutoRiskButton"> 上次扫描时间：{{ lastScanTime }} </span>
						<span class="text-base mt-[12px] text-warning flex items-center" v-if="repairAutoRiskButton && cookieRepair"> 若安装了【系统加固】，请先关闭再进行一键修复 </span>
					</div>
				</div>
			</div>
			<!-- 中部选项 -->
			<div v-if="scanSelectShow" class="text-base w-full mt-[2rem] flex items-center justify-between">
				<div class="items-center flex">
					<el-checkbox @change="store.handelAllSelection" class="text-secondary font-500 text-small" v-model="allSelect" :disabled="allSelectionDis">全选</el-checkbox>
					<bt-link v-show="!isFirst" @click="store.handleRepair(false, null)" link :class="repairCheckedFlag ? 'ml-[20px] text-base mt-[1px]' : 'ml-[20px] text-base text-tertiary mt-[1px] cursor-not-allowed '">修复选中项 </bt-link>
				</div>
				<!-- 报告 -->
				<div class="flex items-center">
					<bt-link @click="isIgnoreAll = true">忽略扫描项</bt-link>
					<span class="text-tertiary mx-[1.2rem]">|</span>
					<el-button type="primary" link @click="reportPopup = true"><i class="svgtofont-icon-safe-report text-base text-primary"></i> 查看安全扫描报告</el-button>
				</div>
			</div>
			<!-- 风险列表 -->
			<div v-if="!emptyDetail" v-bt-loading="loading" :v-bt-loading:title="loadingText" :class="isShow ? 'h-[24rem]' : 'h-[34rem]'" class="scan-body my-[2rem]">
				<el-collapse v-model="activeMent" accordion>
					<div class="module-list overflow-auto" :class="isShow ? 'h-[24rem]' : 'h-[34rem]'">
						<div class="module-item text-small" v-for="(item, index) of allData" :key="`${index}`">
							<div class="module-head flex items-center h-[5.4rem] justify-between border-b-1 pr-[0.8rem] w-full">
								<div class="w-full flex items-center">
									<el-checkbox v-model="item.selection" @change="store.changeSelectValue(item.selection)" :disabled="isFirst || (is_autofix.includes(item.m_name) ? false : true)"></el-checkbox>
									<span
										class="text-small h-[2.2rem] flex items-center px-[8px] rounded-small ml-[8px] mr-[1rem]"
										:style="{
											color: levelData[item.level].color,
											backgroundColor: levelData[item.level].bg,
										}"
										>{{ levelData[item.level].text }}</span
									>
									<div
										class="w-[20rem] max-w-[20rem] truncate"
										:style="{
											color: levelData[item.level].color,
										}"
										:title="item.ps ? item.ps : item.vuln_name">
										{{ item.ps ? item.ps : item.vuln_name }}
									</div>
									<div class="text-secondary !text-small ml-[5rem] flex" v-if="is_autofix.includes(item.m_name) ? false : true">无法自动修复，请手动处理或<bt-link @click="store.onlineServiceDialog()">联系人工</bt-link></div>
								</div>

								<div class="flex items-center text-small">
									<span @click="store.handleRepair(true, item)" v-show="!isFirst && (is_autofix.includes(item.m_name) ? true : false)" class="w-[4.2rem] bt-link"> 修复<span class="text-tertiary mx-[4px]">|</span> </span>
									<span :underline="false" @click="store.handleIgnore(item, false)" class="w-[4.2rem] cursor-pointer text-tertiary"> 忽略 <span class="text-tertiary mx-4px">|</span> </span>
									<bt-link @click="store.onToggle(item, allData)" class="w-[5.4rem] flex items-center"> {{ item.show ? '折叠' : '详情' }}<i :class="'text-base text-tertiary ml-[4px] svgtofont-el-arrow-' + (item.show ? 'up' : 'down')"></i> </bt-link>
								</div>
							</div>
							<el-collapse-transition>
								<div v-show="item.show" class="px-[3rem] py-[3.2rem] bg-light">
									<div class="flex items-center">
										<div class="text-default">
											{{ item.ps ? '风险描述' : '涉及软件	' }}
										</div>
										<div v-show="item.msg" class="collapse-item" v-html="item.msg"></div>
										<div v-show="item.soft_name" class="collapse-item">
											{{ item.soft_name ? store.vulnerabilityInvolvesSoftware(item) : '' }}
										</div>
									</div>
									<div class="flex mt-[16px] items-center">
										<div>解决方案</div>
										<div v-if="item.tips" class="collapse-item flex-col !items-start">
											<p v-for="(tip, i) of item.tips" :key="i" :class="i == 0 ? '' : 'mt-[4px]'">{{ i + 1 }}、{{ tip }}</p>
										</div>
										<div v-if="item.vuln_solution" class="collapse-item">
											{{ item.vuln_solution }}
										</div>
									</div>
									<div class="flex mt-[16px] items-center" v-show="item.remind">
										<div>温馨提示</div>
										<div class="collapse-item">
											{{ item.remind }}
										</div>
									</div>
								</div>
							</el-collapse-transition>
						</div>
						<!-- <bt-dialog v-model="serviceCodeDialog" :area="20" :component="BtOnlineService" /> -->
					</div>
				</el-collapse>
			</div>
			<div v-if="emptyDetail" :class="isShow ? 'h-[32rem]' : 'h-[40rem]'" class="scan-body flex justify-center flex-col my-[4rem] relative">
				<span class="bg-light h-[3rem] w-[33%] mb-[12px]"></span>
				<span class="bg-light h-[3rem] w-full mb-[12px]" v-for="(i, index) in 4" :key="index"></span>
				<span class="bg-light h-[3rem] w-[60%] mb-[12px]"></span>
				<span class="bg-light h-[3rem] w-full mb-[12px]" v-for="(i, index) in 3" :key="index"></span>
				<span class="bg-light h-[3rem] w-[40%] mb-[12px]"></span>
				<!-- <iframe src="/project/security/report/html" frameborder="0" class="w-full h-full"></iframe> -->
			</div>
			<!-- 结果确认弹窗 -->
			<bt-dialog title="结果确认" :show-footer="false" :area="54" v-model="resultConfirm">
				<div class="flex flex-col p-[20px]">
					<span class="text-medium mb-[20px]"
						>修复结果：修复成功<span class="text-primary">{{ resultItemLength.success }}</span
						>项，修复失败<span class="text-danger"> {{ resultItemLength.failed }}</span
						>项，忽略<span class="text-secondary">{{ resultItemLength.cannot_automatically }}</span
						>项</span
					>
					<bt-table :max-height="400" :data="resultTable" :column="resultColumn"></bt-table>
					<bt-help
						:options="[
							{
								content: '如有修复失败项，请关闭当前窗口，根据解决方案手动进行修复',
							},
						]"
						list-style="none"
						class="ml-[8px] mt-[12px]"></bt-help>
				</div>
			</bt-dialog>
			<bt-dialog :title="false" :show-footer="false" :area="54" v-model="repairData.repairProgress" :showClose="false">
				<div class="p-[12px] flex flex-col items-start">
					<el-progress class="!w-full" color="var(--el-color-primary)" :text-inside="true" :stroke-width="20" :percentage="repairData.progress"></el-progress>
					<span class="mt-4px">{{ repairData.repairText }}</span>
				</div>
			</bt-dialog>
			<bt-dialog title="忽略风险项" :area="66" v-model="isIgnoreAll" :show-footer="false">
				<!-- 忽略列表 -->
				<div v-if="!emptyDetail" class="scan-body p-[2rem]">
					<el-collapse v-model="activeMentIgnore" accordion :class="`${!ignoreData.length ? '!border-none' : ''}`">
						<div class="module-list overflow-auto h-[38rem]">
							<div class="module-item text-small" v-for="(item, index) of ignoreData" :key="`${index}`">
								<div class="module-head flex items-center h-[5.4rem] justify-between border-b-1 pr-[0.8rem] w-full">
									<div class="w-full flex items-center">
										<span
											class="text-small h-[2.2rem] flex items-center px-[8px] rounded-small ml-[8px] mr-[1rem]"
											:style="{
												color: levelData[item.level].color,
												backgroundColor: levelData[item.level].bg,
											}"
											>{{ levelData[item.level].text }}</span
										>
										<div
											class="w-[36rem] max-w-[36rem] truncate"
											:style="{
												color: levelData[item.level].color,
											}"
											:title="item.ps ? item.ps : item.vuln_name">
											{{ item.ps ? item.ps : item.vuln_name }}
										</div>
									</div>

									<div class="flex items-center">
										<bt-link @click="handleIgnore(item, true)" class="w-[6.6rem]"> 移除忽略 <span class="text-tertiary mx-[4px]">|</span> </bt-link>
										<bt-link @click="onToggle(item, ignoreData)" class="w-[5.4rem] flex items-center"> {{ item.show ? '折叠' : '详情' }}<i :class="'text-base text-tertiary ml-[4px] svgtofont-el-arrow-' + (item.show ? 'up' : 'down')"></i> </bt-link>
									</div>
								</div>
								<el-collapse-transition>
									<div v-show="item.show" class="px-[3rem] py-[3.2rem] bg-light">
										<div class="flex items-center">
											<div class="text-default">
												{{ item.ps ? '风险描述' : '涉及软件' }}
											</div>
											<div v-show="item.msg" class="collapse-item" v-html="item.msg"></div>
											<div v-show="item.soft_name" class="collapse-item">
												{{ item.soft_name ? vulnerabilityInvolvesSoftware(item) : '' }}
											</div>
										</div>
										<div class="flex mt-[16px] items-center">
											<div>解决方案</div>
											<div v-if="item.tips" class="collapse-item flex-col !items-start">
												<p v-for="(tip, i) of item.tips" :key="i" :class="i == 0 ? '' : 'mt-[4px]'">{{ i + 1 }}、{{ tip }}</p>
											</div>
											<div v-if="item.vuln_solution" class="collapse-item">
												{{ item.vuln_solution }}
											</div>
										</div>
										<div class="flex mt-[16px] items-center" v-show="item.remind">
											<div>温馨提示</div>
											<div class="collapse-item">
												{{ item.remind }}
											</div>
										</div>
									</div>
								</el-collapse-transition>
							</div>
							<el-empty v-if="!ignoreData.length" description="暂无忽略的风险项"></el-empty>
						</div>
					</el-collapse>
				</div>
			</bt-dialog>

			<!-- 安全报告 -->
			<bt-dialog title="安全扫描报告" :show-footer="false" :area="[100, 80]" v-model="reportPopup">
				<!-- style="transform: scale(0.9, 1)" -->
				<div class="box">
					<!-- <iframe src="https://www.baidu.com/" frameborder="0" width="200%" height="200%"></iframe> -->
					<iframe src="/project/security/report/html" frameborder="0" width="200%" height="200%"></iframe>
				</div>
				<div class="w-full bg-white flex items-center justify-between">
					<span></span>
					<bt-link @click="handleOpenReport" class="border border-solid border-primary py-8px px-12px rounded-small mr-20px my-8px"> <i class="svgtofont-icon-ltd text-ltd mt-2px"></i> 下载报告</bt-link>
				</div>
				<!-- <el-button type="primary" @click="handleOpenReport" class="absolute bottom-[32px] right-[32px]"> <i class="svgtofont-icon-ltd text-ltd mt-2px"></i> 下载报告</el-button> -->
			</bt-dialog>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import HOME_SECURITY_RISKS_STORE from './store'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store/global'
import { productPaymentDialog } from '@/public'
import { getPDF } from '@/api/home'
import { Message } from '@/hooks/tools'

const store = HOME_SECURITY_RISKS_STORE()
const { handleIgnore, onToggle, vulnerabilityInvolvesSoftware } = store
const {
	showAnimation,
	scanScore,
	scanTextClass,
	scanOuterClass,
	animateFlag,
	scanPreText,
	riskNum,
	scanButtonType,
	repairAutoRiskButton,
	cookieRepair,
	scanItemText,
	processData,
	lastScanTime,
	scanSelectShow,
	allSelect,
	allSelectionDis,
	isFirst,
	emptyDetail,
	loading,
	loadingText,
	isShow,
	isIgnoreAll,
	ignoreData,
	activeMent,
	activeMentIgnore,
	is_autofix,
	levelData,
	allData,
	repairData,
	resultConfirm,
	resultItemLength,
	resultTable,
	resultColumn,
} = storeToRefs(store)

const { mainHeight, payment } = useGlobalStore()
// 全选-复选框
const repairCheckedFlag = computed(() => {
	return allData.value.filter((item: any) => item.selection == true).map((item: any) => item.m_name).length
})

const reportPopup = ref(false) // 安全报告弹窗

const handleOpenReport = async () => {
	if (payment.value.authType !== 'ltd') {
		productPaymentDialog({ sourceId: 68 })
		return
	}
	try {
		const res = await getPDF()
		if (!res.data.status) return Message.error(res.data.msg)
		window.open(`/download?filename=${res.data.path}`, '_blank', 'noopener,noreferrer')
	} catch (error) {
		console.log(error)
	}
}
// 监听riskNum与全局数量不一致时刷新列表
watch(riskNum, val => {
	if (val !== store.tootipTotal.risk) {
		store.getScanTotal()
	}
})
</script>

<style lang="css" scoped>
/*旋转动画*/
@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.absolute-center {
	@apply absolute top-0 left-0 bottom-0 right-0 m-auto;
}
.scan-icon-img {
	@apply absolute left-0 right-0 top-0 bottom-0 w-[58px] h-[67px] m-[auto] z-99 bg-[100%];
}

.icon-img-safe {
	background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTguMDAwMDAwIiBoZWlnaHQ9IjY3LjAwMDAwMCIgdmlld0JveD0iMCAwIDU4IDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8ZGVmcz4KCQk8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50X2xpbmVhcl8zN182NDhfMCIgeDE9IjI5LjAwMDAwMCIgeTE9IjAuMDAwMDAwIiB4Mj0iMjkuMDAwMDAwIiB5Mj0iNjcuMDAwMDAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CgkJCTxzdG9wIHN0b3AtY29sb3I9IiNCMkVFQkQiLz4KCQkJPHN0b3Agb2Zmc2V0PSIwLjk5MDU5MCIgc3RvcC1jb2xvcj0iIzYyREI3QSIgc3RvcC1vcGFjaXR5PSIwLjE3NjQ3MSIvPgoJCTwvbGluZWFyR3JhZGllbnQ+CgkJPGxpbmVhckdyYWRpZW50IGlkPSJwYWludF9saW5lYXJfMzdfNjQ5XzAiIHgxPSIyOS4wMDQxOTgiIHkxPSI3LjczMDcxMyIgeDI9IjI5LjAwNDE5OCIgeTI9IjYwLjEyODE0NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgoJCQk8c3RvcCBzdG9wLWNvbG9yPSIjOThFM0E3IiBzdG9wLW9wYWNpdHk9IjAuMjIzNTI5Ii8+CgkJCTxzdG9wIG9mZnNldD0iMS4wMDAwMDAiIHN0b3AtY29sb3I9IiM4N0UxOTgiIHN0b3Atb3BhY2l0eT0iMC45MTc2NDciLz4KCQk8L2xpbmVhckdyYWRpZW50PgoJPC9kZWZzPgoJPHBhdGggaWQ9InBhdGgiIGQ9Ik0yOS4xOTcgMEMyMi4zNjc3IDUuMzcyNDQgMTIuNTkyNyAxMC42MzQ5IDAgMTAuNjM0OUwwIDM1Ljg5ODFDMCA0Ny4xNDU4IDE2LjYwNDQgNjcgMjkuMjA0MyA2N0M0MS44MDQ0IDY3IDU4IDQ3LjEzODMgNTggMzUuODk4MUw1OCAxMC42MzQ5QzQ1LjM4NTMgMTAuNjM0OSAzNi4wMjY0IDUuMzcyNDQgMjkuMTk3IDBaTTUyLjAyOTQgMzUuNjQ3NUM1Mi4wMjk0IDQ1LjI4OTQgMzkuNjI1NCA2MC4yOTIyIDI4LjgyNjMgNjAuMjkyMkMxOC4wMiA2MC4yOTIyIDYuMjUzNzggNDUuNDEyNSA2LjI1Mzc4IDM1Ljc3MDVMNi4yNTM3OCAxNS41NTYyQzE3LjA1MjcgMTUuNTU2MiAyMy4zNDU1IDEyLjM1MjIgMjkuMjA0MyA3LjczNzU1QzM1LjA0ODYgMTIuMzM3MiA0MS4yMzA1IDE1LjQ2MTUgNTIuMDI5NCAxNS40NjE1TDUyLjAyOTQgMzUuNjQ3NVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0idXJsKCNwYWludF9saW5lYXJfMzdfNjQ4XzApIiBmaWxsLW9wYWNpdHk9IjAuMzUwMDAwIi8+Cgk8cGF0aCBpZD0icGF0aCIgZD0iTTI5LjEzNDUgNy43MzA3MUMyMy40NTU5IDEyLjg4NDUgMTUuNjYzIDE1LjQ2MTQgNS45NzkgMTUuNDYxNEw2LjM5NzA5IDM2LjUwNjNDNi44MjM0OSA0My44MDc2IDE2LjA4NDQgNjAuMTI4MiAyOC44NDM5IDYwLjEyODJDMzguODA4OCA2MC4xMjgyIDUyLjQ1NTggNDYuMzg0NSA1MS45NzU4IDM0Ljk5MDFMNTIuMDI5NCAxNS40NjE0QzQwLjE0MTggMTUuNDYxNCAzNC4zODY1IDExLjY5NTggMjkuMTM0NSA3LjczMDcxWk00Ni43NzI2IDM0Ljk5QzQ2Ljc3MjYgNDIuMTA2MiAzNy4xNDg0IDUzLjA4ODEgMjguODQzOSA1My4wODgxQzIwLjUzMzcgNTMuMDg4MSAxMS40ODUyIDQyLjEwNjIgMTEuNDg1MiAzNC45OUwxMS40ODUyIDIwLjA3MDlDMTkuNzg5OCAyMC4wNzA5IDI0LjYyODkgMTcuNzA2MiAyOS4xMzQ1IDE0LjMwMDRDMzMuNjI4OSAxNy42OTUxIDM4LjQ3MzYgMjAuMDcwOSA0Ni43NzgzIDIwLjA3MDlMNDYuNzcyNiAzNC45OVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0idXJsKCNwYWludF9saW5lYXJfMzdfNjQ5XzApIiBmaWxsLW9wYWNpdHk9IjAuNDAwMDAwIi8+Cjwvc3ZnPgo=);
}
.icon-img-danger {
	background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTguMDAwMDAwIiBoZWlnaHQ9IjY3LjAwMDAwMCIgdmlld0JveD0iMCAwIDU4IDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8ZGVmcz4KCQk8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50X2xpbmVhcl82NF85M18wIiB4MT0iMjkuMDAwMDAwIiB5MT0iMC4wMDAwMDAiIHgyPSIyOS4wMDAwMDAiIHkyPSI2Ny4wMDAwMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KCQkJPHN0b3Agc3RvcC1jb2xvcj0iI0ZGQjNCMyIgc3RvcC1vcGFjaXR5PSIwLjkxNzY0NyIvPgoJCQk8c3RvcCBvZmZzZXQ9IjEuMDAwMDAwIiBzdG9wLWNvbG9yPSIjRjc5Njk2IiBzdG9wLW9wYWNpdHk9IjAuMjMxMzczIi8+CgkJPC9saW5lYXJHcmFkaWVudD4KCQk8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50X2xpbmVhcl82NF85NF8wIiB4MT0iMjkuMDA0MTk4IiB5MT0iNy43MzA3MTMiIHgyPSIyOS4wMDQxOTgiIHkyPSI2MC4xMjgxNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KCQkJPHN0b3Agc3RvcC1jb2xvcj0iI0UzOTg5OCIgc3RvcC1vcGFjaXR5PSIwLjIyMzUyOSIvPgoJCQk8c3RvcCBvZmZzZXQ9IjEuMDAwMDAwIiBzdG9wLWNvbG9yPSIjRkZCM0IzIiBzdG9wLW9wYWNpdHk9IjAuOTE3NjQ3Ii8+CgkJPC9saW5lYXJHcmFkaWVudD4KCTwvZGVmcz4KCTxwYXRoIGlkPSJwYXRoIiBkPSJNMjkuMTk3IDBDMjIuMzY3NyA1LjM3MjQ0IDEyLjU5MjcgMTAuNjM0OSAwIDEwLjYzNDlMMCAzNS44OTgxQzAgNDcuMTQ1OCAxNi42MDQ0IDY3IDI5LjIwNDMgNjdDNDEuODA0NCA2NyA1OCA0Ny4xMzgzIDU4IDM1Ljg5ODFMNTggMTAuNjM0OUM0NS4zODUzIDEwLjYzNDkgMzYuMDI2NCA1LjM3MjQ0IDI5LjE5NyAwWk01Mi4wMjk0IDM1LjY0NzVDNTIuMDI5NCA0NS4yODk0IDM5LjYyNTQgNjAuMjkyMiAyOC44MjYzIDYwLjI5MjJDMTguMDIgNjAuMjkyMiA2IDQ1LjY0MiA2IDM2TDYgMTUuNUMxNi43OTkgMTUuNSAyMy4zNDU1IDEyLjM1MjIgMjkuMjA0MyA3LjczNzU1QzM1LjA0ODYgMTIuMzM3MiA0MS4yMzA1IDE1LjQ2MTUgNTIuMDI5NCAxNS40NjE1TDUyLjAyOTQgMzUuNjQ3NVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0idXJsKCNwYWludF9saW5lYXJfNjRfOTNfMCkiIGZpbGwtb3BhY2l0eT0iMC4zNTAwMDAiLz4KCTxwYXRoIGlkPSJwYXRoIiBkPSJNMjkuMTM0NSA3LjczMDcxQzIzLjQ1NTkgMTIuODg0NSAxNS42NjMgMTUuNDYxNCA1Ljk3OSAxNS40NjE0TDUuOTc5IDM2LjVDNi40MDU1MiA0My44MDEzIDE2LjA4NDQgNjAuMTI4MiAyOC44NDM5IDYwLjEyODJDMzguODA4OCA2MC4xMjgyIDUyLjQ1NTggNDYuMzg0NSA1MS45NzU4IDM0Ljk5MDFMNTIuMDI5NCAxNS40NjE0QzQwLjE0MTggMTUuNDYxNCAzNC4zODY1IDExLjY5NTggMjkuMTM0NSA3LjczMDcxWk00Ni43NzI2IDM0Ljk5QzQ2Ljc3MjYgNDIuMTA2MiAzNy4xNDg0IDUzLjA4ODEgMjguODQzOSA1My4wODgxQzIwLjUzMzcgNTMuMDg4MSAxMS40ODUyIDQyLjEwNjIgMTEuNDg1MiAzNC45OUwxMS40ODUyIDIwLjA3MDlDMTkuNzg5OCAyMC4wNzA5IDI0LjYyODkgMTcuNzA2MiAyOS4xMzQ1IDE0LjMwMDRDMzMuNjI4OSAxNy42OTUxIDM4LjQ3MzYgMjAuMDcwOSA0Ni43NzgzIDIwLjA3MDlMNDYuNzcyNiAzNC45OVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0idXJsKCNwYWludF9saW5lYXJfNjRfOTRfMCkiIGZpbGwtb3BhY2l0eT0iMC4zNDAwMDAiLz4KPC9zdmc+Cg==);
}

.icon-img-warn {
	background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTguMDAwMDAwIiBoZWlnaHQ9IjY3LjAwMDAwMCIgdmlld0JveD0iMCAwIDU4IDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8ZGVmcz4KCQk8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50X2xpbmVhcl83Nl81Nl8wIiB4MT0iMjkuMDAwMDAwIiB5MT0iMC4wMDAwMDAiIHgyPSIyOS4wMDAwMDAiIHkyPSI2Ny4wMDAwMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KCQkJPHN0b3Agc3RvcC1jb2xvcj0iI0YwQUQ0RSIvPgoJCQk8c3RvcCBvZmZzZXQ9IjEuMDAwMDAwIiBzdG9wLWNvbG9yPSIjRkNGMERGIi8+CgkJPC9saW5lYXJHcmFkaWVudD4KCQk8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50X2xpbmVhcl83Nl81N18wIiB4MT0iMjkuMDA0NTcyIiB5MT0iNy41MDAwMDAiIHgyPSIyOS4wMDQ1NzIiIHkyPSI2MC4zOTc0MzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KCQkJPHN0b3Agc3RvcC1jb2xvcj0iI0ZDRjBERiIvPgoJCQk8c3RvcCBvZmZzZXQ9IjEuMDAwMDAwIiBzdG9wLWNvbG9yPSIjRjBBRDRFIi8+CgkJPC9saW5lYXJHcmFkaWVudD4KCTwvZGVmcz4KCTxwYXRoIGlkPSJwYXRoIiBkPSJNMjkuMTk3IDBDMjIuMzY3NyA1LjM3MjQ0IDEyLjU5MjcgMTAuNjM0OSAwIDEwLjYzNDlMMCAzNS44OTgxQzAgNDcuMTQ1OCAxNi42MDQ0IDY3IDI5LjIwNDMgNjdDNDEuODA0NCA2NyA1OCA0Ny4xMzgzIDU4IDM1Ljg5ODFMNTggMTAuNjM0OUM0NS4zODUzIDEwLjYzNDkgMzYuMDI2NCA1LjM3MjQ0IDI5LjE5NyAwWk01Mi4wMjk0IDM1LjY0NzVDNTIuMDI5NCA0NS4yODk0IDM5LjYyNTQgNjAuMjkyMiAyOC44MjYzIDYwLjI5MjJDMTguMDIgNjAuMjkyMiA2IDQ1LjY0MiA2IDM2TDYgMTUuNUMxNi43OTkgMTUuNSAyMy4zNDU1IDEyLjM1MjIgMjkuMjA0MyA3LjczNzU1QzM1LjA0ODYgMTIuMzM3MiA0MS4yMzA1IDE1LjQ2MTUgNTIuMDI5NCAxNS40NjE1TDUyLjAyOTQgMzUuNjQ3NVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0idXJsKCNwYWludF9saW5lYXJfNzZfNTZfMCkiIGZpbGwtb3BhY2l0eT0iMC4zNTAwMDAiLz4KCTxwYXRoIGlkPSJwYXRoIiBkPSJNMjkuMTU1NSA3LjVDMjMuNDc2OSAxMi42NTM4IDE1LjY4NCAxNS41IDYgMTUuNUw2IDM2Ljc2OTNDNi40MjY1MSA0NC4wNzA2IDE2LjEwNTMgNjAuMzk3NSAyOC44NjQ5IDYwLjM5NzVDMzguODI5OCA2MC4zOTc1IDUyLjQ3NjggNDYuNjUzOCA1MS45OTY4IDM1LjI1OTRMNTEuOTk2OCAxNS41QzQwLjEwOTMgMTUuNSAzNC40MDc1IDExLjQ2NTEgMjkuMTU1NSA3LjVaTTQ2Ljc5MzYgMzUuMjU5M0M0Ni43OTM2IDQyLjM3NTUgMzcuMTY5NCA1My4zNTc0IDI4Ljg2NDkgNTMuMzU3NEMyMC41NTQ3IDUzLjM1NzQgMTEuNTA2MiA0Mi4zNzU1IDExLjUwNjIgMzUuMjU5M0wxMS41MDYyIDIwLjM0MDJDMTkuODEwOCAyMC4zNDAyIDI0LjY0OTkgMTcuOTc1NSAyOS4xNTU1IDE0LjU2OTdDMzMuNjQ5OSAxNy45NjQ0IDM4LjQ5NDYgMjAuMzQwMiA0Ni43OTkzIDIwLjM0MDJMNDYuNzkzNiAzNS4yNTkzWiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSJ1cmwoI3BhaW50X2xpbmVhcl83Nl81N18wKSIgZmlsbC1vcGFjaXR5PSIwLjM0MDAwMCIvPgo8L3N2Zz4K);
}
.icon-img-low-risk {
	background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTguMDAwMDAwIiBoZWlnaHQ9IjY3LjAwMDAwMCIgdmlld0JveD0iMCAwIDU4IDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8ZGVmcz4KCQk8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50X2xpbmVhcl82NF8yNDNfMCIgeDE9IjI5LjAwMDAwMCIgeTE9IjAuMDAwMDAwIiB4Mj0iMjkuMDAwMDAwIiB5Mj0iNjcuMDAwMDAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CgkJCTxzdG9wIHN0b3AtY29sb3I9IiNFOEQ1NDQiLz4KCQkJPHN0b3Agb2Zmc2V0PSIxLjAwMDAwMCIgc3RvcC1jb2xvcj0iI0ZGRUY3OSIgc3RvcC1vcGFjaXR5PSIwLjI3MDU4OCIvPgoJCTwvbGluZWFyR3JhZGllbnQ+CgkJPGxpbmVhckdyYWRpZW50IGlkPSJwYWludF9saW5lYXJfNjRfMjQ0XzAiIHgxPSIyOS4wMDQ1NzIiIHkxPSI3LjUwMDAwMCIgeDI9IjI5LjAwNDU3MiIgeTI9IjYwLjM5NzQzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgoJCQk8c3RvcCBzdG9wLWNvbG9yPSIjRkZFRjc5IiBzdG9wLW9wYWNpdHk9IjAuMTA5ODA0Ii8+CgkJCTxzdG9wIG9mZnNldD0iMS4wMDAwMDAiIHN0b3AtY29sb3I9IiNFOEQ1NDQiLz4KCQk8L2xpbmVhckdyYWRpZW50PgoJPC9kZWZzPgoJPHBhdGggaWQ9InBhdGgiIGQ9Ik0yOS4xOTcgMEMyMi4zNjc3IDUuMzcyNDQgMTIuNTkyNyAxMC42MzQ5IDAgMTAuNjM0OUwwIDM1Ljg5ODFDMCA0Ny4xNDU4IDE2LjYwNDQgNjcgMjkuMjA0MyA2N0M0MS44MDQ0IDY3IDU4IDQ3LjEzODMgNTggMzUuODk4MUw1OCAxMC42MzQ5QzQ1LjM4NTMgMTAuNjM0OSAzNi4wMjY0IDUuMzcyNDQgMjkuMTk3IDBaTTUyLjAyOTQgMzUuNjQ3NUM1Mi4wMjk0IDQ1LjI4OTQgMzkuNjI1NCA2MC4yOTIyIDI4LjgyNjMgNjAuMjkyMkMxOC4wMiA2MC4yOTIyIDYgNDUuNjQyIDYgMzZMNiAxNS41QzE2Ljc5OSAxNS41IDIzLjM0NTUgMTIuMzUyMiAyOS4yMDQzIDcuNzM3NTVDMzUuMDQ4NiAxMi4zMzcyIDQxLjIzMDUgMTUuNDYxNSA1Mi4wMjk0IDE1LjQ2MTVMNTIuMDI5NCAzNS42NDc1WiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSJ1cmwoI3BhaW50X2xpbmVhcl82NF8yNDNfMCkiIGZpbGwtb3BhY2l0eT0iMC4zNTAwMDAiLz4KCTxwYXRoIGlkPSJwYXRoIiBkPSJNMjkuMTU1NSA3LjVDMjMuNDc2OSAxMi42NTM4IDE1LjY4NCAxNS41IDYgMTUuNUw2IDM2Ljc2OTNDNi40MjY1MSA0NC4wNzA2IDE2LjEwNTMgNjAuMzk3NSAyOC44NjQ5IDYwLjM5NzVDMzguODI5OCA2MC4zOTc1IDUyLjQ3NjggNDYuNjUzOCA1MS45OTY4IDM1LjI1OTRMNTEuOTk2OCAxNS41QzQwLjEwOTMgMTUuNSAzNC40MDc1IDExLjQ2NTEgMjkuMTU1NSA3LjVaTTQ2Ljc5MzYgMzUuMjU5M0M0Ni43OTM2IDQyLjM3NTUgMzcuMTY5NCA1My4zNTc0IDI4Ljg2NDkgNTMuMzU3NEMyMC41NTQ3IDUzLjM1NzQgMTEuNTA2MiA0Mi4zNzU1IDExLjUwNjIgMzUuMjU5M0wxMS41MDYyIDIwLjM0MDJDMTkuODEwOCAyMC4zNDAyIDI0LjY0OTkgMTcuOTc1NSAyOS4xNTU1IDE0LjU2OTdDMzMuNjQ5OSAxNy45NjQ0IDM4LjQ5NDYgMjAuMzQwMiA0Ni43OTkzIDIwLjM0MDJMNDYuNzkzNiAzNS4yNTkzWiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSJ1cmwoI3BhaW50X2xpbmVhcl82NF8yNDRfMCkiIGZpbGwtb3BhY2l0eT0iMC4zNDAwMDAiLz4KPC9zdmc+Cg==);
}
.scan-icon-img-bg {
	@apply absolute left-0 right-0 top-0 bottom-0 w-[100px] h-[100px] z-50 m-[auto] inline-block rounded-circle;
	background: radial-gradient(50% 50% at 50% 50%, rgba(var(--el-color-black-rgb), 0.2) 54.962%, rgba(var(--el-color-primary-rgb), 0.2) 100%);
}

.animate-box {
	@apply relative w-[100px] h-[100px];
	animation: rotate 3s linear infinite;
}

.animate-box-left {
	@apply z-55 w-[50px] h-[100px];
	border-radius: var(--el-border-radius-extra-round) 0 0 var(--el-border-radius-extra-round);
}

.linear-safe {
	background: linear-gradient(var(--el-color-primary), var(--el-color-white));
}

.linear-danger {
	background: linear-gradient(var(--el-color-danger), var(--el-color-white));
}

.linear-warn {
	background: linear-gradient(var(--el-color-warning), var(--el-color-white));
}

.linear-risk {
	background: linear-gradient(var(--el-color-warning-light-5), var(--el-color-white));
}

.animate-box-right {
	@apply absolute z-55 bg-white left-[50%] h-[100px];
	border-radius: 0 50px 50px 0;
}

.animate-box-bottom {
	@apply absolute z-2 top-[0.4rem] left-[0.4rem] w-[92px] h-[92px];
	border-radius: var(--el-border-radius-circle);
	background: radial-gradient(50% 50% at 50% 50%, rgba(var(--el-color-black-rgb), 0.2) 54.962%, rgba(var(--el-color-primary-rgb), 0.2) 100%);
}

.circle-inner {
	@apply bg-white inline-block rounded-circle w-[96px] h-[96px]  absolute left-0 top-0 bottom-0 right-0 m-[auto] z-[55];
}
.circle-outer {
	@apply absolute left-0 top-0 bottom-0 right-0 m-[auto] rounded-circle w-[100px] h-[100px] z-[55];
}
.safe {
	background: radial-gradient(50% 50% at 50% 50%, rgba(var(--el-color-black-rgb), 0.2) 54.962%, rgba(var(--el-color-primary-rgb), 0.2) 100%);
}
.danger {
	background: radial-gradient(50% 50% at 50% 50%, rgba(var(--el-color-black-rgb), 0.2) 54.962%, rgba(var(--el-color-danger-rgb), 0.2) 100%);
}
.risk {
	background: radial-gradient(50% 50% at 50% 50%, rgba(240, 173, 78, 0) 58.015%, rgba(var(--el-color-warning-rgb), 0.2) 100%);
}
.warn {
	background: radial-gradient(50% 50% at 50% 50%, rgba(240, 173, 78, 0) 58.015%, rgba(var(--el-color-warning-rgb), 0.2) 100%);
}
.box-text {
	@apply text-iconLarge font-700 leading-18 flex items-center justify-center absolute left-0 right-0 top-0 bottom-0 m-[auto] z-[99] w-[78px] h-[50px];
}
.box-text span {
	@apply text-large mt-[16px];
}

.module-list::-webkit-scrollbar {
	@apply w-[10px] h-[5px];
}
.module-list::-webkit-scrollbar-thumb {
	box-shadow: inset 0 0 0.5rem rgb(0 0 0 / 20%);
	background-color: var(--el-base-tertiary);
}
.module-item {
	font-size: var(--el-font-size-small);
}
.module-head {
	border-bottom-color: var(--el-color-border-dark-tertiaryer);
	color: var(--el-color-text-secondary);
	transition: background 0.3s;
}
.module-head:hover {
	background-color: var(--el-fill-color-light);
}
.module-body {
	@apply py-[1rem] pl-[2.5rem] pr-[1.5rem] border-b-[1px] border-light text-secondary;
}
.collapse-item {
	@apply text-secondary text-small w-[48rem] rounded-small;
	@apply border-lighter px-[1.6rem] border-1 bg-lighter ml-[1rem] py-[0.6rem];
	@apply flex items-center leading-[1.8rem];
}
:deep(.el-collapse) {
	border-bottom: none;
}
:deep(.el-button--primary:hover, .el-button--primary:focus) {
	background: var(--el-color-primary-dark-2);
	border-color: var(--el-color-primary-dark-2);
}
:deep(.el-button--text:hover, .el-button--text:focus) {
	color: var(--el-color-primary-dark-2);
}
.scan-recommend-body {
	@apply grid grid-cols-3 gap-[1.6rem] mt-[1.6rem];
}

.scan-recommend-body-box {
	@apply rounded-small p-[2rem] border-[1px] border-lighter bg-white leading-[2.2rem] cursor-pointer;
}

.scan-recommend-body-box-title {
	@apply text-secondary font-bold text-base;
}

.scan-recommend-body-box-desc {
	@apply text-tertiary mt-[4px];
}

.scan-recommend-body-box:hover {
	box-shadow: 2px 0px 4px 0px rgba(var(--el-color-black-rgb), 0.1);
}

:deep(.el-progress-bar__innerText) {
	color: var(--el-color-white) !important;
}

:deep(.el-loading-spinner) {
	flex-direction: column;
}

:deep(.el-loading-text) {
	color: var(--el-color-primary);
}

.box {
	position: relative;
	overflow: hidden;
	width: 1000px;
	height: 740px;
	margin: 0 auto;
}

iframe {
	position: absolute;
	transform: scale(0.6);
	left: -520px;
	top: -295px;
}
.scan-type {
	@apply mr-[16px] px-[20px] h-[30px] leading-[30px] text-small cursor-pointer bg-darker rounded-small;
}
.scan-type.on {
	@apply bg-primary text-white;
}
</style>

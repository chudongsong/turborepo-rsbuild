<template>
	<!-- 面板日志 -->
	<div class="content_box module-ui">
		<div v-show="payment.authType === 'ltd'" class="relative">
			<!-- 开启 -->
			<div class="monitor mb-1rem">
				<span class="mr-8px align-middle">开启日报</span>
				<el-switch v-model="dailyValue" @change="store.changeDailyStatus"></el-switch>
			</div>
			<template v-if="selectData.length">
				<div class="box-select">
					<span>选择日期：</span>
					<bt-select v-model="selectValue" @click.stop :options="selectData" class="!w-[12.02rem]" @change="store.getPanelDailyDatas"></bt-select>
				</div>
				<div class="box-body">
					<div class="body_top">
						<span class="top_status" :style="{ color: topStatusColor }">{{ topStatus }}</span>
						<span class="watch_time">监测时间：{{ watchTime }}</span>
						<span class="text-left mb-[1.6rem]">健康信息提醒：</span>
						<div class="msg_box">
							<span v-for="(item, index) in summary" :key="index">●{{ item }}</span>
						</div>
					</div>
					<div class="w-[95rem] mt-[2rem]">
						<div class="bottom_item" v-for="(item, index) in tableList" :key="index">
							<div class="item_name">
								<span
									v-if="item.is_status"
									class="mr-[.5rem]"
									:style="{
										background: item.name == '空间存储状态' ? 'var(--el-color-primary)' : item.name == '数据库' || item.name == '网站' ? (item.data.length == 0 && item.data_excess.length == 0 ? 'var(--el-color-primary)' : 'red') : item.data.ex == 0 ? 'var(--el-color-primary)' : 'red',
									}"></span
								>{{ item.name }}
							</div>
							<div class="item_value" v-if="item.is_status" :style="{ width: item.have_data_excess ? '24rem' : 'auto' }">
								<template v-if="item.name !== '空间存储状态'">
									{{ item.name == '数据库' || item.name == '网站' ? (item.data.length == 0 ? '未监测到异常' : item.data.length + '次') : item.data.ex == 0 ? '未监测到异常' : item.data.ex + '次' }}
								</template>
								<!-- <div>{{ item.data }}</div> -->
								<el-popover v-if="store.filterType(item)" width="420" placement="bottom" trigger="hover" popper-class="max_over">
									<bt-table ref="menuTable1" :max-height="300" :data="dataList" :column="tableColumn"></bt-table>
									<span v-if="item.data.detail?.check_time" class="!py-[0.8rem] pl-[0.8rem] inline-block border border-light border-t-0 w-full">检查时间：{{ item.data.detail?.check_time }}</span>
									<template #reference>
										<span class="bt-link" @mouseover="store.goDetail(item.data, item.name)"> &nbsp;查看详情</span>
									</template>
								</el-popover>
							</div>
							<div class="item_value" :style="{ width: item.is_excess ? '24rem' : 'auto' }" v-else>
								{{ item.value }}
							</div>
							<div class="item_excess" v-if="item.is_excess">{{ item.excess }}</div>
							<div class="item_excess" v-if="item.is_status && item.data_excess">
								{{ item.have_data_excess && item.data_excess.length ? item.data_excess.length + '次' : '未监测到异常' }}
								<el-popover v-if="item.have_data_excess && item.data_excess.length" width="350" placement="bottom" trigger="hover" popper-class="max_over">
									<bt-table ref="menuTable2" :max-height="300" :data="dataList" :column="tableColumn"></bt-table>
									<template #reference>
										<span class="bt-link" @mouseover="store.goDetail(item.data_excess, item.name)"> &nbsp;查看详情</span>
									</template>
								</el-popover>
							</div>
						</div>
						<span class="bottom_tips">更多安全风险详情请到【首页-安全风险】中进行查看 <br />在系统监控开启的情况下，日报会记录服务器每天运行的异常信息，协助管理员分析服务器前一天是否运行正常。</span>
					</div>
				</div>
			</template>
			<el-empty v-else :image-size="200" description="面板日报暂无数据"></el-empty>
		</div>
		<bt-product-introduce v-show="payment.authType !== 'ltd'" :data="productData" class="px-[20%] my-[8rem]"></bt-product-introduce>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@store/global'
import { storeToRefs } from 'pinia'
import CONTROL_STORE from '@control/store'

const { payment } = useGlobalStore()

const store = CONTROL_STORE()
const { selectData, dataList, tableList, selectValue, topStatus, topStatusColor, watchTime, summary, tableColumn, productData, dailyValue } = storeToRefs(store)

// // 避免闪动
// const isAuthType = ref(true)
// watch(
// 	() => payment.value,
// 	val => {
// 		isAuthType.value = val.authType === 'ltd'
// 	}
// )

onMounted(async () => {
	await store.getDailyStatus()
	// dailyValue.value为true时获取数据
	if (dailyValue.value) {
		store.getPanelDailyInfoLists()
	}
})

onUnmounted(store.$reset)
</script>

<style lang="css" scoped>
.content_box {
	@apply w-full relative;
}
.box-select {
	@apply font-[1.4rem] absolute flex items-center;
}
.box-body {
	@apply flex flex-col justify-center items-center;
}
.body_top {
	@apply flex flex-col w-[70rem] text-black;
}
.top_status {
	@apply text-large46 text-center text-supplement;
}
.watch_time {
	@apply text-center text-base mb-[2rem] mt-[1rem];
}
.msg_box {
	@apply flex flex-wrap text-left w-full;
}
.msg_box span {
	@apply mb-[1rem] font-bold w-[49%] text-dangerDark text-base;
}
.bottom_item {
	@apply w-full h-[3.4rem] border-[0.1rem] border-dark border-b-0 flex text-left;
}
.bottom_item:nth-child(1),
.bottom_item:nth-child(5),
.bottom_item:nth-child(14),
.bottom_item:nth-child(17),
.bottom_item:nth-child(20) {
	@apply bg-light font-bold;
}
.bottom_item:last-of-type {
	@apply border-b-[0.1rem] border-dark;
}
.item_name {
	@apply w-[11rem] border-r-[0.1rem] border-dark pl-[1rem] flex items-center;
}
.item_name span {
	@apply bg-primary w-[0.5rem] h-[0.5rem] rounded-round;
}
.item_value {
	@apply flex items-center pl-[1rem];
}
.item_excess {
	@apply flex items-center pl-[1rem] border-l-[0.1rem] border-dark;
}
.bottom_tips {
	@apply font-[1.2rem] text-secondary mt-[2rem] block text-left leading-[22px];
}
.max_over {
	max-height: 30rem !important;
	overflow-y: auto !important;
	padding: 0 !important;
}
</style>

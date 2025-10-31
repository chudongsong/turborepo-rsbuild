<template>
	<section>
		<el-row :span="24">
			<el-col :span="24">
				<el-card :body-style="{ padding: '0', display: 'flex', height: '12rem' }" class="h-[12rem] text-small module-box bt-waf-card" shadow="never">
					<div class="flex flex-1">
						<div class="w-[20%] flex flex-col bg-white py-[28px] px-[1.8rem]">
							<span class="text-tertiary text-base text-center leading-[2rem]">总拦截</span>
							<span class="text-secondary text-iconLarge text-center font-bold leading-[4.2rem]">0</span>
						</div>
						<div class="w-[20%] flex flex-col bg-white py-[28px] px-[1.8rem]">
							<span class="text-tertiary text-base text-center leading-[2rem]">24小时拦截</span>
							<span class="text-secondary text-iconLarge text-center font-bold leading-[4.2rem]">0</span>
						</div>
						<div class="w-[20%] flex flex-col ng-waf-logo relative h-[100%]">
							<div class="logo-mask absolute left-[50%] w-[10rem] h-[12rem] ml-[-5rem] z-0"></div>
							<div class="ng-logo w-[10rem] h-[12rem] absolute left-[50%] ml-[-5rem] z-1"></div>
						</div>
						<div class="w-[20%] flex flex-col bg-white py-[28px] px-[1.8rem]">
							<span class="text-tertiary text-base text-center leading-[2rem]">CC拦截</span>
							<span class="text-secondary text-iconLarge text-center font-bold leading-[4.2rem]">0</span>
						</div>
						<div class="w-[20%] flex flex-col bg-white py-[28px] px-[1.8rem]">
							<span class="text-tertiary text-base text-center leading-[2rem]">隔离木马数</span>
							<span class="text-secondary text-iconLarge text-center font-bold leading-[4.2rem]">0</span>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>
		<el-row :gutter="15" :span="24">
			<el-col :md="12" :sm="24" :span="12" :xs="24">
				<!-- 封锁IP列表 -->
				<block-ip-table class="h-[36rem] mb-0"></block-ip-table>
			</el-col>
			<el-col :md="12" :sm="24" :span="12" :xs="24">
				<!-- 攻击地图 -->
				<attack-map-world class="h-[36rem] mb-0"></attack-map-world>
			</el-col>
		</el-row>
		<el-row :gutter="15" :span="24" class="mt-[16px]">
			<el-col :md="8" :sm="24" :span="8" :xs="24">
				<!-- 7天拦截趋势图 -->
				<tendency-chart class="h-[34rem] mb-0"></tendency-chart>
			</el-col>
			<el-col :md="8" :sm="24" :span="8" :xs="24">
				<!-- 今日网站拦截TOP5 -->
				<ranking-table class="h-[34rem] mb-0"></ranking-table>
			</el-col>
			<el-col :md="8" :sm="24" :span="8" :xs="24">
				<!-- 防御动态 -->
				<dynamic-table class="h-[34rem] mb-0"></dynamic-table>
			</el-col>
		</el-row>
	</section>
</template>

<script lang="ts" setup>
const { proxy: vm }: any = getCurrentInstance() // 获取vue实例对象
</script>
<style lang="css">
.bt-waf-card {
	background-color: transparent;
}

.bt-waf.el-tabs.bt-tabs-nav .el-tabs__content .el-tab-pane {
	padding: 0;
	background-color: transparent;
}

.ng-waf-logo {
	background-image: url(/static/images/btwaf/dun_bg.png);
	background-repeat: no-repeat;
	background-position: center;
}

.logo-mask {
	background-image: url(/static/images/btwaf/ng-logo1.png);
	background-repeat: no-repeat;
	background-position: center;
	-webkit-animation-name: scaleDraw;
	-webkit-animation-timing-function: ease-in-out;
	-webkit-animation-iteration-count: infinite;
	-webkit-animation-duration: 2.5s;
}

.ng-logo {
	background-image: url(/static/images/btwaf/ng-logo1.png);
	background-repeat: no-repeat;
	background-position: center;
}

@keyframes scaleDraw {
	0% {
		transform: scale(1);
		opacity: 0.2;
	}
	100% {
		transform: scale(1.6);
		opacity: 0;
	}
}
</style>

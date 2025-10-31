<template>
	<div class="h-auto" v-if="recommendShow && !(aliyunEcsLtd)">
		<!-- 购买后 -->
		<div class="advantage-view" v-if="authType === 'ltd'" @mouseover="limitTimeShow = true" @mouseleave="limitTimeShow = false">
			<div class="absolute left-0 right-0 flex items-center px-[16px]">
				<!-- 到期时间 -->
				<div class="flex items-center text-base mr-[3rem] flex-shrink-0 cursor-pointer" @click="store.openProduct(28)">
					<div class="ltd-privilege-title flex flex-shrink-0 items-center ltd-title-edit">
						<span class="text-base pl-[2.4rem] font-bold !text-[#fff]"> 企业版 </span>
					</div>
					<!-- <span class="ml-[8px]">到期时间：</span> -->
					<span
						:class="{
							'text-danger': authRemainingDays < 7,
							'text-warning': authRemainingDays >= 7,
							'ml-[8px]': true,
							'font-bold': true,
						}"
						>{{ formatTime(authExpirationTime, 'yyyy-MM-dd') }}</span
					>
					<bt-link class="ml-[8px]" size="13px">续费</bt-link>
				</div>
				<!-- icon -->
				<div class="advantage-list">
					<div class="advantage-item" v-for="(item, index) in newAdvantageList" :key="index">
						<bt-svg :name="`tools-${item[0]}`" size="20" class="mr-[4px]" />
						<span class="text-tertiary text-base">{{ item[1] }}</span>
					</div>
				</div>
			</div>
			<div v-show="limitTimeShow" class="day-not-display" @click="store.setRecommendHide(3)"><i class="svgtofont-el-close"></i><span>近3天不再显示</span></div>
		</div>

		<!-- 购买前  -->
		<div class="advantage-view" v-else-if="authType === 'free'" @mouseover="limitTimeShow = true" @mouseleave="limitTimeShow = false">
			<div class="absolute left-0 right-0 flex items-center px-[16px]">
				<div class="flex items-center">
					<div class="relative mr-[2rem]">
						<button class="product-payment-btn" @click="store.openProduct(27)">
							<!-- <span class="ml-[1.2rem text-base cursor-pointer"> 立即升级 </span> -->
							<span class="ml-[1.2rem text-base"> 立即开通 </span>
						</button>
					</div>
					<!-- <bt-image src="/advantage/ltd-privilege.svg" class="flex flex-shrink-0 w-[10rem] mx-[16px]" /> -->
					<div class="ltd-privilege-title flex flex-shrink-0 items-center mr-[8px]">
						<span class="text-medium ml-[.4rem] mr-[2rem] pl-[3rem] font-bold"> 企业版VIP特权 </span>
					</div>
				</div>
				<div class="advantage-list">
					<div class="advantage-item" v-for="(item, index) in newAdvantageList" :key="index">
						<bt-svg :name="`tools-${item[0]}`" size="20" class="mr-[4px]" />
						<span class="text-tertiary text-base">{{ item[1] }}</span>
					</div>
				</div>
			</div>
			<div v-show="limitTimeShow" class="day-not-display" @click="store.setRecommendHide(1)"><i class="svgtofont-el-close"></i>近24小时不再显示</div>
		</div>

		<bt-dialog v-model="showPrivilege" :area="96">
			<div class="p-[24px] flex justify-center flex-col items-center">
				<bt-image src="/advantage/privilege-contrast.png"></bt-image>
				<div class="flex items-center mt-[20px]">
					<!-- 功能特权 -->
					<div class="flex-col items-center border border-base justify-center w-[22rem]">
						<p class="text-extraLarge text-default font-bold h-[9.4rem] leading-[9.4rem] text-center">功能特权</p>
						<ul class="flex flex-col text-base text-secondary function-text">
							<li class="px-[24px] h-[4rem] leading-[4rem]" v-for="(pri, index) in privilegeList" :key="index">
								{{ pri }}
							</li>
						</ul>
					</div>
					<!-- 专业版 -->
					<div class="flex-col border border-[var(--bt-pro-border-color)] items-center bg-[var(--bt-pro-bg-color)] justify-center w-[22rem]">
						<div class="text-extraLarge text-default font-medium h-[9.4rem] leading-[9.4rem] text-center">
							<p><bt-image src="/advantage/privilege-pro.svg" class="mr-[8px]"></bt-image>专业版</p>
						</div>
						<ul class="flex flex-col text-base text-secondary pro-text">
							<li class="px-[24px] h-[4rem] leading-[4rem] text-center" v-for="(pro, index) in proPrivilegeList" :key="index">
								<i v-if="!pro" class="svgtofont-el-close text-danger text-large font-bold"></i>
								<i v-else class="svgtofont-el-check text-[var(--el-color-warning-light-3)] text-large font-bold"></i>
							</li>
						</ul>
					</div>
					<!-- 企业版与运维版 -->
					<div class="w-[22rem] bg-[var(--bt-ltd-bg-color)] flex-col relative" :class="index ? '' : 'border-2 border-darkSecondary h-[64.6rem] shadow'" v-for="(item_t, index) in 2" :key="index">
						<span class="recommend-left" v-if="index === 0"></span>
						<div class="text-extraLarge flex flex-col justify-center items-center" :class="index ? ' h-[9.4rem]' : ' h-[11rem]'">
							<div class="text-[var(--bt-ltd-sub-bg-color)] flex justify-center font-bold">
								<bt-image class="mr-[8px]" src="/advantage/privilege-diamond.svg"></bt-image>
								<span :class="index ? '' : 'linear'">{{ index ? '企业运维托管' : '企业版' }}</span>
							</div>
							<button class="px-[20px] py-[4px]" :class="index ? 'linear text-border privilege-button font-bold' : 'button-linear privilege-button'" @click="store.openProduct(45)">立即购买</button>
						</div>
						<ul class="flex flex-col text-base text-secondary ltd-text">
							<template v-if="index === 0">
								<li v-for="(ltd, index_ltd) in ltdPrivilegeList" :key="index_ltd">
									<i v-if="!ltd" class="svgtofont-el-close text-danger text-large font-bold"></i>
									<i v-else class="svgtofont-el-check text-[var(--el-color-warning-light-3)] text-large font-bold"></i>
								</li>
							</template>

							<template v-if="index != 0">
								<li v-for="(plus, index_plus) in plusPrivilegeList" :key="index_plus">
									<i v-if="!plus" class="svgtofont-el-close text-danger text-large font-bold"></i>
									<i v-if="plus" class="svgtofont-el-check text-[var(--el-color-warning-light-3)] text-large font-bold"></i>
								</li>
							</template>
						</ul>
					</div>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { formatTime } from '@utils/index'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store/global'
import HOME_RECOMMEND_STORE from './store'
const { forceLtd, aliyunEcsLtd, authRemainingDays } = useGlobalStore()
const store = HOME_RECOMMEND_STORE()
const { plusPrivilegeList, ltdPrivilegeList, proPrivilegeList, privilegeList, limitTimeShow, advantageList, newAdvantageList, recommendShow, showPrivilege, authType, authExpirationTime } = storeToRefs(store)

onMounted(() => {
	store.checkRecommendHide() // 检查首页推荐弹窗是否显示
})
</script>

<style lang="css" scoped>
.advantage-view {
	@apply w-full h-[5rem] relative flex rounded-extraLarge overflow-hidden p-[1rem] flex items-center;
	background-color: rgba(var(--el-color-white-rgb), var(--bt-main-content-opacity));
	box-shadow: 0 0 6px 0 rgba(var(--bt-main-shadow-color), var(--bt-main-shadow-opacity));
}

.advantage-list {
	@apply flex items-center text-small truncate;
}

.advantage-item {
	@apply flex items-center mr-[1.6rem];
}

.danger-tips {
	background-color: var(--el-color-danger-light-9);
	border-color: var(--el-color-danger-light-7);
	margin-top: 15px;
	font-size: var(--el-font-size-base);
	display: flex;
	align-items: center;
	color: var(--el-color-danger);
	min-height: 46px;
	margin-bottom: 15px;
	box-shadow: 0 0 2px 0 rgba(var(--el-color-black-rgb), 0.2);
}

.ad-bg {
	background-image: url('/static/images/advantage/pay-bg.svg');
	background-size: 120%;
	background-position: center;
	background-repeat: no-repeat;
}
.recommend-button {
	@apply bg-no-repeat bg-center bg-cover;
	background-image: url('/static/images/advantage/button-recommend.svg');
}

.absolute-image .el-image {
	@apply absolute;
}

.function-text li:nth-child(even) {
	@apply bg-lighter;
}

.pro-text li:nth-child(even) {
	@apply bg-[var(--bt-pro-bg-color)];
}

.ltd-text li:nth-child(even) {
	@apply bg-darkPrimary;
}

.ltd-text li {
	@apply px-[24px] h-[4rem] leading-[4rem] text-center;
}

.shadow {
	box-shadow: 0px 4px 10px rgb(0 0 0 / 55%);
}
.linear {
	background: linear-gradient(180deg, var(--bt-ltd-border-color) 0%, var(--bt-ltd-light-color) 47%, var(--bt-ltd-sub-color) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-fill-color: transparent;
}
.product-payment-btn {
	@apply w-[10rem] h-[3rem] rounded-extraLarge px-[1.6rem] border-solid border-[1px] border-[var(--bt-ltd-color-linear-2)];
	color: var(--bt-ltd-light-color);
	background: linear-gradient(90deg, var(--bt-ltd-color-linear-1) 0%, var(--bt-ltd-color-linear-2) 100%);
}
.product-payment-btn:hover {
	opacity: 0.85;
}
.ltd-privilege-title {
	height: 20px;
	min-width: 32px;
	background: url('/static/images/home/home-vip-pop-img.png') no-repeat left 8px top 0/20px 20px;
}
.ltd-privilege-title > span {
	/* background: linear-gradient(90deg, var(--bt-ltd-border-color) 0%, var(--bt-ltd-light-color) 47%, var(--bt-ltd-sub-color) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent; */
	background-clip: text;
}
.ltd-title-edit {
	background-size: 18px 18px;
	border-radius: var(--el-border-radius-round);
	padding-right: 12px;
	padding-left: 4px;
	line-height: 22px;
	background:
		url('/static/images/home/home-vip-pop-img.png') no-repeat left 8px top 3px/15px 15px,
		linear-gradient(90deg, var(--bt-ltd-color-linear-1) 0%, var(--bt-ltd-color-linear-2) 50%, var(--bt-ltd-color-linear-1) 100%);
	background-position: left 8px top 3px;
}
.ltd-title-edit > span {
	font-size: var(--el-font-size-small);
	background: none;
	color: var(--el-color-text-disabled);
	font-weight: normal;
}
.recommend-left {
	@apply absolute -left-[.4rem] -top-[.4rem] h-[6.8rem] w-[6.8rem];
	background-image: url('/static/images/advantage/recommend-left.svg');
	background-size: 100%;
	background-repeat: no-repeat;
	background-position: center;
}
.day-not-display {
	position: absolute;
	top: 3px;
	right: 3px;
	background: var(--el-fill-color-dark);
	color: var(--el-base-tertiary);
	line-height: 20px;
	text-align: center;
	border-radius: var(--el-border-radius-small);
	padding: 0 8px;
	cursor: pointer;
	display: flex;
}

@media screen and (max-width: 1400px) {
	.ltd-privilege-title > span {
		display: none;
	}
}
</style>

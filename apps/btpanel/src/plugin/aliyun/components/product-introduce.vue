<template>
	<span class="free-ex-tag" @click="props.dependencies.custom.openPay"> <span class="ali-icon"></span>阿里云专版特权，宝塔产品享8折优惠，立即前往 </span>
</template>

<script lang="ts" setup>
interface Props {
	dependencies: AnyObject
}

const props: any = withDefaults(defineProps<Props>(), {
	dependencies: () => ({}),
})
</script>

<style scoped>
.free-ex-tag {
	@apply text-small text-warningDark py-[.15rem] px-[.5rem] cursor-pointer font-bold mr-[2rem];
	border-radius: var(--el-border-radius-base);
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--el-color-warning);
}
.free-ex-tag:hover {
	@apply bg-[var(--el-color-warning-light-8)];
}
.ali-icon {
	width: 2rem;
	height: 2rem;
	display: inline-block;
	background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' class='icon' viewBox='0 0 1653 1024'%3E%3Cpath fill='%23F76E05' d='M344.862 721.83a57.857 57.857 0 0 1-46.133-56.073V357.356a59.896 59.896 0 0 1 46.133-56.073l286.354-62.063 30.076-122.723H328.805A210.783 210.783 0 0 0 116.62 327.28v364.474a213.714 213.714 0 0 0 212.185 212.313h332.487l-30.076-122.214zm833.193-605.333H843.02l30.585 122.723 286.355 62.063a57.985 57.985 0 0 1 46.133 56.073v308.4a60.151 60.151 0 0 1-46.133 56.074l-286.355 62.062-30.585 122.724h335.036a212.44 212.44 0 0 0 212.95-212.823V327.28a213.332 213.332 0 0 0-212.95-210.783'/%3E%3Cpath fill='%23F76E05' d='M631.216 495.5h244.3v30.075h-244.3z'/%3E%3C/svg%3E");
	background-size: contain;
	background-repeat: no-repeat;
}
</style>

<template>
	<div>
		<div v-if="noticeStatus" class="module-ui !p-0 mx-[1.2rem] mb-[1.2rem]">
			<el-carousel class="playTips" height="5.6rem" direction="vertical">
				<!-- 内存 -->
				<el-carousel-item v-if="memoryStatus" :key="1">
					<i class="svgtofont-el-warning-filled mr-[8px] text-large"></i>
					<span class="mr-[16px]">当前可用物理内存小于64M，这可能导致MySQL自动停止，站点502等错误，请尝试释放内存！</span>
					<bt-link type="info" title="该风险不可忽略，请尽快处理" class="align-middle mr-[16px]" size="1.4rem" :disabled="true" href="javascript:;">[ 不可忽略 ]</bt-link>
					<!-- 立即清理 -->
					<bt-link @click="store.onClear" class="align-middle flex items-center" size="1.4rem">[ 立即清理 ]</bt-link>
				</el-carousel-item>

				<!-- 用户名 -->
				<el-carousel-item v-if="usernameStatus" :key="2">
					<i class="svgtofont-el-warning-filled mr-[8px] text-large"></i>
					<div class="mr-[16px]">当前面板用户为admin,这可能为面板安全带来风险！</div>
					<bt-link type="info" title="该风险不可忽略，请尽快处理" class="align-middle mr-[16px]" size="1.4rem" :disabled="true" href="javascript:;">[ 不可忽略 ]</bt-link>
					<!-- 立即修复 -->
					<bt-link @click="editorUserDialog" class="align-middle flex items-center" size="1.4rem">[ 立即修复 ] </bt-link>
				</el-carousel-item>

				<!-- 端口号 -->
				<el-carousel-item v-if="portStatus" :key="3">
					<i class="svgtofont-el-warning-filled mr-[8px] text-large"></i>
					<div class="mr-[16px]">当前面板使用的是默认端口[8888]，可能存在入侵风险，请到面板设置中修改面板端口！</div>
					<bt-link type="info" title="该风险可忽略，但存在一定的风险，推荐修改面板端口" class="align-middle mr-[16px]" size="1.4rem" @click="store.setNoticeStatus('port', '面板端口')">[ 点击忽略 ]</bt-link>
					<bt-link @click="store.editPortInfo" target="_self" class="align-middle flex items-center" size="1.4rem">[ 立即修复 ] </bt-link>
				</el-carousel-item>

				<!-- http警告 -->
				<el-carousel-item v-if="httpsStatus" :key="4">
					<i class="svgtofont-el-warning-filled mr-[8px] text-large"></i>
					<div class="mr-[16px]">警告！当前面板使用HTTP访问，可能存在被窃取敏感信息风险，请立即开启【面板SSL】。</div>
					<bt-link type="info" title="该风险可忽略，但存在一定的风险，推荐开启面板SSL访问" class="align-middle mr-[16px]" :disabled="true" size="1.4rem" @click="store.setNoticeStatus('https', '面板SSL')">[ 点击忽略 ]</bt-link>
					<bt-link @click="store.jumpConfig" class="align-middle flex items-center" size="1.4rem">[ 立即处理 ]</bt-link>
				</el-carousel-item>

				<!-- 磁盘占用警告 -->
				<el-carousel-item v-if="diskFullStatus" :key="5">
					<i class="svgtofont-el-warning-filled mr-8px text-large"></i>
					<div class="mr-16px">警告：检测到磁盘可用空间不足，无法访问面板数据库，请前往文件管理清理</div>
					<!-- 跳转文件 -->
					<bt-link @click="store.jumpFiles" class="align-middle" size="1.4rem">[ 立即前往 ]</bt-link>
				</el-carousel-item>

				<el-carousel-item v-if="inodeFullStatus" :key="6">
					<i class="svgtofont-el-warning-filled mr-8px text-large"></i>
					<div class="mr-16px">
						警告：检测到磁盘【
						<div class="inline-block" :title="inodePath.join('\n')">
							<span v-for="(path, index) in inodePath" :key="index">{{ path }}</span>
						</div>
						】Inode使用率超过90%，可用空间不足，请前往文件管理清理
					</div>
					<!-- 跳转文件 -->
					<bt-link @click="store.jumpFiles" class="align-middle" size="1.4rem">[ 立即前往 ]</bt-link>
				</el-carousel-item>
			</el-carousel>
		</div>
		<div id="extension" :class="hasOtherExtension ? 'module-ui !p-0 mx-[1.2rem] mb-[1.2rem]' : ''"></div>
	</div>
</template>
<script setup lang="ts">
import { editorUserDialog } from '@/public/index'
import HOME_NOTICE_STORE from './store'
import { storeToRefs } from 'pinia'
import { isBoolean } from '@/utils'

const store = HOME_NOTICE_STORE()
const { noticeStatus, memoryStatus, usernameStatus, portStatus, httpsStatus, diskFullStatus, inodeFullStatus, inodePath } = storeToRefs(store)

const hasOtherExtension = ref(false) // 是否存在其他扩展
onMounted(() => {
	store.checkFullDisk() // 检查满磁盘
	// 专版挂载方法
	nextTick(() => {
		const time = setInterval(async () => {
			if (window.$extension) {
				const plugin = await window.$extension()
				if (isBoolean(plugin.extensionElement) && !plugin.extensionElement) clearTimeout(time)
				if (plugin.extensionElement) {
					plugin.extensionElement()
					hasOtherExtension.value = true
					clearTimeout(time)
				}
			}
		}, 1000)
	})
})
</script>

<style lang="css" scoped>
.playTips {
	@apply w-full bg-[var(--el-color-warning-light-8)] text-base leading-[3.8rem] text-danger rounded-large;
}

.playTips :deep(.el-carousel__item) {
	@apply flex px-[1.6rem] py-1rem;
}

.playTips i {
	@apply leading-[3.8rem];
}

.playTips a {
	font-size: var(--el-font-size-base) !important;
}

.playTips :deep(.el-carousel__indicators--vertical) {
	@apply mr-[1.6rem];
}

.playTips :deep(.el-carousel__indicator--vertical) {
	@apply inline-block px-[0.4rem] align-middle;
}

.playTips :deep(.el-carousel__indicator--vertical).is-active .el-carousel__button {
	background: var(--el-color-danger);
}

.playTips :deep(.el-carousel__button) {
	width: 0.6rem;
	height: 0.6rem;
	border: 0.1rem solid var(--el-color-danger);
	border-radius: var(--el-border-radius-circle);
}

.alert-danger {
	color: var(--el-color-danger-dark-2);
	background-color: var(--el-color-danger-light-9);
	border-color: var(--el-color-danger-light-7);
}

.alert {
	padding: 15px;
	margin-bottom: 20px;
	border: 1px solid transparent;
	border-radius: var(--el-border-radius-base);
}

.tencent_division {
	padding-right: 15px;
	position: relative;
}

.tencent_division::after {
	content: '';
	display: inline-block;
	position: absolute;
	border-right: 1px solid var(--el-color-border-dark-tertiaryer);
	height: 25px;
	top: 157.5px;
	left: 136px;
}

.tencent_ico {
	display: inline-block;
	height: 25px;
	width: 25px;
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAACvElEQVRIS+2VS0iUYRSGn/PPhNLFpPsQhiHhiNFFoUUXKKhFUQuLCslxIgKlzDKidNXMKouImNrkJp2iKwZFoIsgCSkDR1wYNk7BLDKDkG50UZw58c+MGs0/Y7ZwU2d7zvc+3znn/fiEKQiZAgb/GqRSFzAtsg1kNcgKkDAaHcAwmvFJYKKRTzyuqshRRI4CSy3FVBu4bKtIB0oPOaJ+UFdCIIDoE6LRBxh2J7AT1S2xnHAXn7EnFSg1pDpyBpXauIhU4JOGJJFqPYnq2UTNOXxyygpkDTmgs5hBCHQhKnVclvqU46iKeBA5HctnyEzOy9ffa60h1SMlqHEvXiyZXJKhtMs9prlclPCfjasjlIVt5Djfpm3ApjMYMgbIHr5PcUFjSkiTejBYirIE5RXQj1s8v9aPdxLo245oPaqFyYLSyILph8jJ+T6W8+ty4BKw0eICbSgVuKUv7gszOsMO5MdTIBehDdVmxHhNNFoIchAhH2jHbitl5bI3XNVV2LgJmC4DxYtBN8pcoAYoRLmOW2LOjEMCvRdAahB5QVG+ecPx6AzOw+BGzK5R9dLrfIhyCyEPGAZKKZfE/hLH/Po41qGwFZe0xiFdwZ7YmETXUlTwLKn9rtB8IiOHCTpbiXIbWAJ8wWAvZdKSVN+o6zBoR6nHLXWJcb0cRJhDsTP1u2nS9Qh3AAcwiLIbt5g3tg6/KtBGuWwa7eQ5qmtSdnJNN6LcBeYhvEXYRZl0pASMdiL4cYl7FFKL6hnLnTTpZoRmIAsljJ0S9kl32nczuhPTEG7xxCGhUAafI6a7isbcFaWHd441fJjtBTKBIBEq04rbWYxSF3OX0IJLto27a9zGV4AdMaFPWUH6HXko9rTCVknTvgZeXGI+ToufMdC7n4/ZJ+hf9H7S4hBAeGTa9tezE/8nf0H6/ch/yKSG+BPZWO0aiPkdwgAAAABJRU5ErkJggg==);
}

.tencent :deep(.el-card__body) {
	padding: 0;
}
</style>
<style lang="css">
.el-popover.el-popper[x-placement].test-popover {
	@apply mt-0 p-0 bg-white text-tertiary;
	box-shadow: 0 2px 12px 0 rgba(var(--el-color-black-rgb), 0.1);
}

.el-popover.el-popper[x-placement] .popper__arrow {
	@apply border-b-transparent;
}

.el-popover.el-popper[x-placement] .popper__arrow::after {
	@apply border-b-transparent border-t-transparent;
}
</style>

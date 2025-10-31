<template>
	<div class="h-full p-[2rem]">
		<div class="commend-title">
			<div class="text-medium inline-block">左侧菜单设置</div>
			<div class="commend-msg">-- 可以隐藏和关闭一些不需要的页面和功能，在面板<span class="text-primary cursor-pointer hover:text-primaryDark" @click="store.goSetting"> 设置 </span>或左侧菜单栏下方可随时调整</div>
		</div>
		<div class="select-con" v-bt-loading="store.load">
			<div class="select-box" v-for="menu in store.getList(store.menuList)" :key="menu.id">
				<template v-if="menu.children && menu.children.length">
					<el-dropdown :hide-on-click="false">
						<span class="el-dropdown-link flex items-center text-small">
							<span class="cursor-pointer whitespace-nowrap" @click="store.handleMenuChange(menu)">{{ menu.title }}</span>
							<i class="svgtofont-arrow-down ml-[.5rem]"></i>
							<el-checkbox v-model="menu.show" class="ml-[.5rem] w-[1.6rem] h-[1.6rem]" @change="store.handleMenuChange(menu)"></el-checkbox>
						</span>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item v-for="child in menu.children" :key="child.id">
									<div class="flex items-center justify-between w-full">
										<span class="cursor-pointer" @click="store.handleMenuChange(child)">{{ child.title }}</span>
										<el-checkbox v-model="child.show" class="ml-[1rem]" @change="store.handleMenuChange(child)"></el-checkbox>
									</div>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</template>
				<template v-else>
					<div class="flex items-center justify-between text-small">
						<span class="cursor-pointer whitespace-nowrap" @click="store.handleMenuChange(menu)">{{ menu.title }}</span>
						<el-checkbox v-model="menu.show" class="ml-[.5rem] w-[1.6rem] h-[1.6rem]" @change="store.handleMenuChange(menu)"></el-checkbox>
					</div>
				</template>
			</div>
			<!-- 更多菜单项 -->
			<div class="select-box">
				<el-dropdown :hide-on-click="false">
					<span class="el-dropdown-link flex items-center text-small">
						<span class="cursor-pointer whitespace-nowrap more-menu-trigger">更多</span>
						<i class="svgtofont-arrow-down ml-[.5rem]"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item v-for="menu in store.moreMenuList" :key="menu.id">
								<div class="flex items-center justify-between w-full">
									<span class="cursor-pointer" @click="store.handleMenuChange(menu)">{{ menu.title }}</span>
									<el-checkbox v-model="menu.show" class="ml-[1rem]" @change="store.handleMenuChange(menu)"></el-checkbox>
								</div>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</div>
		<div class="commend-title">
			<div class="text-medium inline-block">一键安装套件</div>
			<div class="commend-msg">&nbsp;-- 我们为您提供以下套件一键安装，请按需选择或在<span class="text-primary cursor-pointer hover:text-primaryDark" @click="store.goSoft"> 软件商店 </span>页面中手动安装，推荐安装<span>"LNMP"</span></div>
		</div>
		<div class="flex recommend-soft-list overflow-y-auto flex-wrap gap-[1.5rem]">
			<div v-for="reItem of recommend" :key="reItem.type" class="recommend-soft-item flex-1">
				<div class="rounded-base recommend-cont">
					<span class="mb-[1rem] pl-[.5rem] recommend-title text-center inline-block w-full font-bold text-large">{{ reItem.title }}</span>
					<ul class="soft-list">
						<li v-for="(softItem, softKey) of reItem.soft" :key="softKey" class="flex items-center">
							<bt-image type="icons" :src="`soft/ico-${softItem.icon}.svg`" class="ml-1 mr-4" :class="softItem.icon !== 'docker' ? '!w-[3.2rem] !h-[3.2rem]' : '!mr-[.6rem] !w-[5.5rem] !h-[3.2rem]'" />
							<el-select v-if="softItem.icon !== 'docker'" v-model="softItem.value" class="flex-1 mr-[2rem]" size="small" @change="store.changeSoftwareVersion(softItem, reItem.type)">
								<el-option v-for="item of softItem.options" :key="item.value" class="flex justify-between" :label="item.label" :disabled="item.disabled" :value="item.value">
									<span>{{ item.label }}</span>
									<span class="pl-8 text-warning">{{ item.ps }}</span>
								</el-option>
							</el-select>
							<el-input v-if="softItem.icon === 'docker'" class="no-drap mr-[2rem]" value="Docker服务" readOnly></el-input>
							<el-checkbox v-model="softItem.selected" :disabled="softItem.disabled"></el-checkbox>
						</li>
					</ul>
					<div class="flex items-baseline my-8">
						<span class="mr-4 whitespace-nowrap">安装方式：</span>
						<el-radio-group v-model="reItem.install" class="whitespace-nowrap">
							<el-tooltip class="item" effect="dark" placement="top-start">
								<template #content>
									<div class="w-110">即rpm/deb，安装时间极快（5-10分钟），版本与稳定性略低于编译安装，适合快速部署测试</div>
								</template>
								<el-radio class="!mr-[1.2rem]" :value="1">极速安装</el-radio>
							</el-tooltip>
							<el-tooltip class="item" effect="dark" placement="top-start">
								<template #content>
									<div class="w-110">安装时间长（30分钟到2小时），性能最大化，适合生产环境</div>
								</template>
								<el-radio class="!mr-0" :value="0">编译安装</el-radio>
							</el-tooltip>
						</el-radio-group>
					</div>
					<div class="flex justify-center">
						<el-button type="primary" @click="store.installSoft(reItem.type)">一键安装</el-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import HOME_REC_INSTALL_STORE from './store'
import { storeToRefs } from 'pinia'
import { useEventListener } from '@vueuse/core'

const store = HOME_REC_INSTALL_STORE()
const { recommend, emits } = storeToRefs(store)

const emit = defineEmits<{ (event: 'close'): void }>()
emits.value = emit

onMounted(() => {
	store.initSoft()
	store.updateMenuItems()
	useEventListener(document.querySelector('.close-ad'), 'click', () => {
		store.cancelShowRec()
	})
})
</script>

<style lang="css" scoped>
.recommend-soft-item {
	@apply min-w-[22rem] max-w-[26rem];
}

/* ..recommend-soft-item + ..recommend-soft-item {
	@apply ml-[24px];
} */

.recommend-soft-list {
	@apply h-[40.5rem];
}

.recommend-soft-item:hover .recommend-cont {
	@apply bg-extraLight px-[1.4rem] py-[1.9rem];
	border: 2px solid var(--el-color-primary);
}

.recommend-title {
	@apply text-extraLarge;
}

.recommend-cont {
	@apply px-[1.5rem] py-[2rem];
	border: 1px solid var(--el-color-border-dark);
}
.soft-list {
	@apply min-h-[20.8rem];
}
.soft-list li + li {
	@apply mt-[12px];
}

.el-checkbox :deep(.el-checkbox__inner) {
	@apply w-[1.8rem] h-[1.8rem];
}

.el-checkbox :deep(.el-checkbox__inner::after) {
	@apply top-[0.15rem] left-[0.55rem] h-[0.8rem] border-width-2px;
}

:deep(.el-alert__description) {
	@apply m-0 ml-[8px];
}
:deep(.el-radio__label) {
	@apply text-small pl-[.5rem];
}
:deep(.text-grey-333) {
	@apply w-full;
}
:deep(.no-drap input) {
	@apply cursor-not-allowed;
}
:deep(.el-radio-group) {
	@apply inline-block leading-[1] align-middle text-[0];
}
.commend-title {
	@apply mb-[1.5rem];
}
.commend-msg {
	@apply inline-block text-tertiary;
}
.select-con {
	@apply border-dark border rounded-base p-[1.2rem] mb-[1.5rem] flex items-center justify-around min-h-[5rem] flex-wrap gap-[1rem];
}
.select-box {
	@apply inline-flex items-center;
}

/* 更多菜单样式 */
.more-menu-trigger {
	color: var(--el-color-primary);
	font-weight: bold;
}
.more-menu-trigger:hover {
	color: var(--el-color-primary-dark-2);
}
:deep(.more-menu-popover .el-popover__title) {
	color: var(--el-color-primary);
	font-weight: bold;
}

@media screen and (max-width: 890px) {
	.select-con {
		@apply justify-start;
	}
	.recommend-soft-list {
		@apply justify-start;
	}
}
</style>
<style>
.close-ad {
	@apply text-primary cursor-pointer absolute right-[8rem] hover:text-primaryDark;
}
</style>

<template>
	<section class="sidebar">
		<!-- 消息盒子和IP信息 -->
		<div class="flex-shrink-0">
			<BtContainer class="layout-message" :class="menuControl.collapse ? '!justify-center' : '!justify-start'">
				<template v-if="globalTheme.logo.image === '/static/icons/logo-white.svg'">
					<bt-svg name="tools-logo" size="22" />
				</template>
				<template v-else>
					<img :src="menuLogo" alt="logo-white" :class="'w-[2rem] ' + (menuControl.collapse ? '' : 'mr-[.4rem]')" />
				</template>

				<!-- IP地址 -->
				<div v-if="!menuControl.collapse" class="flex leading-normal truncate font-600 w-[15rem] pl-[.8rem]" title="双击可复制IP" :class="messageIpNumberLength >= 11 ? 'text-small' : 'text-base'" @dblclick="copyIpAddressEvent">
					{{ panel.sidebarTitle || serverIp }}
				</div>
				<!-- 消息数 -->
				<div :class="messageNumberStyle" @click="openMessageBoxEvent">
					{{ panel.msgBoxTaskCount }}
				</div>
			</BtContainer>
		</div>
		<!-- 菜单列表 -->
		<div class="flex-1 overflow-y-auto overflow-hidden">
			<div class="relative h-full">
				<!--  进度条 -->
				<BtScrollbar>
					<ul class="bt-menu" :class="{ 'is-cut-menu': menuControl.collapse, 'hover-menu-bg': menuControl.mouserover }">
						<!-- 渲染路由菜单 -->
						<template v-for="item in menuRoute" :key="item.path">
							<li v-if="item.name != 'dologin' && item.show" :key="item.path" :class="['menu-item', `menu-${String(item.name)}`, getMenuActionStyle(item)]" @mouseenter="menuMouseenter(item.name)" @mouseleave="menuMouseleave(item.name)">
								<a :href="item.path" @click.prevent="cutMenuRouter(item.path)">
									<bt-svg :name="'menu-' + (isActiveMenu(item) || menuControl.menuName === item.name ? item.name + '-active' : item.name)" color="#fff" size="21" />
									<span>{{ item.title }}</span>
								</a>
							</li>
						</template>
						<li class="menu-item menu-exit" @click="doLoginEvent">
							<a href="javascript:;" @mouseenter="menuMouseenter('dologin')" @mouseleave="menuMouseleave('dologin')">
								<bt-svg :name="'menu-exit' + (menuControl.menuName === 'dologin' ? '-active' : '')" size="22" />
								<span>退出</span>
							</a>
						</li>
					</ul>
				</BtScrollbar>
			</div>
		</div>
		<!-- 伸缩菜单栏 -->
		<div class="flex-shrink-0">
			<div :class="['menu-toolbar', { 'justify-between': !menuControl.collapse }]">
				<!-- 设置菜单栏伸缩 -->
				<div class="cursor-pointer">
					<BtTooltip class="item" effect="dark" content="点击伸缩菜单栏" placement="top" :enterable="false">
						<div class="setting-hover" @click="cutCollapseViewEvent" @mouseleave="menuCollapseMouseleave" @mouseenter="menuCollapseMouseenter">
							<bt-icon :icon="menuControlIcon ? 'display-menu' : 'shrink-menu'" />
						</div>
					</BtTooltip>
				</div>

				<!-- 设置菜单显示状态 -->
				<div class="cursor-pointer">
					<BtTooltip v-if="!menuControl.collapse" class="item" effect="dark" content="点击设置菜单显示隐藏" placement="top" :enterable="false">
						<div class="setting-hover" @click="openMenuSettingsEvent">
							<bt-icon icon="menu-setting" />
						</div>
					</BtTooltip>
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '@/store/global'
import { menuRoute } from '@/router/hooks/router-menu'
import { openMessageBoxEvent, copyIpAddressEvent, getMenuActionStyle, isActiveMenu, doLoginEvent, cutCollapseViewEvent, openMenuSettingsEvent, menuMouseenter, menuMouseleave } from './controller'
const { menuControl, panel, serverIp, messageNumberStyle, messageIpNumberLength, menuControlIcon, menuCollapseMouseleave, menuCollapseMouseenter, cutMenuRouter, menuLogo, globalTheme } = useGlobalStore()
</script>

<style lang="scss" scoped>
$icon-size: 100% auto;
$menu-path: '/static/images/menu/';

@mixin bg-icon($icon, $type: 'png') {
	background-image: url('#{$menu-path}#{$icon}.#{$type}');
	background-size: $icon-size;
	background-repeat: no-repeat;
	background-position: center;
}

// 图片ICON
@mixin menu-icon($icon, $type: 'img') {
	&.menu-#{$icon} {
		.icon {
			@include bg-icon($icon, if($type == 'svg', 'svg', 'png'));
		}
		a.is-active .icon {
			@include bg-icon('#{$icon}-active', if($type == 'svg', 'svg', 'png'));
		}
		&:hover .icon {
			@include bg-icon('#{$icon}-hover', if($type == 'svg', 'svg', 'gif'));
		}
	}
}

.sidebar {
	@apply flex flex-col w-full h-full;
	color: var(--bt-menu-text-color);
}

// 消息盒子样式
.layout-message {
	@apply relative items-center justify-start h-[64px] leading-[48px] w-full cursor-pointer transition-all mb-[1px] px-[1.2rem] py-[1.4rem];
	color: var(--bt-menu-text-color);
	transition: all 0.2s;

	.message-number {
		@apply w-[24px] h-8 leading-8 text-center rounded-base font-bold text-small absolute right-[12px];
		background-color: var(--bt-menu-message-color);
		color: var(--bt-menu-message-color-active);
		&.is-min {
			@apply w-6 h-6 leading-6 text-small ml-[4px] absolute right-[0];
		}
	}
	.message-shrink-number {
		@apply w-8 h-8 leading-8 text-center rounded-circle font-bold text-base absolute top-[8px] right-[6px];
		background-color: var(--bt-menu-message-color);
		color: var(--bt-menu-message-color-active);
	}
	// END 消息盒子样式
}

// 左侧主菜单样式
.bt-menu {
	@apply px-[1.2rem] pt-[.4rem];
	transition: width 0.2s;
	&.is-cut-menu {
		padding: 0 !important;
		.menu-item > a {
			@apply px-[.8rem] flex justify-center;
			border-radius: 0 !important;
			&::after {
				border-radius: 0 !important;
			}
			i.menu-icon {
				@apply mr-0;
			}
			span {
				@apply w-0 h-0 text-[0] hidden;
			}
		}
	}
	// 菜单选项样式
	.menu-item {
		@apply items-center w-full h-[4rem] leading-[4rem] mb-[.4rem] z-999 inline-flex relative;

		&:hover,
		&.is-active {
			@apply rounded-large overflow-hidden;
			background-color: var(--bt-menu-sidebar-color-active);
			box-shadow: 0 0 4px 1px var(--bt-menu-shadow-color);
			&::after {
				@apply content-[''] h-[4rem] w-[4px] absolute left-0 top-0;
				background-color: var(--bt-menu-sidebar-label-color);
			}
			span {
				@apply font-600;
			}
		}
		a {
			@apply flex items-center justify-start w-full h-full pl-[2.4rem] text-base;
			i {
				@apply;
			}
			span {
				@apply whitespace-nowrap w-[9rem] flex  duration-200 ease-in-out ml-[1.2rem];
				transition: width 0.2s;
			}
		}
		.icon {
			@apply block w-[1.6rem] h-[1.6rem] mr-[1.2rem] flex-shrink-0;
		}
	}
}
// END 左侧主菜单样式

.menu-toolbar {
	@apply w-full h-[54px] flex items-center;
}

// 设置菜单
.setting-hover {
	@apply items-center h-[54px] w-[60px] flex justify-center cursor-pointer;
	i {
		color: var(--bt-menu-operation-color) !important;
	}
}

.setting-hover:hover {
	background-color: var(--bt-menu-operation-bg-color);
	i {
		@apply transition-all duration-300;
		color: var(--bt-menu-operation-color-active) !important;
	}
}

// END 设置菜单
</style>

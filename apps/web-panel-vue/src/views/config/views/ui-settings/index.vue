<template>
	<div class="ui-settings">
		<!-- JSON配置功能模块 -->
		<div class="ui-settings__json-config">
			<el-button class="mr-[8px]" size="small" @click="openJsonConfigDialog"> 主题JSON配置 </el-button>
			<el-button size="small" @click="handleRestoreAllDefaultsConfig"> 恢复默认配置 </el-button>
		</div>

		<div class="ui-settings__panel">
			<!-- <div class="config-title">界面设置</div> -->
			<div class="ui-settings__content">
				<!-- 主题模式设置-已完成 -->
				<div class="ui-settings__section">
					<div class="ui-settings__section-title">主题设置</div>
					<div class="ui-settings__section-content">
						<!-- 主题模式 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">预设主题</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__theme-grid">
									<div v-for="(mode, index) in themeModes" :key="index" class="ui-settings__theme-option" :class="{ 'ui-settings__theme-option--active': mode.active }" @click="cutDefaultTheme(mode.value as Theme)">
										<div class="ui-settings__theme-icon">
											<!-- <svg viewBox="0 0 24 24" width="24" height="24">
												<component :is="'g'" v-html="mode.icon"></component>
											</svg> -->
											<bt-svg :name="mode.icon" size="22" class="hob-icon" />
										</div>
										<span class="ui-settings__theme-label">{{ mode.label }}</span>
									</div>
								</div>
								<div class="ui-settings__tip">选择界面预设主题，影响整体界面的明暗风格和其他风格</div>
							</div>
						</div>

						<!-- 颜色主题 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">颜色主题</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__scheme-grid">
									<div v-for="scheme in colorSchemeOptions" :key="scheme.key" class="ui-settings__scheme-option" :class="{ 'ui-settings__scheme-option--active': scheme.active }" @click="handleColorSchemeChange(scheme.key)">
										<div class="ui-settings__scheme-color" :style="{ background: scheme.gradient }"></div>
										<span class="ui-settings__scheme-label">{{ scheme.label }}</span>
									</div>
									<!-- 自定义颜色选项 -->
									<div class="ui-settings__scheme-option ui-settings__scheme-option--custom" :class="{ 'ui-settings__scheme-option--active': isCustomThemeColor }">
										<el-color-picker v-model="globalTheme.theme.color" size="default" @change="handleCustomThemeColorChange" @active-change="handleCustomThemeColorPreview"></el-color-picker>
										<div class="ui-settings__scheme-label">自定义</div>
									</div>
								</div>
								<div class="ui-settings__tip">选择预设的颜色主题方案或自定义颜色，会影响整体界面色调</div>
								<div class="ui-settings__actions" style="margin-top: 15px">
									<el-button size="small" @click="handleRestoreDefault('theme_color')">恢复默认</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Logo设置-已完成 -->
				<div class="ui-settings__section">
					<div class="ui-settings__section-title">Logo设置</div>
					<div class="ui-settings__section-content">
						<!-- Logo（带文字） -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">Logo</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__preview">
									<el-image :src="globalTheme.logo.image" alt="Logo" />
								</div>
								<div class="ui-settings__tip">将会显示在左侧菜单栏顶部（建议图片大小:32px*32px，推荐使用SVG格式）</div>
								<div class="ui-settings__actions">
									<el-upload class="ui-settings__uploader" action="/files" :data="getUploadData('menu_logo')" :headers="getUploadHeaders()" :show-file-list="false" :before-upload="beforeUpload" :http-request="customUploadRequest" :on-success="res => handleUploadSuccessAndSave(res, 'menu_logo')">
										<el-button size="small">上传Logo</el-button>
									</el-upload>
									<el-button size="small" @click="handleRestoreDefault('menu_logo')">恢复默认</el-button>
								</div>
							</div>
						</div>

						<!-- 网站图标 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">网站图标</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__preview">
									<el-image :src="globalTheme.logo.favicon" alt="网站图标" />
								</div>
								<div class="ui-settings__tip">将会显示在浏览器标签页（建议图片大小: 16px*16px，推荐使用ICO格式或PNG、SVG格式）</div>
								<div class="ui-settings__actions">
									<el-upload
										class="ui-settings__uploader"
										action="/files"
										:data="getUploadData('favicon')"
										:headers="getUploadHeaders()"
										:show-file-list="false"
										:before-upload="beforeUpload"
										:http-request="customUploadRequest"
										:on-success="res => handleUploadSuccessAndSave(res, 'favicon')"
										accept=".ico,.png,.svg">
										<el-button size="small">上传图标</el-button>
									</el-upload>
									<el-button size="small" @click="handleRestoreDefault('favicon')">恢复默认</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 侧边栏设置-已完成 -->
				<div class="ui-settings__section">
					<div class="ui-settings__section-title">侧边栏设置</div>
					<div class="ui-settings__section-content">
						<!-- 深色侧边栏开关 -->
						<div v-if="!isDark" class="ui-settings__item">
							<div class="ui-settings__item-label">自定义侧边栏</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__switch">
									<el-switch v-model="globalTheme.sidebar.dark" :disabled="isDark" :title="isDark ? '深色主题下不支持设置自定义侧边栏颜色' : ''" active-text="开启" inactive-text="关闭" inline-prompt @change="handleDarkSidebarChange" />
								</div>
								<div class="ui-settings__tip">开启后侧边栏将支持自定义颜色方案，未开启则使用默认侧边栏颜色，暗色模式下，侧边栏设置将失效。</div>
							</div>
						</div>

						<!-- 颜色预设 -->
						<div v-if="globalTheme.sidebar.dark && !isDark" class="ui-settings__item">
							<div class="ui-settings__item-label">自定义颜色方案</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__color-grid">
									<div v-for="option in sidebarColorOptions" :key="option.key" class="ui-settings__color-item" :class="{ 'ui-settings__color-item--active': option.active }" @click="cutSidebarColor(option.key)">
										<div class="ui-settings__color-preview" :style="{ backgroundColor: option.color }"></div>
										<div class="ui-settings__color-label">{{ option.label }}</div>
									</div>
									<!-- 自定义颜色选项 -->
									<div class="ui-settings__color-item ui-settings__color-item--custom" :class="{ 'ui-settings__color-item--active': isCustomSidebarColor }">
										<el-color-picker v-model="globalTheme.sidebar.color" :disabled="isDark" :title="isDark ? '暗色模式下不支持自定义颜色' : ''" size="default" @change="handleCustomColorChange" @active-change="handleCustomColorPreview"></el-color-picker>
										<div class="ui-settings__color-label">自定义</div>
									</div>
								</div>
								<div class="ui-settings__tip">选择预设的颜色方案或自定义颜色，选择后会立即生效</div>
								<div class="ui-settings__actions" style="margin-top: 15px">
									<el-button size="small" @click="handleRestoreDefault('theme_color')">恢复默认</el-button>
								</div>
							</div>
						</div>

						<!-- 侧边栏背景透明度 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">侧边栏背景透明度</div>
							<div class="ui-settings__item-content">
								<el-slider v-model="globalTheme.sidebar.opacity" :min="0" :max="100" :step="5" show-input style="width: 300px" @change="handleSliderChange('menu-sidebar-bg-opacity')" />
								<span class="ui-settings__tip">（1-100，数值越小越透明）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<!-- <el-button size="small" @click="handleSave(false)">保存</el-button> -->
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('menu_bg_opacity')">恢复默认</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 界面设置 -->
				<div class="ui-settings__section">
					<div class="ui-settings__section-title">界面设置</div>
					<div class="ui-settings__section-content">
						<!-- 圆角设置 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">界面圆角</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__radius-grid">
									<div v-for="option in borderRadiusOptions" :key="option.value" class="ui-settings__radius-option" :class="{ 'ui-settings__radius-option--active': option.active }" @click="handleBorderRadiusChange(option.value)">
										<div class="ui-settings__radius-preview" :class="`ui-settings__radius-preview--${option.value}`"></div>
										<span class="ui-settings__radius-label">{{ option.label }}</span>
									</div>
								</div>
								<div class="ui-settings__tip">选择界面元素的圆角大小，影响按钮、卡片等元素的圆角效果</div>
							</div>
						</div>

						<!-- 主界面背景图片 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">界面背景图片</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__switch" style="margin-bottom: 10px">
									<el-switch v-model="globalTheme.interface.is_show_bg" active-text="显示" inactive-text="隐藏" inline-prompt @change="setMainBgImagesShow" />
								</div>
								<div v-if="globalTheme.interface.is_show_bg">
									<div class="ui-settings__bg-preview">
										<el-image :src="globalTheme.interface.bg_image" alt="主界面背景图片">
											<template #error>
												<div v-if="globalTheme.interface.bg_image" class="text-center">
													<div>加载失败</div>
													<div>请重新上传</div>
												</div>
												<div v-else>请上传图片</div>
											</template>
										</el-image>
									</div>
									<div class="ui-settings__tip">将会显示在主界面背景（建议图片大小: 1920px*1080px，推荐png格式，大小不建议超过2MB，过大可能会导致页面加载过慢!）</div>
									<div class="ui-settings__actions">
										<el-upload
											class="ui-settings__uploader"
											action="/files"
											:data="getUploadData('main_bg_images')"
											:headers="getUploadHeaders()"
											:show-file-list="false"
											:before-upload="beforeUpload"
											:http-request="customUploadRequest"
											:on-success="res => handleUploadSuccessAndSave(res, 'main_bg_images')">
											<el-button size="small">上传图片</el-button>
										</el-upload>
										<el-button size="small" @click="handleRestoreDefault('main_bg_images')">恢复默认</el-button>
									</div>
								</div>
							</div>
						</div>
						<div class="ui-settings__item" v-if="globalTheme.interface.is_show_bg">
							<div class="ui-settings__item-label">背景图片透明度</div>
							<div class="ui-settings__item-content">
								<el-slider v-model="globalTheme.interface.bg_image_opacity" :min="0" :max="100" :step="5" show-input style="width: 300px" @change="handleSliderChange('main-bg-images-opacity')"></el-slider>
								<span class="ui-settings__tip">（1-100，数值越小越透明）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('main_bg_images_opacity')">恢复默认</el-button>
								</div>
							</div>
						</div>
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">内容透明度</div>
							<div class="ui-settings__item-content">
								<el-slider v-model="globalTheme.interface.content_opacity" :min="0" :max="100" :step="5" show-input style="width: 300px" @change="handleSliderChange('main-content-opacity')"></el-slider>
								<span class="ui-settings__tip">（1-100，数值越小越透明）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('main_content_opacity')">恢复默认</el-button>
								</div>
							</div>
						</div>
						<!-- 主界面阴影颜色 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">阴影颜色</div>
							<div class="ui-settings__item-content">
								<el-color-picker v-model="globalTheme.interface.shadow_color" @change="handleShadowColorChange" @active-change="setShadowColorTheme(globalTheme.interface.shadow_color, themeManager)" />
								<span class="ui-settings__tip">（设置主界面内容的阴影颜色）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('main_shadow_color')">恢复默认</el-button>
								</div>
							</div>
						</div>
						<!-- 主界面阴影透明度 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">阴影透明度</div>
							<div class="ui-settings__item-content">
								<el-slider v-model="globalTheme.interface.shadow_opacity" :min="0" :max="100" :step="1" show-input style="width: 300px" @change="handleSliderChange('main-shadow-opacity')" />
								<span class="ui-settings__tip">（0-100，数值越大阴影越浓）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('main_shadow_opacity')">恢复默认</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 首页设置 -->
				<div class="ui-settings__section">
					<div class="ui-settings__section-title">首页设置</div>
					<div class="ui-settings__section-content">
						<!-- 首页概览显示方式 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">状态显示方式</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__overview-grid">
									<div v-for="option in overviewViewOptions" :key="option.value" class="ui-settings__overview-option" :class="{ 'ui-settings__overview-option--active': option.active }" @click="handleOverviewViewChange(option.value)">
										<div class="ui-settings__overview-icon">
											<svg viewBox="0 0 24 24" width="24" height="24">
												<component :is="'g'" v-html="option.icon"></component>
											</svg>
										</div>
										<span class="ui-settings__overview-label">{{ option.label }}</span>
									</div>
								</div>
								<div class="ui-settings__tip">选择首页概览信息的显示方式，影响概览卡片的布局样式</div>
								<div class="ui-settings__actions" style="margin-top: 15px">
									<el-button size="small" @click="handleRestoreDefault('home_overview_view')">恢复默认</el-button>
								</div>
							</div>
						</div>

						<!-- 首页概览卡片字体大小 -->
						<div v-if="globalTheme.home.overview_view !== 'tile'" class="ui-settings__item">
							<div class="ui-settings__item-label">状态字体大小</div>
							<div class="ui-settings__item-content">
								<div class="flex items-center">
									<el-slider v-model="globalTheme.home.overview_size" :min="12" :max="36" :step="2" show-input style="width: 300px" @change="handleHomeFontSizeChange" />
								</div>
								<span class="ui-settings__tip">（12-50，数值越大字体越大）</span>
								<span class="border-[1px] border-light rounded-base p-[1rem] mt-[1rem] flex flex-col w-[25rem]">
									<span class="pb-[.2rem] text-[1.4rem] font-alibaba-semibold"> 负载 </span>
									<span class="text-default font-alibaba-heavy whitespace-nowrap" :style="{ fontSize: `${globalTheme.home.overview_size}px` }"> 运行流畅 </span>
								</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('home_state_font_size')">恢复默认</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 登录界面设置 -->
				<div class="ui-settings__section">
					<div class="ui-settings__section-title">登录界面设置</div>
					<div class="ui-settings__section-content">
						<!-- 登录logo图片 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">登录logo图片</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__switch mb-[10px]">
									<el-switch v-model="globalTheme.login.is_show_logo" active-text="显示" inactive-text="隐藏" inline-prompt @change="setLoginLogoShow" />
								</div>
								<div v-if="globalTheme.login.is_show_logo">
									<div class="ui-settings__preview" v-if="globalTheme.login.logo">
										<el-image :src="globalTheme.login.logo" alt="登录logo图片">
											<template #error>
												<div v-if="globalTheme.login.logo" class="text-center">
													<div>加载失败</div>
													<div>请重新上传</div>
												</div>
												<div v-else>请上传图片</div>
											</template>
										</el-image>
									</div>
									<div class="ui-settings__tip">将会显示在登录页面背景（建议图片大小: 64px*64px，推荐svg格式）</div>
									<div class="ui-settings__actions">
										<el-upload class="ui-settings__uploader" action="/files" :data="getUploadData('login_logo')" :headers="getUploadHeaders()" :show-file-list="false" :before-upload="beforeUpload" :http-request="customUploadRequest" :on-success="res => handleUploadSuccessAndSave(res, 'login_logo')">
											<el-button size="small">上传图片</el-button>
										</el-upload>
										<el-button size="small" @click="handleRestoreDefault('login_logo')">恢复默认</el-button>
									</div>
								</div>
							</div>
						</div>
						<!-- 登录背景图片 -->
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">登录背景图片</div>
							<div class="ui-settings__item-content">
								<div class="ui-settings__switch" style="margin-bottom: 10px">
									<el-switch v-model="globalTheme.login.is_show_bg" active-text="显示" inactive-text="隐藏" inline-prompt @change="setLoginBgShow" />
								</div>
								<div v-if="globalTheme.login.is_show_bg">
									<div class="ui-settings__bg-preview">
										<el-image :src="globalTheme.login.bg_image" alt="登录背景图片">
											<template #error>
												<div v-if="globalTheme.login.bg_image" class="text-center">
													<div>加载失败</div>
													<div>请重新上传</div>
												</div>
												<div v-else>请上传图片</div>
											</template>
										</el-image>
									</div>
									<div class="ui-settings__tip">将会显示在登录页面背景（建议图片大小: 1920px*1080px，推荐png格式，大小不建议超过2MB，过大可能会导致页面加载过慢!）</div>
									<div class="ui-settings__actions">
										<el-upload
											class="ui-settings__uploader"
											action="/files"
											:data="getUploadData('login_bg_images')"
											:headers="getUploadHeaders()"
											:show-file-list="false"
											:before-upload="beforeUpload"
											:http-request="customUploadRequest"
											:on-success="res => handleUploadSuccessAndSave(res, 'login_bg_images')">
											<el-button size="small">上传图片</el-button>
										</el-upload>
										<el-button size="small" @click="handleRestoreDefault('login_bg_images')">恢复默认</el-button>
									</div>
								</div>
							</div>
						</div>
						<div class="ui-settings__item" v-if="globalTheme.login.is_show_bg">
							<div class="ui-settings__item-label">登录背景图片透明度</div>
							<div class="ui-settings__item-content">
								<el-slider v-model="globalTheme.login.bg_image_opacity" :min="0" :max="100" :step="5" show-input style="width: 300px" @change="handleSliderChange('login-bg-images-opacity')" />
								<span class="ui-settings__tip">（1-100，数值越小越透明）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('login_bg_images_opacity')">恢复默认</el-button>
								</div>
							</div>
						</div>
						<div class="ui-settings__item">
							<div class="ui-settings__item-label">登录内容透明度</div>
							<div class="ui-settings__item-content">
								<el-slider v-model="globalTheme.login.content_opacity" :min="0" :max="100" :step="5" show-input style="width: 300px" @change="handleSliderChange('login-content-opacity')" />
								<span class="ui-settings__tip">（1-100，数值越小越透明）</span>
								<div class="ui-settings__actions" style="margin-top: 10px">
									<el-button class="!ml-0" size="small" @click="handleRestoreDefault('login_content_opacity')">恢复默认</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 保存按钮 -->
				<div class="ui-settings__save-btn">
					<el-button @click="handleRestoreAllDefaultsConfig">恢复所有默认设置</el-button>
					<el-button :loading="importLoading" @click="() => handleImportConfig(themeManager)">
						{{ importLoading ? '导入中...' : '导入配置' }}
					</el-button>
					<el-button :loading="exportLoading" @click="handleExportConfig">
						{{ exportLoading ? '导出中...' : '导出配置' }}
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getConfigStore } from '@config/useStore'
import { useGlobalStore } from '@store/global'
import { useConfirm, useMessage, useDialog } from '@/hooks/tools'
import { isDev } from '@/utils'
import { useDebounceFn } from '@vueuse/core'
import {
	setTheme,
	setSidebarTheme,
	setBorderRadiusTheme,
	setHomeFontSize,
	setOpacityTheme,
	setShadowColorTheme,
	generateUploadData,
	getUploadHeaders as themeGetUploadHeaders,
	setCssVariables,
	mountCssVariable,
	type BorderRadiusSize,
	updateAllCSSVariables,
	setGeneralCssVar,
	createCSSVariableManager,
	type CSSVariableManager,
	setSchemeTheme,
	isDark,
	systemTheme,
	resetBgImage,
} from '@/utils/theme-config'
import type { UploadProps, UploadRequestOptions, UploadRequestHandler } from 'element-plus'
import type { GlobalTheme, Theme } from '@/types/theme'
import JsonConfigDialog from './JsonConfigDialog.vue'
import { smartUpload, validateFileType } from '@/utils/upload-utils'
import { useImportExportController } from './useController'

const { globalTheme } = useGlobalStore() // 全局主题状态
const { getPanelTheme, savaPanelTheme } = getConfigStore() // 获取面板主题、设置面板主题

// 导入导出控制器
const { importLoading, exportLoading, handleImportConfig, handleExportConfig } = useImportExportController()

// 文件名和路径存储
const uploadFileInfo = ref<Record<string, { fileName: string; filePath: string }>>({})

// 初始化标志位，确保只在首次加载时应用主题
const isInitialLoad = ref(true)

// 消息提示
const message = useMessage()

// 初始化主题管理器
const themeManager: CSSVariableManager = createCSSVariableManager()

// 确保window.themeManager存在
if (typeof window !== 'undefined') {
	;(window as any).themeManager = themeManager
}

// 统一的颜色预设方案，与主题设置保持一致
const unifiedColorPresets = {
	light: '#ffffff', // 纯白色
	default: '#20a53a', // 宝塔绿
	forest: '#14892b', // 森林绿
	grey: '#3c444d', // 深灰蓝
	violet: '#8B5CF6', // 紫罗兰
	sky: '#0EA5E9', // 天空蓝
	pink: '#F472B6', // 樱花粉
	emerald: '#10B981', // 翡翠绿
	// orange: '#F97316', // 活力橙
}

// 颜色方案配置 - 与侧边栏颜色保持一致
const colorSchemes = {
	default: { primary: '#20a53a', secondary: '#47a559', label: '宝塔绿', gradient: 'linear-gradient(135deg, #20a53a 0%, #47a559 100%)' },
	forest: { primary: '#14892b', secondary: '#1ea639', label: '森林绿', gradient: 'linear-gradient(135deg, #14892b 0%, #1ea639 100%)' },
	grey: { primary: '#3c444d', secondary: '#5a6c7d', label: '深灰蓝', gradient: 'linear-gradient(135deg, #3c444d 0%, #5a6c7d 100%)' },
	violet: { primary: '#8B5CF6', secondary: '#A855F7', label: '紫罗兰', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' },
	sky: { primary: '#0EA5E9', secondary: '#38BDF8', label: '天空蓝', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)' },
	pink: { primary: '#F472B6', secondary: '#EC4899', label: '樱花粉', gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' },
	emerald: { primary: '#10B981', secondary: '#34D399', label: '翡翠绿', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
	// orange: { primary: '#F97316', secondary: '#FB923C', label: '活力橙', gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
	light: { primary: '#ffffff', secondary: '#f8f9fa', label: '纯白色', gradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' },
}

// 默认配置值 - 符合GlobalTheme类型定义
const defaultConfig: GlobalTheme = {
	theme: {
		preset: 'light',
		color: '#20a53a',
		view: 'default',
	},
	logo: {
		image: '/static/icons/logo-white.svg',
		favicon: '/static/favicon.ico',
	},
	sidebar: {
		dark: true,
		color: '#3c444d',
		opacity: 100,
	},
	interface: {
		rounded: 'small',
		is_show_bg: true,
		bg_image: '/static/images/bg-default.png',
		bg_image_opacity: 20,
		content_opacity: 70,
		shadow_color: '#000000',
		shadow_opacity: 5,
	},
	home: {
		overview_view: 'default',
		overview_size: 24,
	},
	login: {
		is_show_logo: true,
		logo: '/static/icons/logo-green.svg',
		is_show_bg: false,
		bg_image: '',
		bg_image_opacity: 70,
		content_opacity: 100,
	},
}

// 主题模式配置
const themeModes = computed(() => [
	{
		value: 'auto',
		label: '自动',
		active: globalTheme.value.theme?.preset === 'auto',
		icon: systemTheme.value === 'dark' ? 'tools-adaptive-dark' : 'tools-adaptive-light',
	},
	{
		value: 'light',
		label: '浅色',
		active: globalTheme.value.theme?.preset === 'light',
		icon: 'tools-light',
	},
	{
		value: 'dark',
		label: '深色',
		active: globalTheme.value.theme?.preset === 'dark',
		icon: 'tools-dark',
	},
])

// 颜色方案选项 - 根据主题模式动态过滤
const colorSchemeOptions = computed(() => {
	const options = Object.entries(colorSchemes)
		.filter(([key]) => {
			// 在暗色模式下隐藏深灰蓝颜色和纯白色
			if (isDark.value && key === 'grey') return false
			if (key === 'light') return false
			return true
		})
		.map(([key, scheme]) => ({
			key,
			label: scheme.label,
			gradient: scheme.gradient,
			active: globalTheme.value.theme?.color === scheme.primary,
		}))
	return options
})

// 自定义主题颜色选项
const isCustomThemeColor = computed(() => {
	const currentColor = globalTheme.value.theme?.color
	if (!currentColor) return false

	// 检查当前颜色是否存在于预设颜色中
	const presetColors = Object.values(unifiedColorPresets)
	return !presetColors.includes(currentColor)
})

// 侧边栏颜色预设选项 - 根据主题模式动态过滤
const sidebarColorOptions = computed(() => {
	// 定义排序优先级：深灰蓝、纯白色、剩下正常排序
	const sortOrder = ['grey', 'light']

	const filteredEntries = Object.entries(unifiedColorPresets).filter(([key]) => {
		// 在暗色模式下隐藏深灰蓝颜色
		if (isDark.value && key === 'grey') return false
		return true
	})

	// 按照指定顺序排序
	const sortedEntries = filteredEntries.sort(([keyA], [keyB]) => {
		const indexA = sortOrder.indexOf(keyA)
		const indexB = sortOrder.indexOf(keyB)

		// 如果都在排序列表中，按照列表顺序
		if (indexA !== -1 && indexB !== -1) {
			return indexA - indexB
		}
		// 如果只有A在排序列表中，A排在前面
		if (indexA !== -1) return -1
		// 如果只有B在排序列表中，B排在前面
		if (indexB !== -1) return 1
		// 如果都不在排序列表中，保持原有顺序（按key字母排序）
		return keyA.localeCompare(keyB)
	})

	const options = sortedEntries.map(([key, color]) => ({
		key,
		color,
		label: getPresetName(key),
		active: globalTheme.value.sidebar.color === color,
	}))

	console.log(options)
	return options
})

// 自定义侧边栏颜色
const isCustomSidebarColor = computed(() => {
	const currentColor = globalTheme.value.sidebar.color
	if (!currentColor) return false

	// 检查当前颜色是否存在于预设颜色中
	const presetColors = Object.values(unifiedColorPresets)
	return !presetColors.includes(currentColor)
})

// 圆角选项
const borderRadiusOptions = computed(() => [
	{
		value: 'none',
		label: '直角',
		active: globalTheme.value.interface?.rounded === 'none',
	},
	{
		value: 'small',
		label: '小',
		active: globalTheme.value.interface?.rounded === 'small',
	},
	{
		value: 'medium',
		label: '中',
		active: globalTheme.value.interface?.rounded === 'medium',
	},
	{
		value: 'large',
		label: '大',
		active: globalTheme.value.interface?.rounded === 'large',
	},
])

// 首页概览显示方式选项
const overviewViewOptions = computed(() => [
	{
		value: 'default',
		label: '卡片模式',
		active: globalTheme.value.home?.overview_view === 'default',
		icon: '<rect x="2" y="2" width="9" height="7" rx="1" fill="currentColor" opacity="0.3" /><rect x="3" y="6" width="7" height="1.5" rx="0.5" fill="currentColor" /><rect x="13" y="2" width="9" height="7" rx="1" fill="currentColor" opacity="0.3" /><rect x="14" y="6" width="7" height="1.5" rx="0.5" fill="currentColor" /><rect x="2" y="13" width="9" height="7" rx="1" fill="currentColor" opacity="0.3" /><rect x="3" y="17" width="7" height="1.5" rx="0.5" fill="currentColor" /><rect x="13" y="13" width="9" height="7" rx="1" fill="currentColor" opacity="0.3" /><rect x="14" y="17" width="7" height="1.5" rx="0.5" fill="currentColor" />',
	},
	{
		value: 'tile',
		label: '经典模式',
		active: globalTheme.value.home?.overview_view === 'tile',
		icon: '<circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" /><path d="M 6 2 A 4 4 0 0 1 9.464 4.464" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" /><circle cx="18" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" /><path d="M 18 2 A 4 4 0 1 1 14.536 7.464" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" /><circle cx="6" cy="18" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" /><path d="M 6 14 A 4 4 0 1 1 2.536 19.464" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" /><circle cx="18" cy="18" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" /><path d="M 18 14 A 4 4 0 0 1 21.464 16.464" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" />',
	},
])

/**
 * @description 获取预设颜色名称
 * @param {string} name 颜色名称
 * @returns {string} 颜色名称
 */
const getPresetName = (name: string) => {
	const nameMap: Record<string, string> = {
		default: '宝塔绿',
		grey: '深灰蓝',
		violet: '紫罗兰',
		sky: '天空蓝',
		pink: '樱花粉',
		emerald: '翡翠绿',
		forest: '森林绿',
		// orange: '活力橙',
		light: '纯白色',
	}
	return nameMap[name] || name
}

/**
 * @description 切换默认主题
 * @param {boolean} dark 暗色主题
 */
const cutDefaultTheme = async (theme: Theme) => {
	try {
		globalTheme.value.theme.preset = theme
		setSchemeTheme(theme)
		await handleSave(false)
		message.success(isDark.value ? '已切换到深色主题' : '已切换到浅色主题')
	} catch (error: any) {
		message.error(error)
	}
}

/**
 * @description 处理颜色方案变更
 * @param {string} scheme 颜色方案
 */
const handleColorSchemeChange = async (scheme: string) => {
	try {
		const colors = colorSchemes[scheme as keyof typeof colorSchemes] // 获取颜色方案
		globalTheme.value.theme.color = colors.primary
		await setTheme(colors.primary, window.themeManager)
		await handleSave(false)
		message.success(`已应用${colors.label}配色方案`)
	} catch (error: any) {
		message.error(error)
	}
}

/**
 * @description 处理深色侧边栏开关变更
 * @param {string | number | boolean} value 开关值
 * @returns {Promise<void>}
 */
const handleDarkSidebarChange = async (value: string | number | boolean) => {
	if (isInitialLoad.value) return
	const boolValue = Boolean(value)
	try {
		if (!globalTheme.value.sidebar) {
			globalTheme.value.sidebar = { dark: false, color: '#3c444d', opacity: 100 }
		}
		globalTheme.value.sidebar.dark = boolValue
		if (boolValue) {
			// 开启深色侧边栏时，使用当前主题颜色或默认颜色
			setSidebarTheme(globalTheme.value.sidebar.color || '#3c444d', themeManager)
		} else {
			// 关闭深色侧边栏时，设置为浅色
			setSidebarTheme('#ffffff', themeManager)
		}
		await handleSave(false)
		message.success(boolValue ? '已开启深色侧边栏，可自定义颜色方案' : '已关闭深色侧边栏')
	} catch (error: any) {
		message.error(error)
	}
}

/**
 * @description 自定义侧边栏颜色
 * @param {string} color 颜色值
 * @returns {void}
 */
const cutSidebarColor = async (color: string) => {
	try {
		if (isDark.value) {
			message.error('深色主题下不支持自定义侧边栏颜色')
			return
		}
		const colors = colorSchemes[color as keyof typeof colorSchemes] // 获取颜色方案
		globalTheme.value.sidebar.color = colors.primary
		setSidebarTheme(color, window.themeManager)
		await handleSave(false)
		message.success(`已自定义侧边栏颜色，${colors.label}`)
	} catch (error: any) {
		message.error(error)
	}
}

/**
 * @description 处理滑块对应的透明度
 * @param {string} key 透明度键名
 */
const handleSliderChange = useDebounceFn(async (key: string) => {
	switch (key) {
		case 'menu-sidebar-bg-opacity':
			setOpacityTheme(globalTheme.value.sidebar.opacity / 100, key, window.themeManager)
			break
		case 'main-bg-images-opacity':
			setOpacityTheme(globalTheme.value.interface.bg_image_opacity / 100, key, window.themeManager)
			break
		case 'main-content-opacity':
			setOpacityTheme(globalTheme.value.interface.content_opacity / 100, key, window.themeManager)
			break
		case 'main-shadow-opacity':
			setOpacityTheme(globalTheme.value.interface.shadow_opacity / 100, key, window.themeManager)
			break
	}
	await handleSave(false)
}, 500)

/**
 * @description 处理圆角变更
 * @param {string} radius 圆角值
 */
const handleBorderRadiusChange = async (radius: string) => {
	try {
		globalTheme.value.interface.rounded = radius
		setBorderRadiusTheme(radius as BorderRadiusSize, window.themeManager)
		await handleSave(false)
		const radiusLabel = radius === 'none' ? '直角' : radius === 'small' ? '小' : radius === 'medium' ? '中' : '大'
		message.success(`已应用${radiusLabel}圆角`)
	} catch (error: any) {
		message.error(error?.message || error || '设置圆角失败')
	}
}

/**
 * @description 处理阴影颜色变更
 */
const handleShadowColorChange = async () => {
	try {
		setShadowColorTheme(globalTheme.value.interface.shadow_color, window.themeManager)
		await handleSave(false)
		message.success(`已应用阴影颜色${globalTheme.value.interface.shadow_color}`)
	} catch (error: any) {
		message.error(error?.message || error || '设置阴影颜色失败')
	}
}

/**
 * @description 处理首页字体大小变更
 */
const handleHomeFontSizeChange = async () => {
	try {
		setHomeFontSize(globalTheme.value.home.overview_size, window.themeManager)
		await handleSave(false)
		message.success(`已应用首页字体大小${globalTheme.value.home.overview_size}px`)
	} catch (error: any) {
		message.error(error?.message || error || '设置首页字体大小失败')
	}
}

/**
 * @description 处理首页概览显示方式变更
 * @param {string | number | boolean} view 显示方式
 */
const handleOverviewViewChange = async (view: string | number | boolean) => {
	try {
		if (!globalTheme.value.home) {
			globalTheme.value.home = { overview_view: 'default', overview_size: 24 }
		}
		globalTheme.value.home.overview_view = view as string
		await handleSave(false)
		const viewLabel = view === 'default' ? '默认模式' : '经典模式'
		message.success(`已应用${viewLabel}显示方式`)
	} catch (error: any) {
		message.error(error?.message || error || '设置概览显示方式失败')
	}
}

/**
 * @description 设置背景图片显示状态
 * @param {string | number | boolean} val 显示状态
 */
const setMainBgImagesShow = async (val: string | number | boolean) => {
	try {
		if (isInitialLoad.value) return
		const boolVal = Boolean(val)
		globalTheme.value.interface.bg_image = boolVal ? defaultConfig.interface.bg_image : ''
		await handleSave(false)
		message.success(boolVal ? '已显示背景图片' : '已隐藏背景图片')
	} catch (error) {
		message.error(error || '设置图片显示状态失败')
	}
}

/**
 * @description 处理登录logo图片图片显示
 * @param {string | number | boolean} val 显示状态
 */
const setLoginLogoShow = async (val: string | number | boolean) => {
	try {
		if (isInitialLoad.value) return
		const boolVal = Boolean(val)
		globalTheme.value.login.logo = boolVal ? defaultConfig.login.logo : ''
		await handleSave(false)
		message.success(boolVal ? '已显示登录logo图标' : '已隐藏登录logo图标')
	} catch (error) {
		message.error(error || '设置登录logo显示状态失败')
	}
}

/**
 * @description 处理登录背景图片上传
 * @param {string | number | boolean} val 显示状态
 */
const setLoginBgShow = async (val: string | number | boolean) => {
	try {
		if (isInitialLoad.value) return
		const boolVal = Boolean(val)
		globalTheme.value.login.bg_image = boolVal ? defaultConfig.login.bg_image : ''
		await handleSave(false)
		message.success(boolVal ? '已显示登录背景图片相关设置' : '已隐藏登录背景图片相关设置')
	} catch (error) {
		message.error(error || '设置登录背景图片显示状态失败')
	}
}

// 获取上传参数 - 使用 theme-config 的 generateUploadData
const getUploadData = (type: string) => {
	return (file: File) => {
		// 使用 theme-config 的 generateUploadData 函数
		const uploadData = generateUploadData(type, file)

		// 保存文件名和路径信息，供上传成功后使用
		uploadFileInfo.value[type] = {
			fileName: uploadData.fName,
			filePath: `${uploadData.fPath}/${uploadData.fName}`,
		}

		return {
			action: uploadData.action,
			f_path: uploadData.fPath,
			f_name: uploadData.fName,
			f_size: uploadData.fSize,
			f_start: uploadData.fStart,
		}
	}
}

// 获取上传头信息 - 使用 theme-config 的 getUploadHeaders
const getUploadHeaders = () => {
	// 优先使用 theme-config 的实现，如果需要可以扩展
	const headers = themeGetUploadHeaders()
	// 添加项目特定的头信息
	if (!isDev && window.vite_public_request_token) {
		headers['x-http-token'] = window.vite_public_request_token
	}
	return headers
}

// 上传前检查
const beforeUpload: UploadProps['beforeUpload'] = file => {
	// 检查文件类型
	const isImage = file.type.startsWith('image/')
	if (!isImage) {
		message.error('只能上传图片文件!')
		return false
	}
	return true
}

// 自定义上传请求 - 使用新的上传工具函数
const customUploadRequest: UploadRequestHandler = async (options: UploadRequestOptions) => {
	const { file, data, onSuccess, onError } = options

	// 创建 UploadAjaxError 类型的错误对象
	const createUploadError = (message: string, status = 0, method = 'POST', url = '') => {
		const error = new Error(message) as any
		error.status = status
		error.method = method
		error.url = url
		return error
	}

	try {
		// 验证文件类型（图片文件）
		if (!validateFileType(file, ['image/'])) {
			message.error('只能上传图片文件!')
			const err = createUploadError('只能上传图片文件!')
			onError && onError(err)
			return
		}
		console.log('file', file, options)

		// 使用智能上传功能
		await smartUpload(file, {
			path: `/www/server/panel/BTPanel/static/temp/`,
			name: options.data.f_name as string,
			useChunked: file.size > 10 * 1024 * 1024, // 大于10MB使用分片上传
			onProgress: percent => {
				// 可以在这里添加进度显示逻辑
				console.log(`上传进度: ${percent}%`)
			},
			onSuccess: response => {
				message.success('上传成功')
				onSuccess && onSuccess(response)
			},
			onError: error => {
				console.error('上传失败:', error)
				message.error('上传失败')
				const err = createUploadError('上传失败')
				onError && onError(err)
			},
		})
	} catch (error) {
		console.error('上传请求失败:', error)
		message.error('上传失败')
		const err = createUploadError('上传失败')
		onError && onError(err)
	}
}

// 上传成功并自动保存
const handleUploadSuccessAndSave = async (response: any, type: string) => {
	if (response?.status) {
		// 使用上传时保存的文件路径信息
		if (uploadFileInfo.value[type]) {
			const { fileName } = uploadFileInfo.value[type]
			const staticPath = `/static/temp/${fileName}`

			switch (type) {
				case 'menu_logo':
					globalTheme.value.logo.image = staticPath
					break
				case 'favicon':
					globalTheme.value.logo.favicon = staticPath
					break
				case 'main_bg_images':
					globalTheme.value.interface.bg_image = staticPath
					resetBgImage()
					setGeneralCssVar('bt-main-bg-images', `url(${staticPath})`, window.themeManager)
					break
				case 'login_logo':
					globalTheme.value.login.logo = staticPath
					break
				case 'login_bg_images':
					globalTheme.value.login.bg_image = staticPath
					break
			}
			message.success('上传成功')
			// 自动保存并刷新
			await handleSave(['menu_logo', 'favicon'].includes(type))
		}
	}
}

// 保存设置
const handleSave = useDebounceFn(async (isReload: boolean = false) => {
	// 在保存前更新所有CSS变量
	await updateAllCSSVariables()

	await savaPanelTheme('正在保存界面设置...')
	setTimeout(() => {
		if (isReload) location.reload()
	}, 1000)
}, 200)

// 判断颜色是否非常亮（接近白色）
const isVeryLightColor = (hexColor: string): boolean => {
	// 将十六进制颜色转换为RGB
	const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
			  }
			: null
	}

	const rgb = hexToRgb(hexColor)
	if (!rgb) return false

	// 使用亮度公式计算颜色亮度
	const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000

	// 亮度阈值设为230，大于此值视为非常亮的颜色
	return brightness > 230
}

// 根据主题自动调整Logo颜色，增加反差
const autoAdjustLogo = (themeName: string, themeColor?: string) => {
	let shouldUseGreenLogo = false
	if (themeName === 'light') {
		// 白色主题使用绿色logo
		shouldUseGreenLogo = true
	} else if (themeName === 'custom' && themeColor) {
		// 自定义主题根据颜色亮度判断
		shouldUseGreenLogo = isVeryLightColor(themeColor)
	}

	// 执行logo切换逻辑
	if (!globalTheme.value.logo) globalTheme.value.logo = { image: '', favicon: '' }
	if (shouldUseGreenLogo) {
		// 需要使用绿色logo时，如果当前是白色logo则切换
		if (globalTheme.value.logo.image === '/static/icons/logo-white.svg') {
			globalTheme.value.logo.image = '/static/icons/logo-green.svg'
		}
	} else {
		// 需要使用白色logo时，如果当前是绿色logo则切换
		if (globalTheme.value.logo.image === '/static/icons/logo-green.svg') {
			globalTheme.value.logo.image = '/static/icons/logo-white.svg'
		}
	}
}

// 处理自定义颜色预览
const handleCustomColorPreview = async (color: string | null) => {
	if (!color) return
	if (!globalTheme.value.theme) globalTheme.value.theme = { dark: false, color: '#3c444d', view: 'default' }
	globalTheme.value.theme.view = 'custom'
	globalTheme.value.theme.color = color

	// 自动调整Logo颜色（仅用于预览）
	autoAdjustLogo('custom', color)

	// 使用 setTheme 函数应用颜色到页面进行预览
	await setTheme(color)

	// 如果开启了深色侧边栏，同时更新侧边栏主题
	if (globalTheme.value.sidebar?.dark) {
		setSidebarTheme(color, themeManager)
	}
}

// 设置侧边栏背景透明度
const setSidebarOpacity = (opacity: number) => {
	const sidebarColor = globalTheme.value.theme?.color || '#3c444d'
	if (globalTheme.value.sidebar?.dark) {
		setSidebarTheme(sidebarColor, themeManager)
	} else {
		setSidebarTheme('#ffffff', themeManager)
	}
}

// 设置界面背景图片相关变量
const setInterfaceBackgroundVariables = () => {
	if (!globalTheme.value.interface) return

	const variables: Record<string, string> = {}

	// 背景图片
	if (globalTheme.value.interface.bg_image) {
		variables['main-bg-image'] = `url(${globalTheme.value.interface.bg_image})`
	}

	// 背景图片透明度
	if (globalTheme.value.interface.bg_image_opacity !== undefined) {
		variables['main-bg-opacity'] = String(globalTheme.value.interface.bg_image_opacity / 100)
	}

	// 内容透明度
	if (globalTheme.value.interface.content_opacity !== undefined) {
		variables['main-content-opacity'] = String(globalTheme.value.interface.content_opacity / 100)
	}

	// 阴影透明度
	if (globalTheme.value.interface.shadow_opacity !== undefined) {
		const shadowColor = globalTheme.value.interface.shadow_color || '#000000'
		variables['main-shadow-opacity'] = String(globalTheme.value.interface.shadow_opacity / 100)
		variables['main-shadow-rgba'] = `rgba(${shadowColor
			.slice(1)
			.match(/.{2}/g)
			?.map(hex => parseInt(hex, 16))
			.join(', ')}, ${globalTheme.value.interface.shadow_opacity / 100})`
	}

	setCssVariables(themeManager, variables)
	mountCssVariable(themeManager)
}

// 设置登录页面相关变量
const setLoginVariables = () => {
	if (!globalTheme.value.login) return

	const variables: Record<string, string> = {}

	// 登录logo
	if (globalTheme.value.login.logo) {
		variables['login-logo-image'] = `url(${globalTheme.value.login.logo})`
	}

	// 登录背景图片
	if (globalTheme.value.login.bg_image) {
		variables['login-bg-image'] = `url(${globalTheme.value.login.bg_image})`
	}

	// 登录背景透明度
	if (globalTheme.value.login.bg_image_opacity !== undefined) {
		variables['login-bg-opacity'] = String(globalTheme.value.login.bg_image_opacity / 100)
	}

	// 登录内容透明度
	if (globalTheme.value.login.content_opacity !== undefined) {
		variables['login-content-opacity'] = String(globalTheme.value.login.content_opacity / 100)
	}

	setCssVariables(themeManager, variables)
	mountCssVariable(themeManager)
}

// 处理自定义颜色确认变化，精简版本
const handleCustomColorChange = async (color: string | null) => {
	if (!color) return

	// 设置为自定义主题
	if (!globalTheme.value.theme) globalTheme.value.theme = { dark: false, color: '#3c444d', view: 'default' }
	globalTheme.value.theme.view = 'custom'
	globalTheme.value.theme.color = color

	// 自动调整Logo颜色
	autoAdjustLogo('custom', color)

	// 使用 setTheme 函数应用颜色到页面
	await setTheme(color)

	// 如果开启了深色侧边栏，同时更新侧边栏主题
	if (globalTheme.value.sidebar?.dark) {
		setSidebarTheme(color, themeManager)
	}

	// 直接保存设置
	await handleSave(false)
	message.success('自定义颜色已应用')
}

// 处理主题自定义颜色预览
const handleCustomThemeColorPreview = async (color: string | null) => {
	if (!color) return
	globalTheme.value.theme.color = color

	// 自动调整Logo颜色（仅用于预览）
	autoAdjustLogo('custom', color)

	// 使用 setTheme 函数应用颜色到页面进行预览
	await setTheme(color)
}

// 处理主题自定义颜色确认变化
const handleCustomThemeColorChange = async (color: string | null) => {
	if (!color) return
	// globalTheme.value.theme.view = 'custom'
	globalTheme.value.theme.color = color

	// 自动调整Logo颜色
	autoAdjustLogo('custom', color)

	// 使用 setTheme 函数应用颜色到页面
	await setTheme(color)

	// 直接保存设置
	await handleSave(false)
	message.success('自定义主题颜色已应用')
}

// 恢复单个默认设置
const handleRestoreDefault = async (type: string) => {
	try {
		await useConfirm({
			title: '恢复默认设置',
			content: `确定要恢复${getConfigName(type)}为默认值吗？`,
		})

		// 根据类型恢复对应的嵌套属性
		if (type === 'theme_color' || type === 'theme_name') {
			if (!globalTheme.value.theme) globalTheme.value.theme = { dark: false, color: '#3c444d', view: 'default' }
			globalTheme.value.theme.view = 'default'
			globalTheme.value.theme.color = defaultConfig.theme.color
			// 应用颜色
			await setTheme(defaultConfig.theme.color)

			// 自动调整Logo颜色
			const themeName = globalTheme.value.theme.view
			const themeColor = themeName === 'custom' ? globalTheme.value.theme.color : undefined
			autoAdjustLogo(themeName, themeColor)

			// 更新侧边栏主题
			if (globalTheme.value.sidebar?.dark) {
				setSidebarTheme(defaultConfig.theme.color, themeManager)
			}
		}
		// 恢复各种配置项
		if (type === 'menu_logo') {
			globalTheme.value.logo.image = defaultConfig.logo.image
			// setLogoVariables()
		}
		if (type === 'favicon') {
			globalTheme.value.logo.favicon = defaultConfig.logo.favicon
			// setLogoVariables()
		}

		if (type === 'main_bg_images') {
			globalTheme.value.interface.bg_image = defaultConfig.interface.bg_image
			setInterfaceBackgroundVariables()
		}
		if (type === 'home_state_font_size') {
			globalTheme.value.home.overview_size = defaultConfig.home.overview_size
			setHomeFontSize(defaultConfig.home.overview_size, themeManager)
		}
		if (type === 'home_overview_view') {
			globalTheme.value.home.overview_view = defaultConfig.home.overview_view
		}
		if (type === 'menu_bg_opacity') {
			globalTheme.value.sidebar.opacity = defaultConfig.sidebar.opacity
			setSidebarOpacity(defaultConfig.sidebar.opacity)
		}
		if (type === 'main_content_opacity') {
			globalTheme.value.interface.content_opacity = defaultConfig.interface.content_opacity
			setInterfaceBackgroundVariables()
		}
		if (type === 'main_bg_images_opacity') {
			globalTheme.value.interface.bg_image_opacity = defaultConfig.interface.bg_image_opacity
			setInterfaceBackgroundVariables()
		}
		if (type === 'login_bg_images_opacity') {
			globalTheme.value.login.bg_image_opacity = defaultConfig.login.bg_image_opacity
			// setLoginVariables()
		}
		if (type === 'login_content_opacity') {
			globalTheme.value.login.content_opacity = defaultConfig.login.content_opacity
			// setLoginVariables()
		}
		if (type === 'login_bg_images') {
			globalTheme.value.login.bg_image = defaultConfig.login.bg_image
			// setLoginVariables()
		}
		if (type === 'login_logo') {
			globalTheme.value.login.logo = defaultConfig.login.logo
			// setLoginVariables()
		}
		if (type === 'main_shadow_color') {
			globalTheme.value.interface.shadow_color = defaultConfig.interface.shadow_color
			setInterfaceBackgroundVariables()
		}
		if (type === 'main_shadow_opacity') {
			globalTheme.value.interface.shadow_opacity = defaultConfig.interface.shadow_opacity
			setInterfaceBackgroundVariables()
		}

		await handleSave(true)
		message.success(`${getConfigName(type)}已恢复为默认值`)
	} catch (error) {}
}

// 获取配置项名称
const getConfigName = (type: string): string => {
	const nameMap: Record<string, string> = {
		menu_logo: 'Logo',
		favicon: '网站图标',
		login_bg_images: '登录背景图片',
		login_logo: '登录logo图片',
		main_bg_images: '主界面背景图片',
		theme_color: '侧边栏颜色',
		theme_name: '颜色主题',
		menu_bg_opacity: '侧边栏背景透明度',
		main_content_opacity: '内容透明度',
		main_bg_images_opacity: '主界面背景图片透明度',
		login_bg_images_opacity: '登录背景透明度',
		login_content_opacity: '登录内容透明度',
		main_shadow_color: '主界面阴影颜色',
		main_shadow_opacity: '主界面阴影透明度',
		home_state_font_size: '首页概览字体大小',
		home_overview_view: '首页概览显示方式',
	}
	return nameMap[type] || type
}

// 恢复默认配置（带确认对话框）
const handleRestoreAllDefaultsConfig = async () => {
	try {
		await useConfirm({
			title: '恢复默认配置',
			content: '确定要将当前主题的所有配置参数重置为系统预设的默认值吗？此操作不可撤销。',
		})

		// 直接赋值整个默认配置
		globalTheme.value = { ...defaultConfig }

		// 自动调整Logo颜色
		const themeName = globalTheme.value.theme?.view || 'default'
		const themeColor = themeName === 'custom' ? globalTheme.value.theme?.color : undefined
		autoAdjustLogo(themeName, themeColor)

		// 应用所有默认设置到页面
		setTheme(globalTheme.value.theme?.color || '#3c444d', themeManager)

		// 切换到浅色模式，恢复默认
		setSchemeTheme('light')

		// 更新所有CSS变量
		await updateAllCSSVariables()

		// 保存配置
		await handleSave()

		message.success('所有配置已恢复为默认值')
	} catch (error) {
		// 用户取消操作，不做任何处理
	}
}

// 打开JSON配置弹窗
const openJsonConfigDialog = async () => {
	await useDialog({
		title: '主题JSON配置',
		area: [70, 60],
		compData: {
			globalTheme: globalTheme.value,
			unifiedColorPresets: unifiedColorPresets,
		},
		showFooter: false,
		component: JsonConfigDialog,
	})
}

// 初始化
onMounted(async () => {
	await getPanelTheme()
	// 初始化时更新所有CSS变量
	await updateAllCSSVariables()
	// 初始化完成后，将标志位设为false
	isInitialLoad.value = false
})
</script>

<style lang="scss" scoped>
/* ===== 基础容器样式 ===== */
.ui-settings {
	padding: 20px 0;
	position: relative;
}

.ui-settings__json-config {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 10;
}

.ui-settings__section {
	margin-bottom: 40px;
	padding: 0 20px;
}

.ui-settings__section-title {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 16px;
	color: var(--el-color-text-primary);
}

.ui-settings__item {
	display: flex;
	margin-bottom: 24px;
	padding: 8px 16px;
	border-radius: var(--el-border-radius-extra-large);
	transition: background-color 0.3s ease;

	&:hover {
		background-color: var(--el-bg-color);
	}
}

.ui-settings__item-label {
	width: 120px;
	font-size: 14px;
	color: var(--el-color-text-secondary);
	padding-top: 14px;
}

.ui-settings__item-content {
	flex: 1;
	padding: 10px 24px;
}

/* ===== 通用组件样式 ===== */
.ui-settings__preview,
.ui-settings__bg-preview {
	margin-bottom: 10px;
	border: 1px dashed var(--el-color-border-dark);
	padding: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--el-color-text-tertiary);
	overflow: hidden;
	border-radius: var(--el-border-radius-base);
}

.ui-settings__preview {
	width: 80px;
	height: 80px;
	border-radius: var(--el-border-radius-extra-large);

	img {
		max-width: 80px;
		max-height: 80px;
	}
}

.ui-settings__bg-preview {
	width: 200px;
	height: 120px;

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: cover;
	}
}

.ui-settings__tip {
	font-size: 12px;
	margin-bottom: 10px;
	color: var(--el-color-text-tertiary);
}

.ui-settings__actions {
	display: flex;
	gap: 10px;
	align-items: center;
}

.ui-settings__switch {
	display: flex;
	align-items: center;
	gap: 8px;
}

.ui-settings__uploader {
	display: inline-block;
}

/* ===== 透明度设置样式 ===== */
.ui-settings__opacity-setting {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 15px;
}

.ui-settings__opacity-label {
	font-size: 14px;
	color: var(--el-color-text-secondary);
	white-space: nowrap;
}

.ui-settings__opacity-tip {
	font-size: 12px;
	color: var(--el-color-text-tertiary);
	white-space: nowrap;
}

/* ===== 网格布局样式 ===== */
.ui-settings__color-grid,
.ui-settings__scheme-grid,
.ui-settings__radius-grid,
.ui-settings__theme-grid,
.ui-settings__overview-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, 64px);
	gap: 8px;
	justify-content: start;
	margin-bottom: 10px;
}

/* ===== 通用选项基础样式 ===== */
.ui-settings__color-item,
.ui-settings__theme-option,
.ui-settings__scheme-option,
.ui-settings__radius-option,
.ui-settings__overview-option {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 10px 8px;
	border: 2px solid var(--el-border-color-light);
	border-radius: var(--el-border-radius-extra-large);
	cursor: pointer;
	transition: all 0.3s ease;
	background: var(--el-bg-color);
	width: 64px;
	height: 64px;
	text-align: center;
	position: relative;

	&:hover {
		border-color: var(--el-color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	&--active {
		border-color: var(--el-color-primary);
		color: var(--el-color-primary);
		box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

		&::after {
			content: '';
			position: absolute;
			top: 8px;
			right: 4px;
			width: 8px;
			height: 8px;
			background-color: var(--el-color-primary);
			border-radius: 50%;
		}
	}
}

/* ===== 颜色预设样式 ===== */
.ui-settings__color-preview,
.ui-settings__scheme-color {
	width: 28px;
	height: 18px;
	min-height: 18px;
	border-radius: 4px;
	margin-bottom: 2px;
	border: 1px solid var(--el-border-color-lighter);
}

.ui-settings__color-label,
.ui-settings__scheme-label,
.ui-settings__theme-label,
.ui-settings__radius-label,
.ui-settings__overview-label {
	font-size: 11px;
	line-height: 1.1;
	color: var(--el-color-text-secondary);
	font-weight: 500;
}

.ui-settings__color-check {
	position: absolute;
	top: -4px;
	right: 0px;
	z-index: 1;
	color: var(--el-color-white);
	font-size: 12px;
	font-weight: bold;

	&--large {
		font-size: 18px;
		text-shadow: 0 1px 2px rgba(var(--el-color-black-rgb), 0.5);
	}
}

.ui-settings__color-name {
	font-size: 12px;
	color: var(--el-color-white);
	text-shadow: 0 1px 2px rgba(var(--el-color-black-rgb), 0.5);
	background-color: rgba(var(--el-color-black-rgb), 0.3);
	padding: 2px 6px;
	border-radius: var(--el-border-radius-large);
	margin-top: 5px;
}

/* ===== 自定义颜色选择器样式 ===== */
.ui-settings__color-item--custom,
.ui-settings__scheme-option--custom {
	background-color: var(--el-fill-color-light);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;

	:deep(.el-color-picker) {
		width: 28px;
		height: 18px;
		transform: scale(0.8);
		margin-bottom: 0;
	}

	:deep(.el-color-picker__mask) {
		height: 18px;
	}

	:deep(.el-color-picker__trigger) {
		padding: 0;
		width: 28px;
		height: 18px;
		border-radius: 4px;
		border: 1px solid var(--el-color-border);
	}

	&:hover {
		border-color: var(--el-color-primary);
		background: var(--el-color-primary-light-9);
	}

	&.ui-settings__color-item--active,
	&.ui-settings__scheme-option--active {
		border-color: var(--el-color-primary);
		border-style: solid;
		background-color: var(--el-color-success-light-9);
		box-shadow: 0 3px 10px rgba(var(--el-color-black-rgb), 0.25);
		transform: translateY(-2px);

		&::after {
			content: '';
			position: absolute;
			top: -5px;
			right: -5px;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background-color: var(--el-color-primary);
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
}

.ui-settings__custom-label {
	position: absolute;
	bottom: -18px;
	font-size: 11px;
	color: var(--el-color-text-secondary);
	white-space: nowrap;
	text-align: center;
}

/* ===== 主题选项特殊样式 ===== */
.ui-settings__theme-option {
	border-radius: var(--el-border-radius-extra-large);

	&--disabled {
		opacity: 0.6;
		cursor: not-allowed;

		&:hover {
			border-color: var(--el-border-color-light);
			background: var(--el-bg-color);
			transform: none;
			box-shadow: none;
		}
	}

	&--active {
		.ui-settings__theme-icon,
		.ui-settings__theme-label {
			color: var(--el-color-primary);
		}
	}
}

.ui-settings__theme-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	margin-bottom: 2px;
	color: var(--el-color-text-primary);
}

/* ===== 版本选择器样式 ===== */
.ui-settings__version-option {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 16px 12px;
	border: 2px solid var(--el-color-border);
	border-radius: var(--el-border-radius-large);
	background-color: rgb(var(--el-color-white-rgb));
	cursor: pointer;
	transition: all 0.3s ease;
	width: 80px;
	height: 80px;
	position: relative;
	text-align: center;

	&:hover {
		border-color: var(--el-color-primary);
		background-color: var(--el-fill-color-light);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	&--active {
		border-color: var(--el-color-primary);
		background-color: var(--el-color-primary-light-9);
		box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

		&::after {
			content: '';
			position: absolute;
			top: 6px;
			right: 6px;
			width: 8px;
			height: 8px;
			background-color: var(--el-color-primary);
			border-radius: 50%;
		}

		.ui-settings__version-icon,
		.ui-settings__version-label {
			color: var(--el-color-primary);
		}
	}
}

.ui-settings__version-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	color: var(--el-color-text-primary);
	margin-bottom: 4px;
}

.ui-settings__version-label {
	font-size: 13px;
	color: var(--el-color-text-secondary);
	font-weight: 500;
	line-height: 1.2;
}

/* ===== 方案选择器激活状态 ===== */
.ui-settings__scheme-option--active,
.ui-settings__radius-option--active,
.ui-settings__overview-option--active {
	.ui-settings__scheme-label,
	.ui-settings__radius-label,
	.ui-settings__overview-label {
		color: var(--el-color-primary);
	}
}

/* ===== 圆角选择器样式 ===== */
.ui-settings__radius-option {
	border: 2px solid var(--el-color-border);
	border-radius: var(--el-border-radius-large);

	&:hover {
		border-color: var(--el-color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	&--active {
		border-color: var(--el-color-primary);
		color: var(--el-color-primary);
		box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

		&::after {
			content: '';
			position: absolute;
			top: 6px;
			right: 6px;
			width: 8px;
			height: 8px;
			background-color: var(--el-color-primary);
			border-radius: 50%;
		}
	}
}

.ui-settings__radius-preview {
	width: 28px;
	height: 18px;
	min-height: 18px;
	background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-dark-2));
	border: 1px solid var(--el-color-border-light);
	margin-bottom: 2px;
}

.ui-settings__radius-preview--none {
	border-radius: 0px;
}

.ui-settings__radius-preview--small {
	border-radius: 4px;
}

.ui-settings__radius-preview--medium {
	border-radius: 8px;
}

.ui-settings__radius-preview--large {
	border-radius: 12px;
}

.ui-settings__radius-label,
.ui-settings__overview-label {
	font-size: 11px;
	color: var(--el-color-text-secondary);
	font-weight: 500;
	line-height: 1.1;
}

/* 开关控制样式 */
.ui-settings__switch {
	display: flex;
	align-items: center;
	gap: 8px;
}

/* 背景预览样式 */
.ui-settings__bg-preview {
	margin-bottom: 10px;
	border: 1px dashed var(--el-color-border-dark);
	padding: 8px;
	width: 200px;
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--el-color-text-tertiary);
	overflow: hidden;
	border-radius: var(--el-border-radius-base);
}

.ui-settings__bg-preview img {
	max-width: 100%;
	max-height: 100%;
	object-fit: cover;
}

/* 保存按钮样式 */
.ui-settings__save-btn {
	display: flex;
	gap: 12px;
	padding: 20px;
	justify-content: left;
	border-top: 1px solid var(--el-border-color-light);
	margin-top: 20px;
}
</style>

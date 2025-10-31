// import { isDev } from '@/utils'
// import { useNegotiate } from '@/hooks/tools'
import { useResizeObserver, useTitle } from '@vueuse/core'
import { useGlobalStore } from '@store/global'
import { onMounted, watch, defineComponent, version as vueVersion, toRefs, computed, ref, unref, reactive, onBeforeUnmount } from 'vue'
import { useMountExtension } from '@/plugin/hooks'
import { useAxios, useDialog, useMessage, useConfirm, useNegotiate, Message, useIdle } from '@/hooks/tools'
import { getByteUnit, getRandomPwd, isUndefined, inputFocus, rsaEncrypt, isDev } from '@/utils'
import { fileSelectionDialog, productPaymentDialog } from '@/public'
import { getLoginStatus } from '@/api/global'
import { useRoute } from 'vue-router'
import { ElTooltip, ElButton, ElCard, ElForm, ElFormItem, ElIcon, ElInput, ElPopover, ElTable, ElTableColumn, ElDropdownItem, ElDropdownMenu, ElDropdown, ElSelect, ElOption } from 'element-plus'
import BtDialog from '@/components/extension/bt-dialog/index.vue'
import BtLink from '@/components/base/bt-link'
import BtInputIcon from '@/components/form/bt-input-icon'
import BtSvgIcon from '@/components/base/bt-svg-icon'
import BtInput from '@/components/form/bt-input'
import BtTable from '@/components/data/bt-table'
import BtTableGroup from '@/components/extension/bt-table-group'
import BtImage from '@/components/base/bt-image'
import BtDivider from '@/components/other/bt-divider'

const routePath = computed(() => useRoute()?.path || '')
const { title, panel, robserver, layoutBody, mainWidth, mainHeight, updateTaskCount, mountMessage, payment, aliyunEcsLtd } = useGlobalStore()

/**
 * @description 卸载Global 初始化配置
 */
export const unmountGlobalEvent = () => {
	if (robserver.value && robserver.value.disconnect) {
		robserver.value.disconnect()
		robserver.value = null
	}
}

const extensionMount = () => {
	// return false
	return useMountExtension({
		vue: {
			defineComponent,
			version: vueVersion,
		},
		components: {
			BtDialog,
			BtInput,
			BtLink,
			BtInputIcon,
			BtSvgIcon,
			BtTable,
			BtTableGroup,
			ElButton,
			ElCard,
			ElAlert,
			ElForm,
			ElFormItem,
			ElDropdownItem,
			ElDropdownMenu,
			ElDropdown,
			ElTooltip,
			ElIcon,
			ElPopover,
			ElTable,
			ElInput,
			ElTableColumn,
			BtDivider,
			BtImage,
			ElSelect,
			ElOption,
		},
		hooks: {
			useMessage,
			useDialog,
			useAxios,
			useConfirm,
			Message,
			isUndefined,
			inputFocus,
			rsaEncrypt,
			isDev,
		},
		utils: {
			getByteUnit,
			getRandomPwd,
		},
		dialog: {
			fileSelectionDialog,
		},
		vueMethods: {
			ref,
			unref,
			reactive,
			watch,
			computed,
			onMounted,
			onBeforeUnmount,
		},
	})
}

// 刷新登录状态
const refreshLoginStatus = () => {
	setTimeout(() => {
		useIdle({
			request: async () => {
				try {
					if (routePath.value !== '/waf') await getLoginStatus()
				} catch (error) {
					await useConfirm({
						title: '登录验证已失效',
						content: '当前面板登录验证已失效，确认后重新登录',
						showClose: false,
					})
					window.location.href = '/login'
				}
			},
			timeout: 600000,
		})
	}, 600000)
}

/**
 * @description Global 初始化配置
 */
export const mountGlobalEvent = () => {
	const { msgBoxTaskCount } = toRefs(panel.value)
	// 监听标题变化
	watch(title, (value: string) => useTitle(value))
	// 监听消息盒子任务数量
	watch(msgBoxTaskCount, updateTaskCount)

	watch(
		aliyunEcsLtd,
		(value: boolean) => {
			if (value && payment.value.authType !== 'ltd') {
				productPaymentDialog({ compulsionLtd: true, showClose: false, disableEsc: true })
			}
		},
		{ immediate: true }
	)

	// 设置面板标题
	useTitle(title)
	// 刷新登录状态
	refreshLoginStatus()
	// 创建协商连接，用于消息推送
	useNegotiate()

	// 挂载事件
	robserver.value = useResizeObserver(layoutBody, entries => {
		const entry = entries[0]
		const { height } = entry.contentRect
		const footer = document.getElementById('layout-footer')
		const footerRect = footer?.getBoundingClientRect()
		const footerHeight = footerRect?.height || 0
		const footerWidth = footerRect?.width || 0
		const laymain = document.getElementById('layout-main')
		const laymainRect = laymain?.getBoundingClientRect()
		const laymainWidth = laymainRect?.width || 0
		mainWidth.value = (footerWidth || laymainWidth) - 32
		mainHeight.value = parseInt(`${height - footerHeight - 30}`, 10) // 2px为偏移和预留空间
	})
	// 挂载iface插件，注入依赖
	mountMessage()

	// 挂载专版插件，注入依赖
	window.$extension = extensionMount
}
/**
 * @description 获取FPS
 * @returns
 */
export const useFtps = () => {
	if (!isDev) return { BtFps: <span></span> }
	const fpsRef = ref()
	const fps = useFps()
	useDraggable(fpsRef, {
		initialValue: { x: 120, y: 120 },
	})
	return {
		BtFps: () => (
			<div ref={fpsRef} class="absolute top-[0px] right-[0px] cursor-move z-9999 text-small font-black text-white bg-darkPrimary shadow-gray-400 shadow-op-10 p-[5px]">
				FPS: <span>{fps.value}</span>
			</div>
		),
	}
}

<script lang="tsx">
import { Message } from '@/hooks/tools'
import { copyText, getRandomChart } from '@/utils'
import { siteRname } from '@api/site'
import { ElPopover } from 'element-plus'
export const EventBus = new EventTarget()

export default defineComponent({
	props: {
		onClick: {
			type: Function,
			default: () => {},
		},
		row: {
			type: Object,
			default: () => ({}),
		},
		refresh: {
			type: Function,
			default: () => {},
		},
	},
	setup(props, context) {
		const popoverVisible = ref<boolean>(false)
		const isShow = ref<boolean>(false)
		const contentVisible = ref<boolean>(false)

		const { row } = toRefs(props)
		const id = ref(`site-name-${getRandomChart(5)}-${row.value.id}`)

		const hideAllPopovers = () => {
			popoverVisible.value = false
		}

		const handleRename = () => {
			isShow.value = true
			popoverVisible.value = true // 显示弹窗
			const input = document.getElementById(id.value) as HTMLInputElement
			if (input) {
				setTimeout(() => {
					input.focus()
				}, 100)
			}
		}

		const handleEnter = (event: KeyboardEvent) => {
			if (event.key === 'Enter' || event.keyCode === 13) {
				handleBlur(event)
			}
		}

		const handleBlur = async (e: any) => {
			try {
				if (row.value.rname === e.target.value) {
					isShow.value = false
					popoverVisible.value = false // 如果没有更改，隐藏弹窗
					return
				}
				const res = await siteRname({ id: row.value.id, rname: e.target.value })
				Message.request(res)
				popoverVisible.value = false // 操作完成，隐藏弹窗
				isShow.value = false
				if (res.status) props.refresh()
			} catch (error) {
				popoverVisible.value = false // 操作完成，隐藏弹窗
			}
		}

		onMounted(() => {
			// 在 setup 或其他合适的生命周期钩子中
			EventBus.addEventListener('hide-all-popovers', hideAllPopovers)
		})

		onUnmounted(() => {
			EventBus.removeEventListener('hide-all-popovers', hideAllPopovers)
		})

		return () => (
			<div>
				<ElPopover placement="right" width="220" popper-class="myPopover" visible={popoverVisible.value}>
					{{
						default: () => (
							<div
								class="web_name_hover"
								onMouseenter={() => {
									contentVisible.value = true
								}}
								onMouseleave={() => {
									contentVisible.value = false
									if (!isShow.value) popoverVisible.value = false
								}}>
								<div class="web_name_title">
									网站名：
									<span class="web_name_text">
										{!isShow.value ? row.value.rname : ''}
										<input id={id.value} class={`bt-input ${isShow.value ? '' : 'hide'}`} onKeyup={handleEnter} onBlur={handleBlur} size="mini" value={row.value.rname} placeholder="点击编辑内容，按回车或失去焦点自动保存" style="width: 140px;"></input>
									</span>
								</div>
								<div class="web_name_setting">
									<span
										class="web_name_copy bt-link"
										onClick={() => {
											copyText({ value: row.value.rname })
										}}>
										<i class="svgtofont-icon-copy mr-4x text-secondary text-medium"></i>
										复制网站名
									</span>
									<span onClick={handleRename} class="web_name_rename bt-link">
										<i class="svgtofont-icon-memo-active mr-4x text-secondary text-medium"></i>
										重命名
									</span>
								</div>
							</div>
						),
						reference: () => (
							<span
								onMouseenter={() => {
									// 隐藏其他的popover
									EventBus.dispatchEvent(new CustomEvent('hide-all-popovers'))
									popoverVisible.value = true
								}}
								onMouseleave={() => {
									setTimeout(() => {
										if (!isShow.value && !contentVisible.value) popoverVisible.value = false
									}, 500)
								}}
								onClick={() => {
									props.onClick(row)
								}}
								class="justify-start bt-link cursor-pointer">
								{row.value.rname}
							</span>
						),
					}}
				</ElPopover>
			</div>
		)
	},
})
</script>

<style lang="css">
.web_name_hover {
	@apply inline-flex items-center text-secondary flex-col whitespace-nowrap w-full;
}
.web_name_title {
	@apply p-[.6rem] pr-0 max-w[30rem] w-[100%] leading-[1.4];
}
.web_name_text {
	@apply break-all max-w-[16rem] whitespace-normal;
}
.bt-input {
	@apply px-[4px] rounded-small leading-[2rem];
	border: 1px solid var(--el-color-white);
}
.bt-input.hide {
	display: none;
}
.bt-input:focus {
	outline: none;
	border: 1px solid var(--el-color-primary);
}
.web_name_setting {
	@apply flex border-t-dark border-t-[1px] items-center min-w-[18rem] pt-[.6rem] w-[100%];
}
.web_name_copy {
	@apply border-r-dark border-r-[1px];
}
.web_name_rename,
.web_name_copy {
	@apply w-[50%] justify-center text-center cursor-pointer flex items-center;
}
</style>

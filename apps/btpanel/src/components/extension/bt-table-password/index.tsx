import { copyText, getRandomPrefix } from '@/utils'

export default defineComponent({
	props: {
		onClickPwd: {
			type: Function,
			required: true,
		},
		modelValue: {
			type: String,
			default: '',
		},
	},
	setup(props) {
		const id = getRandomPrefix('copy', 16) // 复制id
		const isShow = ref(false) // 是否显示密码
		const isPassword = ref(true) // 是否有密码

		watchEffect(() => {
			isPassword.value = !!props.modelValue
		})

		watch(
			() => props.modelValue,
			() => {
				isShow.value = false
			}
		)

		/**
		 * @description: 是否显示密码
		 */
		const showPwdClass = computed(() => {
			return isShow.value ? 'svgtofont-icon-eye-close' : 'svgtofont-icon-browse'
		})

		/**
		 * @description 点击改密
		 * @returns
		 */
		const onClickPwd = () => props.onClickPwd()

		/**
		 * @description 复制密码
		 * @param {string} value 复制的值
		 */
		const copyPaw = (value: string) => {
			copyText({ value })
		}

		return () => (
			<div>
				{isPassword.value ? (
					<div class="flex items-center">
						{!isShow.value ? <span>**********</span> : <span class="block truncate max-w-[140px]">{props.modelValue}</span>}
						<i class={`mx-4 cursor-pointer text-default text-medium ${showPwdClass.value}`} title="显示密码" onClick={() => (isShow.value = !isShow.value)}></i>
						<i id={id} data-clipboard-text={props.modelValue} class="svgtofont-el-document-copy cursor-pointer text-default text-medium copy svgtofont-icon-copy" title="复制密码" onClick={() => copyPaw(props.modelValue)}></i>
					</div>
				) : (
					<div>
						<span class="text-tertiary">
							无法获取密码，请点击
							<span class="text-danger cursor-pointer" onClick={onClickPwd}>
								改密
							</span>
							重置密码!
						</span>
					</div>
				)}
			</div>
		)
	},
})

import BtErrorMask from '@/components/business/bt-error-mask/index.vue'
import { TableInstallExtProps } from '@table/types'
export interface ErrorMaskProps {
	code: string
}

export const useErrorMask = () => {
	const visible = ref<boolean>(false)
	const error = ref<ErrorMaskProps>()

	return {
		// 注册蒙层
		install: ({ tableConfig }: TableInstallExtProps) => {
			watch(
				() => tableConfig.error,
				val => {
					if (val?.code) {
						visible.value = true
						error.value = tableConfig.error
					} else {
						visible.value = false
					}
				},
				{ immediate: true }
			)
		},

		BtErrorMask: () => <>{visible.value ? <BtErrorMask options={error.value}></BtErrorMask> : null}</>,
	}
}

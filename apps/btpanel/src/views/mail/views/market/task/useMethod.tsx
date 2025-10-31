import useMailMarketTaskStore from './store'
import { taskShowVisible } from '../useMethod'

const { formModal } = storeToRefs(useMailMarketTaskStore())

export const onShowAdd = (data?: any) => {
	formModal.value.row = data
	formModal.value.isEdit = false
	taskShowVisible.value = true
}

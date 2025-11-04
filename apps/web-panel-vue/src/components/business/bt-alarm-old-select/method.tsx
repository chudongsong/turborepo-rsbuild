import BtFormItem from '@/components/form/bt-form-item'

import BtAlarmOldSelect from './index.vue'
import { getFormKey } from '@/hooks/tools/form/render'

/**
 * @description 表单行hook - 告警方式
 */
export const FormAlarmOldSelect = (
	label: string,
	key: string,
	other: { rules?: any[]; attrs?: any },
	change?: () => void
) => {
	return {
		type: 'custom',
		render: (formVal: Ref<AnyObject>) => {
			const keys = getFormKey({ key }, formVal)
			return (
				<BtFormItem label={label} prop={keys} rules={other?.rules || []}>
					<BtAlarmOldSelect v-model={formVal.value[keys]} {...(other?.attrs || {})} onChange={change} />
				</BtFormItem>
			)
		},
	}
}

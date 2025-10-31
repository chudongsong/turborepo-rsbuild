import BtButton from '@/components/base/bt-button'
import BtIcon from '@/components/base/bt-icon'
import BtLink from '@/components/base/bt-link'

import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { OperationOptionsProps, UseOperationProps } from './types'

/**
 * @description 操作hook
 * @param {UseOperationProps} props 参数
 */
export const useOperation = (props: UseOperationProps) => {
	const options = isRef(props.options) ? props.options : ref<OperationOptionsProps[]>(props.options)
	return {
		BtOperation: (props: AnyObject) => (
			<div class="flex items-center">
				{options.value.map((item: OperationOptionsProps) => {
					// 按钮
					if (item.type === 'button' || !item?.type) {
						return (
							<ElButton title={item.title} icon={item.icon} type={item?.active ? 'primary' : 'default'} onClick={item.onClick}>
								{item.icon && <BtIcon icon={item.icon} />}
								{item.label && <span>{item.label}</span>}
							</ElButton>
						)
					}

					// 链接
					if (item.type === 'link') {
						return (
							<BtLink class="bt-link mr-[10px]" href={item?.href} {...item} onClick={item.onClick}>
								{item.icon && <BtIcon icon={item.icon} />}
								{item.label && <span>{item.label}</span>}
							</BtLink>
						)
					}

					// 下拉
					if (item.type === 'dropdown') {
						return (
							<ElDropdown style="margin:0 10px" trigger="hover" split-button onClick={item.onClick}>
								{{
									default: () => <span>{item.label}</span>,
									dropdown: () => <ElDropdownMenu>{item.options?.map((option: OperationOptionsProps) => <ElDropdownItem onClick={option.onClick}>{option.label}</ElDropdownItem>)}</ElDropdownMenu>,
								}}
							</ElDropdown>
						)
					}

					// 分割线
					if (item.type === 'divider') {
						return <span class="bg-darkTertiary w-[1px] h-[16px] mx-[16px]" />
					}
					return item.render && item.render()
				})}
			</div>
		),
	}
}

import type { TableColumnProps } from '@/components/data/bt-table/types'

import { defineComponent, ref, toRefs } from 'vue'
import { ElDropdown, ElButton, ElDropdownMenu, ElDropdownItem, ElCheckbox } from 'element-plus'
import BtIcon from '@/components/base/bt-icon'
import { isBoolean } from '@/utils'

interface Props {
	name: string
	column: Array<TableColumnProps>
}

export default defineComponent<Props>({
	name: 'BtTableColumn',
	props: {
		name: {
			type: String,
			default: 'bt-table-column',
		},
		column: {
			type: Array as () => Array<TableColumnProps>,
			default: () => [],
		},
	},
	emits: ['change'],
	setup(props, { emit }) {
		const { column } = toRefs(props)
		const isDefault = ref(true)
		const noRender = ['selection', 'toping', 'notControl', 'CheckBox']
		const name = props.name !== 'bt-table-column' ? props.name : window.location.pathname

		const checkColumn = (type?: string) => {
			return type ? !noRender.includes(type) : true
		}

		const changeColumn = (value: any, item: any) => {
			if (item.showClick) item.showClick(value)
			emit('change', column.value)
			localStorage.setItem(`${name}_column`, JSON.stringify(column.value))
		}

		const init = () => {
			const columnList = localStorage.getItem(`${name}_column`)
			if (columnList) {
				try {
					const columnData = JSON.parse(columnList)
					if (Array.isArray(columnData)) {
						column.value.forEach((item, index) => {
							if (isBoolean(item.isCustom) && columnData[index]) {
								item.isCustom = columnData[index].isCustom
							}
						})
					}
				} catch (error) {
					// 解析失败时清空损坏的本地存储数据
					localStorage.removeItem(`${name}_column`)
				}
			}
		}

		onMounted(init)

		return () => (
			<div class="flex">
				<ElDropdown hide-on-click={false}>
					{{
						default: () => (
							<ElButton type="default" title="设置列表字段">
								<BtIcon icon="el-setting" size={15} />
							</ElButton>
						),
						dropdown: () => (
							<ElDropdownMenu class="px-[12px] py-[6px] custom-col-list">
								{column.value.map((item, index) =>
									checkColumn(item.type) ? (
										<ElDropdownItem key={index}>
											{isBoolean(item.isCustom) ? (
												<>
													<ElCheckbox v-model={item.isCustom} onChange={() => changeColumn(item.isCustom, item)}>
														{item.label || item.subtitle}
													</ElCheckbox>
													{item.isLtd && (
														<span class="ml-[4px] mt-[4px]">
															<i class="svgtofont-icon-ltd text-medium mr-[4px] text-ltd"></i>
														</span>
													)}
												</>
											) : (
												<ElCheckbox v-model={isDefault.value} disabled>
													{item.label || item.subtitle}
												</ElCheckbox>
											)}
										</ElDropdownItem>
									) : null
								)}
							</ElDropdownMenu>
						),
					}}
				</ElDropdown>
			</div>
		)
	},
})

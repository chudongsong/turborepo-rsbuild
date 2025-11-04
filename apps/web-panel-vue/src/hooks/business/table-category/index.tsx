import { SelectOptionProps } from '@/components/form/bt-select/types'
import { ResponseResult } from '@/types'
import BtTableClass from '@components/extension/bt-table-class/index.vue'
import { TableInstallExtProps } from '@table/types'

// 分类配置
interface CategoryProps {
	key?: string // 注册变量，用于扩展在插件中
	name: string // 分类名称
	options: CategoryOptionsProps[] | (() => CategoryOptionsProps[]) // 分类选项
	event: CategoryEventProps // 分类事件，用于增删改查
	ignore?: string[] // 忽略的分类值
	field?: string // 分类字段
	showEdit?: boolean // 新增控制编辑按钮显示的属性
}

// 分类选项
interface CategoryOptionsProps {
	label: string // 分类名称
	value: string // 分类值
}

// 分类事件
interface CategoryEventProps {
	get: () => Promise<SelectOptionProps[]> // 获取分类列表
	add: ({ ps }: { ps: string }) => Promise<ResponseResult> // 添加分类
	update: ({ id, ps }: { id: number; ps: string }) => Promise<ResponseResult> // 修改分类
	delete: ({ id }: { id: number }) => Promise<ResponseResult> // 删除分类
}

/**
 * @description 表格分类配置
 * @param {string} code 分类编码
 * @returns
 */
export const useTableCategory = ({ key, name, options, event, ignore, field, showEdit = true }: CategoryProps) => {
	const refs = ref()
	const modelValue = ref<string>('all') // 分类值
	const classList = ref(options instanceof Function ? options() : options) // 分类列表

	// 事件名称统一处理
	const classEvent = {
		getClassList: event.get,
		addClass: event.add,
		editClass: event.update,
		deleteClass: event.delete,
	}

	// 分类改变
	const onChange = (val: string) => {
		modelValue.value = val
	}

	// 分类更新
	const onUpdate = (options: any) => {
		classList.value = options as CategoryOptionsProps[]
	}

	return {
		// 分类注册
		init: ({ ref, param, columns, config, refresh }: TableInstallExtProps) => {
			watch(modelValue, val => {
				if (key) {
					param.value[key] = modelValue.value
					if (config.pageKeys.page && param.value[config.pageKeys.page] !== 1) {
						// 如果分页键名存在，则将分页设置为1,触发分页watch刷新
						param.value[config.pageKeys.page] = 1
					} else {
						// 如果分页键名不存在，则直接刷新
						refresh()
					}
				}
			})
			if (event.get) {
				event.get().then(data => {
					classList.value = data as CategoryOptionsProps[]
				})
			}

			return {
				BtTableCategory: defineComponent(() => {
					return () => <BtTableClass ref={refs} v-model={modelValue.value} name={name} options={classList.value} config={classEvent} showEdit={showEdit} onUpdate:options={onUpdate} onChange={onChange} ignore={ignore || []} field={field || 'ps'} />
				}),
				classList,
				categoryRef: () => refs.value,
			}
		},
		classList,
	}
}

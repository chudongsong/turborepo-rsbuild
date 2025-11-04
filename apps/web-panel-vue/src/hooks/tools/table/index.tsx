import BtButton from '@/components/base/bt-button'
import BtIcon from '@/components/base/bt-icon'
import BtErrorMask from '@/components/business/bt-error-mask/index.vue'
import BtPagination from '@/components/data/bt-pagination'
import BtTable from '@/components/data/bt-table'
import BtInputSearch from '@/components/extension/bt-input-search'
import BtSearchHistory from '@/components/business/bt-search-history'
import BtTableBatch from '@/components/extension/bt-table-batch'
import BtTableColumn from '@/components/extension/bt-table-column'
import BtRadio from '@/components/form/bt-radio'
import BtSelect from '@/components/form/bt-select'

import type { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import type { RadioOptionsProps } from '@/components/form/bt-radio/types'
import type { SelectOptionProps } from '@/components/form/bt-select/types'
import { isUndefined } from '@/utils'
import { useRoute } from 'vue-router'
import type { TableConfigProps, TableExtProps, UseTableProps, UseTableReturnProps } from './types'

/**
 * @description 表格
 * @param {UseTableProps} props 参数
 * @returns
 */
export const useTable = (props: UseTableProps): UseTableReturnProps => {
	const tableConfig = reactive<TableConfigProps>({
		loading: true, // 表格加载状态
		loadingTitle: '获取数据中,请稍候...', // 加载标题
		data: [], // 表格数据
		total: 0, // 表格总数
		other: {}, // 其他数据
		pageKeys: {
			page: '',
			limit: '',
		},
	}) // 表格加载状态
	const { request, sort } = props // 请求参数
	const tableRef = ref() // 表格实例
	const tableParam = ref({}) // 表格参数
	const refreshTime = ref(0) // 刷新表格数据
	const tableCol = ref(props.columns instanceof Function ? props.columns() : props.columns) // 表格列

	// 刷新表格数据
	const refresh = async () => {
		try {
			tableConfig.loading = true
			const { data, total, other } = await request(tableParam.value)
			tableConfig.data = data // 表格数据
			tableConfig.total = total || data.length // 表格总数
			tableConfig.other = other // 其他数据
			refreshTime.value = Date.now() // 刷新时间
		} catch (error) {
			console.warn(error)
		} finally {
			tableConfig.loading = false
		}
	}
	// 表格组件
	const Table = defineComponent(() => {
		return () => {
			return (
				<BtTable
					ref={tableRef}
					data={tableConfig.data}
					total={tableConfig.total}
					refreshTime={refreshTime.value}
					v-bt-loading={tableConfig.loading}
					v-bt-loading:title={tableConfig.loadingTitle}
					column={tableCol.value}
					onSortChange={(data: any) => {
						if (sort) sort(data, tableConfig)
					}}>
					{{
						// 当props.empty存在时 渲染props.empty插槽
						[props.empty ? 'empty' : 'other']: () => props.empty && props.empty(),
					}}
				</BtTable>
			)
		}
	})

	const param: UseTableReturnProps = {
		BtTable: Table,
		ref: tableRef,
		param: tableParam,
		config: tableConfig,
		refresh,
	}

	if (props.extension) {
		props.extension.forEach(item => {
			Object.assign(
				param,
				item.init({
					ref: tableRef,
					param: tableParam,
					columns: tableCol,
					config: tableConfig,
					refresh,
				})
			)
		})
	}
	nextTick(() => refresh())
	return param
}

/**
 * @description 动态表格
 * @param {UseTableProps} props 参数
 * @returns
 */
export const useDynamicTable = (props: UseTableProps) => {
	const extension = props.extension || []
	const allExtensions = extension.concat([useSearch(), usePage()])
	const tableConfig = useTable({ ...props, extension: allExtensions })
	return tableConfig
}

/**
 * @description 全部表格
 * @param {UseTableProps} props 参数
 * @returns
 */
export const useAllTable = (props: UseTableProps) => {
	const extension = props.extension || []
	const allExtensions = extension.concat([useSearch(), usePage(), useRefresh(), useColumn()])
	const tableConfig = useTable({ ...props, extension: allExtensions })
	return tableConfig as ReturnType<typeof useTable> & {
		BtSearch: ReturnType<typeof defineComponent>
		BtPage: ReturnType<typeof defineComponent>
		BtRefresh: ReturnType<typeof defineComponent>
		BtColumn: ReturnType<typeof defineComponent>
	}
}

/**
 * @description 表格搜索
 * @param {string} key 搜索key
 * @returns 返回搜索组件
 */
export const useSearch = (key: string = 'search') => {
	return {
		init: ({ ref, param, columns, config, refresh }: TableExtProps<{ serach: string }>) => {
			param.value[key] = ''
			return {
				BtSearch: defineComponent(() => {
					return () => (
						<BtInputSearch
							v-model={param.value[key]}
							disabledPopover={true}
							onSearch={() => {
								if (config.pageKeys.page && param.value[config.pageKeys.page] !== 1) {
									// 如果分页键名存在，则将分页设置为1,触发分页watch刷新
									param.value[config.pageKeys.page] = 1
								} else {
									// 如果分页键名不存在，则直接刷新
									refresh()
								}
							}}
							clearable></BtInputSearch>
					)
				}),
			}
		},
	}
}

/**
 * @description 表格分页
 * @param {{ page: string; limit: string }} keys 分页key 默认{ page: 'page', limit: 'limit' }
 * @returns 返回分页组件
 */
export const usePage = (keys: { page: string; limit: string } = { page: 'p', limit: 'limit' }) => {
	return {
		init: ({ ref, param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			const route = useRoute()
			const pageName = `${route?.fullPath.replace(/\//g, '_')}` // 用于存储分页名称
			const pageSize = useSessionStorage<number>(pageName, 10) // 用于存储分页显示条数

			param.value[keys.page] = 1
			param.value[keys.limit] = pageSize || 10
			watch(() => param.value[keys.page], refresh)
			watch(
				() => param.value[keys.limit],
				() => {
					nextTick(() => {
						if (param.value[keys.page] === 1) {
							refresh()
						}
					})
				}
			)
			config.pageKeys.page = keys.page
			config.pageKeys.limit = keys.limit
			return {
				BtPage: defineComponent({
					props: {
						type: {
							type: String,
							default: 'default',
						},
					},
					setup(props) {
						return () => <BtPagination class="mr-[6px]" v-model:page={param.value[keys.page]} v-model:row={param.value[keys.limit]} total={config.total} {...props} />
					},
				}),
			}
		},
	}
}

/**
 * @description 表格刷新
 * @returns 返回刷新组件
 */
export const useRefresh = (wait: number = 500) => {
	return {
		init: ({ param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			const isRefreshing = ref(false)
			const debouncedRefresh = useDebounceFn(async () => {
				isRefreshing.value = true
				await refresh()
				isRefreshing.value = false
			}, 100)

			return {
				BtRefresh: defineComponent(() => {
					return () => (
						<BtButton onClick={debouncedRefresh} disabled={isRefreshing.value}>
							<BtIcon icon="el-refresh" class={`${isRefreshing.value ? '!hidden' : ''}`} />
							<i class={`svgtofont-el-loading ${isRefreshing.value ? 'animation' : '!hidden'}`}></i>
						</BtButton>
					)
				}),
			}
		},
	}
}

/**
 * @description 表格列
 */
export const useColumn = () => {
	return {
		init: ({ ref, param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			return {
				BtColumn: defineComponent(() => {
					return () => <BtTableColumn column={columns.value} />
				}),
			}
		},
	}
}

/**
 * @description 表格批量操作
 */
export const useBatch = (options: TableBatchOptionsProps[]) => {
	return {
		init: ({ ref, param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			return {
				BtBatch: defineComponent(() => {
					return () => <BtTableBatch tableRef={ref.value} options={options} />
				}),
			}
		},
	}
}

/**
 * @description 表格刷新
 * @param isRefresh 是否刷新
 * @returns
 */
export const useRefreshList = (isRefresh: Ref<boolean>) => {
	return {
		init: ({ refresh }: TableExtProps<TableConfigProps>) => {
			watch(isRefresh, val => {
				if (val) {
					refresh()
					isRefresh.value = false
				}
			})
		},
	}
}

/**
 * @description 表格推荐列表
 */
export const useRecommendSearch = (
	key: string = 'search',
	options: {
		name: string
		key?: string
		list: Array<any>
		showHistory?: boolean // 是否显示搜索历史
		showRecommend?: boolean // 是否显示推荐列表
	}
) => {
	return {
		init: ({ param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			const history = ref() // 搜索历史
			param.value[key] = ''
			const showHistory = isUndefined(options.showHistory) ? true : options.showHistory
			const showRecommend = isUndefined(options.showRecommend) ? true : options.showRecommend
			// 计算是否禁用弹出框
			const disabledPopover = !showHistory && !showRecommend

			// 监听搜索历史
			watch(
				() => config.other,
				val => {
					if (val?.search_history) history.value = val.search_history
				}
			)

			const onSearch = () => {
				if (config.pageKeys.page && param.value[config.pageKeys.page] !== 1) {
					// 如果分页键名存在，则将分页设置为1,触发分页watch刷新
					param.value[config.pageKeys.page] = 1
				} else {
					// 如果分页键名不存在，则直接刷新
					refresh()
				}
			}

			return {
				BtRecommendSearch: defineComponent(() => {
					return () => (
						<BtInputSearch v-model={param.value[key]} onSearch={onSearch} disabledPopover={disabledPopover} clearable>
							<BtSearchHistory
								list={{
									historyList: history.value || [],
									recommendList: options.list || [],
								}}
								onSearch={(val: string) => {
									param.value[key] = val
									onSearch()
								}}
								onUpdate={(list: Array<any>) => {
									history.value = list
								}}
								showHistory={showHistory}
								showRecommend={showRecommend}
								name={options.name}
								keys={options?.key || ''}></BtSearchHistory>
						</BtInputSearch>
					)
				}),
			}
		},
	}
}

/**
 * @description 表格错误遮罩视图
 */

export const useErrorMask = () => {
	return {
		init: ({ param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			const visible = ref(false) // 是否显示
			const error = ref() // 错误信息

			// 监听错误信息
			watch(
				() => config.other,
				val => {
					if (val?.error) {
						error.value = val.error
						visible.value = true
					}
				}
			)

			return {
				BtErrorMask: defineComponent(() => {
					return () => (!visible.value ? <></> : <BtErrorMask options={error.value}></BtErrorMask>)
				}),
			}
		},
	}
}

/**
 * @description 表格按钮选择
 */
export const useRadioButton = (data: { options: Array<RadioOptionsProps>; value?: any; key: string; other?: AnyObject }) => {
	return {
		init: ({ ref, param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			const { options, value, key, other } = data
			param.value[key] = value || options[0]?.value || ''
			return {
				BtRadioButton: defineComponent(() => {
					return () => (
						<BtRadio
							type="button"
							v-model={param.value[key]}
							options={options}
							{...(other || {})}
							onChange={() => {
								if (config.pageKeys.page && param.value[config.pageKeys.page] !== 1) {
									// 如果分页键名存在，则将分页设置为1,触发分页watch刷新
									param.value[config.pageKeys.page] = 1
								} else {
									// 如果分页键名不存在，则直接刷新
									refresh()
								}
							}}
						/>
					)
				}),
			}
		},
	}
}

/**
 * @description 表格下拉选择
 */
export const useTableSelect = (data: { options: Array<SelectOptionProps>; value?: any; key: string; other?: AnyObject }) => {
	return {
		init: ({ ref, param, columns, config, refresh }: TableExtProps<TableConfigProps>) => {
			const { options, value, key, other } = data
			// param.value[key] = value || options[0]?.value || '';
			param.value[key] = isUndefined(value) ? (options.length ? options[0].value : '') : value
			return {
				BtTableSelect: defineComponent(() => {
					return () => (
						<BtSelect
							v-model={param.value[key]}
							options={options}
							{...(other || {})}
							onChange={() => {
								if (config.pageKeys.page && param.value[config.pageKeys.page] !== 1) {
									// 如果分页键名存在，则将分页设置为1,触发分页watch刷新
									param.value[config.pageKeys.page] = 1
								} else {
									// 如果分页键名不存在，则直接刷新
									refresh()
								}
							}}
						/>
					)
				}),
			}
		},
	}
}

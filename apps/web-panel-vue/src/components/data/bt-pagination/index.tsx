import { ElPagination, type PaginationProps } from 'element-plus'
import 'element-plus/theme-chalk/src/pagination.scss'
import { useRoute } from 'vue-router'

interface Props {
	row: number // 分页显示数量
	page: number // 当前页
	total: number // 总数
	type?: 'default' | 'unknown' // type为 unknown 时, row 为当前页数量, total 为每页最多显示数量,当row < total时, 就是最后一页
	layout?: string
	rowList?: Array<number>
}

export default defineComponent<Props>({
	name: 'BtPagination',
	props: {
		type: { type: String as PropType<'default' | 'unknown'>, default: 'default', required: false }, // 分页类型
		row: { type: Number, default: 10 }, // 分页显示数量
		page: { type: Number, default: 1 }, // 当前页
		total: { type: Number, default: 0 }, // 总数
		layout: { type: String, default: 'prev, pager, next, sizes, total, jumper', required: false },
		pageSizes: { type: Array as PropType<Array<number>>, default: () => [10, 20, 50, 100], required: false },
	},
	emits: ['change', 'update:page', 'update:row'],
	setup(props, { emit, attrs }) {
		const { row, page, total } = toRefs(props)

		const usePageStorage = ref(true)
		// const pageSize = ref<number>(row.value || props.pageSizes[0])
		const route = useRoute()
		const pageName = `${route?.fullPath.replace(/\//g, '_')}` // 用于存储分页名称
		const pageSize = useSessionStorage<number>(pageName, row.value || props.pageSizes[0]) // 用于存储分页显示条数
		const limit = computed(() => {
			return usePageStorage.value ? pageSize.value : row.value
		})

		watch(
			() => row.value,
			value => {
				emit('update:row', value)
				emit('change')
			}
		)
		watch(
			() => page.value,
			value => {
				emit('update:page', value)
				emit('change')
			}
		)

		/**
		 * @description 分页数量改变
		 * @param {number} value 分页数量
		 */
		const sizeChangeEvent = (value: number) => {
			pageSize.value = value
			row.value = value
			if (value !== row.value) emit('update:row', value)
			emit('update:page', 1)
			emit('change')
		}

		/**
		 * @description 当前页改变
		 * @param {number} value 当前页
		 */
		const currentChangeEvent = (value: number) => {
			emit('update:page', value)
			emit('change')
		}

		return () => (
			<>
				{props.type === 'default' ? (
					<ElPagination background={true} v-model:pageSize={limit.value} v-model:currentPage={page.value} pageSizes={props.pageSizes} layout={props.layout} total={total.value} onSizeChange={sizeChangeEvent} onCurrentChange={currentChangeEvent} {...attrs} />
				) : (
					<div class="flex items-center h-[28px]">
						{page.value > 1 && (
							<>
								<span class="bt-link !border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center" onClick={() => currentChangeEvent(1)}>
									首页
								</span>
								<span class="bt-link !border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center" onClick={() => currentChangeEvent(page.value - 1)}>
									上一页
								</span>
							</>
						)}
						{total.value > row.value && (
							<span class="bt-link !border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center" onClick={() => currentChangeEvent(page.value + 1)}>
								下一页
							</span>
						)}
						<span class="!border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center">第 {page.value} 页</span>
					</div>
				)}
			</>
		)
	},
})

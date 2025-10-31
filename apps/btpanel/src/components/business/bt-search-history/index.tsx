import { clearSearchHistory, removeSearchHistory } from '@/api/global'
import BtIcon from '@/components/base/bt-icon'
import BtImage from '@/components/base/bt-image'
import { Message, useConfirm } from '@/hooks/tools'
import { ElButton } from 'element-plus'
import { HistoryProps, RecommendProps } from './types'
import './index.scss'

interface Props {
	name: string
	list: {
		historyList: HistoryProps[]
		recommendList: RecommendProps[]
	}
	showHistory?: boolean
	showRecommend?: boolean
}
export default defineComponent<Props>({
	name: 'BtSearchHistory',
	props: {
		name: {
			type: String,
			default: '',
		},
		keys: {
			type: String,
			default: '',
		},
		list: {
			type: Object as () => AnyObject,
			default: () => ({
				historyList: [],
				recommendList: [],
			}),
		},
		showHistory: {
			type: Boolean,
			default: true,
		},
		showRecommend: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['search', 'trigger', 'update'],
	setup(props, { emit }) {
		const { name, keys: key } = props

		/**
		 * @description 清空所有搜索历史事件
		 */
		const clearAllHistoryEvent = async () => {
			await useConfirm({
				icon: 'warning-filled',
				title: '清空搜索历史',
				content: '清空所有搜索历史记录，是否继续？',
			})
			const params: { name: string; key: string } = { name, key: key || name }
			const loading = Message.load('正在清空搜索历史记录，请稍后...')
			try {
				const data = await clearSearchHistory(params)
				Message.request(data)
				if (data?.status) {
					emit('update', [])
				}
				emit('trigger', true) // 显示搜索历史
			} catch (error) {
				console.error(error)
			} finally {
				loading.close()
			}
		}

		/**
		 * @description 删除指定搜索历史事件
		 * @param {string} val 搜索内容
		 * @param {number} index 索引
		 */
		const clearFindHistoryEvent = async (val: string, index: number) => {
			await useConfirm({
				icon: 'warning-filled',
				title: '删除搜索历史记录',
				content: `删除该条搜索历史【${val}】，是否继续？`,
			})

			const loading = Message.load('正在删除指定搜索历史记录，请稍后...')
			try {
				const data = await removeSearchHistory({ val, name, key: key || name })
				Message.request(data)
				if (data?.status) {
					let history = props.list.historyList
					history.splice(index, 1)
					history = [...history]
					emit('update', history)
				}
				emit('trigger', true) // 显示搜索历史
			} catch (error) {
				console.error(error)
			} finally {
				loading.close()
			}
		}

		/**
		 * @description 推荐功能点击事件
		 * @param {any} item 推荐内容
		 */
		const recommendEvent = (item: RecommendProps) => {
			if (item.callback) item.callback()
			emit('trigger', false) // 关闭当前历史记录
		}

		/**
		 * @description 输入历史记录事件
		 * @param {string} val 历史记录
		 */
		const inputHistoryEvent = (val: string) => {
			emit('search', val) // 触发搜索事件
			emit('trigger', false) // 关闭当前历史记录
		}

		return () => (
			<div class="box w-[400px]" onMouseDown={e => e.preventDefault()}>
				<div class={`${!props.showHistory ? 'hidden' : ''}`}>
					<span class="history-title">
						<span class="text-tertiary text-small"> 搜索历史</span>
						<ElButton
							size="small"
							onClick={e => {
								e.stopPropagation()
								clearAllHistoryEvent()
							}}>
							<span class="flex items-center">
								<i class="svgtofont-el-delete mr-[4px]"></i>
								<span>清空</span>
							</span>
						</ElButton>
					</span>
					<div class="list-box">
						<div class="list-box-body max-h-[24rem] !overflow-y-auto">
							{props.list.historyList?.map((item, index) => (
								<div
									key={index}
									class="body-item"
									onClick={e => {
										inputHistoryEvent(item.val)
										e.stopPropagation()
									}}>
									<span title={item.val} class="truncate max-w-[16rem]">
										{item.val}
									</span>
									<i
										class="svgtofont-el-close"
										onClick={e => {
											clearFindHistoryEvent(item.val, index)
											e.stopPropagation()
										}}
									/>
								</div>
							))}
						</div>
						{/* 当没有搜索历史时显示暂无数据 */}
						{!props.list.historyList.length && (
							<div class="w-full flex items-center justify-center h-[6rem]">
								<span>暂无搜索历史</span>
							</div>
						)}
					</div>
				</div>
				<div class={`${!props.showRecommend ? 'hidden' : ''}`}>
					<span class="history-title !justify-start">
						<span class="text-tertiary text-small">您可能感兴趣</span>
						<BtImage class="w-[1.4rem] h-[1.4rem] ml-[.5rem]" src="/soft_ico/hots.png" />
					</span>
					<div class="recommend-list">
						{props.list.recommendList.map((item, index) => (
							<div
								key={index}
								class="recommend-item"
								onClick={e => {
									e.stopPropagation()
									recommendEvent(item)
								}}>
								<span>{item.name}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	},
})

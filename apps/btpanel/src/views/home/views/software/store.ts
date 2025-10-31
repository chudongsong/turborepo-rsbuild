import { concat } from 'ramda'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import { setHomeSoftSort, getHomeInstallSoftList, addSoftToHome, removeSoftToHome, getHomeSoftList } from '@api/home'
import { getRecommendContent, getPluginInfo } from '@api/global'
import { isBoolean, isDev, isString } from '@utils/index'
import { productPaymentDialog, pluginInstallDialog, openPluginView } from '@/public/index'
import { Message, useConfirm, useDataHandle, useDataPage } from '@hooks/tools'
import { useGlobalStore } from '@/store/global'

const HOME_SOFTWARE_STORE = defineStore('SOFTWARE-STORE', () => {
	const router = useRouter()
	const { forceLtd, aliyunEcsLtd, payment } = useGlobalStore()
	const pluginKeyword = ref('') // 已安装插件搜索关键字
	const isFilter = ref(false) //当前是否再过滤
	const recommendList = ref<any[]>([]) // 推荐软件信息
	const containerRef = ref() // popover容器
	const softList = ref<any[]>([]) // 软件列表
	const softShowList = ref<any[]>([]) // 软件列表
	const isGetSoft = ref(false) // 软件加载状态
	const popShow = ref(false) // popover显示状态
	const total = ref(0) //总条目数
	const tableLoading = ref(false) //表格加载状态
	const pageSize = 12 //每页显示条目数

	// 获取所有已安装的插件
	let mySoftList = ref<any[]>([])
	let softListBackup: any[] = [] // 软件列表备份

	/**
	 * @description 渲染软件图片
	 * @return {string} 图片地址
	 */
	const renderSoftImages = (name: string) => {
		return `${isDev ? '/static/images/soft_ico' : '/static/img/soft_ico'}/ico-${name.replace(/-+[{0-9},\.,]+$/, '')}.png`
	}

	// 状态
	const softStatus = (item: { status: boolean; name: string }) => {
		return item.status || item.name === 'phpmyadmin' ? 'start' : 'stop'
	}

	/**
	 * @description 状态颜色
	 * @param item
	 */
	const softStatusColor = (item: { status: boolean; name: string }) => {
		return item.status || item.name === 'phpmyadmin' ? 'var(--el-color-primary)' : '#FF4949'
	}

	const changeStyle = (status: string, className: string) => {
		let dom: any = document.querySelectorAll(className)
		dom[0].style.display = status
	}

	// 显示popover
	const showPopoverHandle = async (query: string = '') => {
		if (tableLoading.value) return
		if (isString(query) && query !== '') {
			tableLoading.value = true
			// 在softList每个对象中的name,ps,title查找包含query的内容
			const filteredSoftList = computed(() => {
				if (!query) {
					return mySoftList.value
				}
				const queryLowerCase = query.toLowerCase()
				return softListBackup.filter(soft => {
					return soft.name.toLowerCase().includes(queryLowerCase) || soft.ps.toLowerCase().includes(queryLowerCase) || soft.title.toLowerCase().includes(queryLowerCase)
				})
			})
			mySoftList.value = filteredSoftList.value
			tableLoading.value = false
			return
		}
		getSoftList(query)
	}

	/**
	 * @description 获取软件列表
	 * @param {sting} query 搜索关键字
	 *
	 */
	const getSoftList = useThrottleFn(async (query: string) => {
		await useDataHandle({
			loading: tableLoading,
			request: getHomeInstallSoftList({
				p: 1,
				type: -1,
				tojs: 'soft.get_list',
				query: query,
				force: 0,
				row: 100,
			}),
			data: {
				'list.data': [Array, mySoftList],
				'list.page': useDataPage(total),
			},
			success: (res: any) => {
				mySoftList.value = res['list.data'].filter((item: any) => item.index_display).concat(res['list.data'].filter((item: any) => !item.index_display))
				softListBackup = mySoftList.value
			},
		})
	}, 5000)

	/**
	 * @description switch按钮切换显示的处理函数
	 * @param {any} plugin 软件信息
	 */
	const changeSwitchHandle = async (item: any, index: number) => {
		//判断是否超过12个软件
		const allLength = softListBackup.filter(item => item.index_display).length // 已经显示的软件
		const flag = softListBackup.length === mySoftList.value.length // 判断是否是全部软件
		if (allLength > 12 && item.index_display) {
			item.index_display = !item.index_display
			return Message.error('首页最多只能显示12个软件!')
		} else {
			try {
				const requestFun = item.index_display ? addSoftToHome : removeSoftToHome
				await useDataHandle({
					loading: '正在处理，请稍后...',
					request: requestFun(item.name),
					message: true,
					success: (res: any) => {
						if (res.status) {
							mySoftList.value = mySoftList.value.map(item => {
								if (item.name === item.name) item.index_display = item.index_display
								return item
							})
							softListBackup = softListBackup.map(item => {
								if (item.name === item.name) item.index_display = item.index_display
								return item
							})
							softList.value = softListBackup.filter(item => item.index_display)
						}
						createSoftList()
					},
				})
			} catch (error) {
				item.index_display = !item.index_display
				console.log(error)
			}
		}
	}

	/**
	 * @description 跳转软件商店
	 */
	const goSoft = () => {
		router.push({ path: '/soft' })
	}

	/**
	 * @description 搜索关键字进行提示
	 * @param {string} query 搜索关键字
	 * @param {Function} cb 回调函数
	 */
	const querySearch = (query: string, cb: AnyFunction) => {
		cb(createFilter(query))
	}

	/**
	 * @description 创建过滤器
	 * @param {string} query 搜索关键字
	 * @return {Array} 过滤后的数据
	 */
	const createFilter = (query: string) => {
		const results = query
			? softListBackup.filter((item: any) => {
					if (item.title.toLowerCase().includes(query.trim().toLowerCase())) {
						return { value: item.title }
					}
			  })
			: softListBackup
		let res: { value: any }[] = []
		results.forEach((value, index, array) => {
			res.push({ value: value.title })
		})
		return res
	}

	/**
	 * @description 鼠标移出事件
	 * @param {any} e 事件对象
	 */
	const leave = (e: any) => {
		const x = e.offsetX // 以当前事件的目标对象左上角为原点，定位x轴坐标
		const y = e.offsetY // 以当前事件的目标对象左上角为原点，定位y轴坐标
		const w = containerRef.value.offsetWidth // 绑定了鼠标移出事件的容器宽度包括了 padding 和 border
		const h = containerRef.value.offsetHeight // 绑定了鼠标移出事件的容器高度包括了 padding 和 border
		if (x < 0 || y < 0 || x >= w || y >= h) {
			// 判断光标是否移出容器
			const popover = document.querySelector('.soft-search-popover') as HTMLElement
			if (popover && popover?.style.display != 'none') {
				popShow.value = true
			} else {
				popShow.value = false
				pluginKeyword.value = ''
			}
		}
	}

	//搜索关键字的处理函数
	const searchPluginHandle = (type: string = '') => {
		if (type == 'select') {
			// changeStyle('none', '.soft-search-popover')
		}
		if (pluginKeyword.value == '') {
			isFilter.value = false
			showPopoverHandle()
		} else {
			isFilter.value = true
			showPopoverHandle(pluginKeyword.value)
		}
	}

	/**
	 * @description 获取软件商店已安装的软件列表
	 */
	const getHomeInstallSoftData = async () => {
		await useDataHandle({
			loading: isGetSoft,
			request: getHomeSoftList(),
			success: (res: any) => {
				const filterData = res.data.filter((item: any) => item.setup)
				softShowList.value = filterData
				softList.value = filterData
				createSoftList()
				rowDrop()
			},
		})
	}

	/**
	 *@description 创建软件列表
	 */
	const createSoftList = () => {
		// 当软件列表展示的数量小于12个，将推荐软件列表添加到软件列表中
		if (softList.value.length <= 12) {
			if (recommendList.value.length > 0 && !(aliyunEcsLtd.value || payment.value.authType === 'ltd')) {
				softShowList.value = [...softList.value, ...recommendList.value].slice(0, 12)
			} else {
				softShowList.value = [...softList.value].slice(0, 12)
			}
		}
		// 当软件列表展示的数量小于12个，补齐空白的软件列表到12个
		if (softShowList.value.length < 12) {
			while (softShowList.value.length < 12) {
				softShowList.value.push({})
			}
		}
	}

	/**
	 * @description: 加载更多
	 */
	const load = async () => {
		let page = Math.ceil(total.value / pageSize)
		let currentPage = Math.ceil(mySoftList.value.length / pageSize)
		if (currentPage >= page) return
		const { data } = await getHomeInstallSoftList({
			p: currentPage + 1,
			type: -1,
			tojs: 'soft.get_list',
			force: 0,
			row: 12,
		})
		mySoftList.value = mySoftList.value.concat(data.list.data)
	}

	/**
	 * @description 打开产品购买视图
	 */
	const openLtdPayView = (item: any) => {
		let sourceIdArr: any = {
			total: 41,
			monitor: 175,
			btwaf: 40,
			tamper_core: 42,
			bt_security: 43,
			oneav: 44,
			security_notice: 56,
		}
		productPaymentDialog({
			disablePro: !(item.type === 8),
			sourceId: sourceIdArr[item.name] || 0,
		})
	}

	/**
	 * @description: 行拖拽
	 * @return {void}
	 */
	const rowDrop = () => {
		const tbody = document.querySelector('.soft-wrapper')
		Sortable.create(tbody as HTMLElement, {
			animation: 500,
			handle: '.soft-move',
			chosenClass: 'ghost',
			onEnd: async (e: any) => {
				// 拖拽结束, 重新排序
				const currentRow = softShowList.value.splice(e.oldIndex, 1)[0]
				softShowList.value.splice(e.newIndex, 0, currentRow)
				dragSortEvent()
			},
		})
	}
	/**
	 * @description: 组件移动后排序
	 */
	const dragSortEvent = () => {
		let sortStr = softShowList.value
			.filter((item: any) => {
				if (typeof item.id != 'undefined') {
					return item.name
				} else {
					return false
				}
			})
			.map((item: any) => item.name)
			.join('|')
		useDataHandle({
			request: setHomeSoftSort({ ssort: sortStr }),
		})
	}

	/**
	 * @description 打开软件视图
	 * @param item 软件信息
	 */
	const openSoftView = async (item: any) => {
		if (item.endtime >= 0 || item.price === 0) {
			openPluginView({ name: item.name, pluginInfo: item })
		} else {
			await useConfirm({
				title: '购买插件',
				content: `插件已过期，是否前往购买？`,
			})
			openLtdPayView(item)
		}
		return false
	}
	/**
	 * @description 打开推荐软件视图
	 * @param item 软件信息
	 */
	const openRecommendSoftView = (item: any) => {
		if (item.name && !item.install && !isBoolean(item.isBuy)) {
			openPluginView({ name: item.name, pluginInfo: item })
			return false
		}
	}

	/**
	 * @description 打开插件安装界面
	 * @param {any} item 插件信息
	 */
	const openInstall = async (item: any) => {
		const { data } = await getPluginInfo({ sName: item.name })
		if (data.task === '-1') return Message.error('当前插件正在安装，不可重复安装')
		pluginInstallDialog({
			name: data.name,
			type: 'i',
			pluginInfo: data,
		})
	}

	/**
	 * @description: 获取推荐内容信息
	 * @returns {Promise<void>}
	 */
	const getRecommendInfo = async () => {
		await useDataHandle({
			request: getRecommendContent(),
			success: (res: any) => {
				if (Array.isArray(res.data) && res.data.length > 0) {
					recommendList.value = res.data[1]?.list || []
				}
			},
		})
	}

	/**
	 * @description 点击跳转插件预览地址
	 * @param {any} item 插件信息
	 */
	const openSoftPreLink = (item: any) => {
		window.open(item.preview, '_blank', 'noopener,noreferrer')
	}
	return {
		popShow,
		isGetSoft,
		pluginKeyword,
		recommendList,
		containerRef,
		mySoftList,
		tableLoading,
		softShowList,
		load,
		createSoftList,
		getHomeInstallSoftData,
		getRecommendInfo,
		goSoft,
		showPopoverHandle,
		leave,
		querySearch,
		searchPluginHandle,
		renderSoftImages,
		changeSwitchHandle,
		openSoftView,
		softStatusColor,
		softStatus,
		openRecommendSoftView,
		openSoftPreLink,
		openLtdPayView,
		openInstall,
	}
})

export default HOME_SOFTWARE_STORE

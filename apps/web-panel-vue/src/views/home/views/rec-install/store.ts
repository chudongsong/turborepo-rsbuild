import { defineStore, storeToRefs } from 'pinia'
import HOME_STORE from '@home/store'
import { useGlobalStore } from '@/store/global'
import { Message } from '@hooks/tools/message'
import { getSoftList, installRecommendedSoft, installJDK, createDir, dokcerInstall, getMenuList, setHideMenuList } from '@api/global'
// import { menuRoute } from '@router/hooks/router-menu'
import { msgBoxDialog } from '@/public/index'
import { useConfirm, useDataHandle } from '@hooks/tools'
import { updateMenuItems as refreshRoute } from '@layout/views/sidebar/menu-settings/controller'

const HOME_REC_INSTALL_STORE = defineStore('REC-INSTALL-STORE', () => {
	const homeStore = HOME_STORE()
	const { memory, panelInfo } = storeToRefs(homeStore)
	const { isRefreshMenu, getGlobalInfo } = useGlobalStore()

	const emits = ref() // 实例

	// 推荐列表配置
	const recommend = reactive<any>({
		lnmp: {
			type: 'lnmp',
			title: `LNMP（推荐）`,
			install: 1,
			soft: {
				Nginx: { icon: 'nginx', value: '', selected: true, options: [] },
				MySQL: { icon: 'mysql', value: '', selected: true, options: [] },
				'Pure-Ftpd': { icon: 'pureftpd', value: '', selected: false, options: [] },
				PHP: { icon: 'php', value: '', selected: true, options: [] },
				phpMyAdmin: { icon: 'phpmyadmin', value: '', selected: true, options: [] },
			},
		},
		lamp: {
			type: 'lamp',
			title: 'LAMP',
			install: 1,
			soft: {
				Apache: { icon: 'apache', value: '', selected: true, options: [] },
				MySQL: { icon: 'mysql', value: '', selected: true, options: [] },
				'Pure-Ftpd': { icon: 'pureftpd', value: '', selected: false, options: [] },
				PHP: { icon: 'php', value: '', selected: true, options: [] },
				phpMyAdmin: { icon: 'phpmyadmin', value: '', selected: true, options: [] },
			},
		},
		java: {
			type: 'java',
			title: 'JAVA',
			install: 1,
			soft: {
				Nginx: { icon: 'nginx', value: '', selected: true, options: [] },
				MySQL: { icon: 'mysql', value: '', selected: true, options: [] },
				'Pure-Ftpd': { icon: 'pureftpd', value: '', selected: false, options: [] },
				jdk: { icon: 'java', value: '', selected: true, options: [] },
				phpMyAdmin: { icon: 'phpmyadmin', value: '', selected: true, options: [] },
			},
		},
		docker: {
			type: 'docker',
			title: 'Docker',
			install: 1,
			soft: {
				Nginx: { icon: 'nginx', value: '', selected: true, options: [] },
				Docker: {
					icon: 'docker',
					value: '',
					selected: true,
					disabled: true,
					options: [{ label: 'Dokcer服务', value: '' }],
				},
			},
		},
	})
	const load = ref(false) // 加载状态
	const menuList = ref([]) // 菜单栏目
	const moreMenuList = ref([]) // 更多菜单栏目
	const filterList = ['home', 'soft', 'exit', 'config']
	const getList = (list: any) => {
		return list.filter((item: any) => !filterList.includes(item.name))
	}

	// php列表
	const phpList = ref<any>([])

	// phpmyadmin列表
	const phpmyadminList = ref<any>([])

	// mysql内存限制对照表
	const mysqlMemRequire: any = {
		'5.1': { max: 256, rec: 512 },
		'5.5': { max: 600, rec: 1024 },
		'5.6': { max: 800, rec: 1024 },
		'5.7': { max: 1500, rec: 2048 },
		'8.0': { max: 5000, rec: 10240 },
		'8.4': { max: 8000, rec: 10240 },
		// AliSQL: { max: 800, rec: 1024 },
		// 'mariadb_10.0': { max: 800, rec: 1024 },
		// 'mariadb_10.1': { max: 1500, rec: 2048 },
		'mariadb_10.4': { max: 256, rec: 2048 },
		'mariadb_10.5': { max: 256, rec: 2048 },
	}

	// phpmyadmin,php版本对照表
	const phpmyadminRequire: any = {
		'4.0': ['5.2', '5.3', '5.4', '5.5', '5.6', '7.0', '7.1', '7.2', '7.3', '7.4'],
		'4.4': ['5.4', '5.4', '5.5', '5.6', '7.0', '7.1', '7.2', '7.3'],
		'4.9': ['5.6', '7.0', '7.1', '7.2', '7.3', '7.4', '8.0'],
		'5.0': ['7.2', '7.3', '7.4', '8.0'],
		'5.1': ['7.2', '7.3', '7.4', '8.0'],
		'5.2': ['7.2', '7.3', '7.4', '8.0', '8.1', '8.2'],
	}

	// phpmyadmin 不启用版本
	const phpmyadminDeprecatedVersion: any = ['4.0']

	// mysql不启用版本
	const mysqlDeprecatedVersion: any = ['5.1']

	// php不启用版本
	const phpDeprecatedVersion: any = ['5.2', '5.3', '5.5', '7.0']

	// apache版本对照表
	const apacheRequire: any = {
		'2.2': {
			php: { min: '5.2', max: '5.4' },
			model: 'php5_module',
		},
		'2.4': {
			php: { min: '5.3', max: '8.1' },
			model: 'php-fpm',
		},
	}

	/**
	 * @description 渲染phpMyAdmin列表
	 */
	const renderPhpMyAdminList = (type: string): any => {
		const soft: any = recommend[type]
		const phpVersion: string = soft.soft.PHP.value
		recommend[type].soft.phpMyAdmin.options = []
		Object.keys(phpmyadminRequire).forEach((key: string) => {
			const item = phpmyadminRequire[key]
			if (!item) return
			if (item.indexOf(phpVersion) > -1) {
				recommend[type].soft.phpMyAdmin.options.push({
					label: `phpMyAdmin ${key}`,
					value: key,
				})
				recommend[type].soft.phpMyAdmin.value = key
			}
		})
	}

	/**
	 * @description 跳转软件商店
	 */
	const goSoft = () => {
		window.location.href = '/soft'
	}
	/**
	 * @description 跳转软件商店
	 */
	const goSetting = () => {
		window.location.href = '/config'
	}
	/**
	 * @description 选择软件版本，和提示兼容问题
	 * @param {any} item 选中的相关软件信息
	 * @param {any} reItem 选中的推荐列表信息
	 * @returns {void}
	 */
	const changeSoftwareVersion = (item: any, type: any) => {
		const { icon: name, value: version } = item
		const mem: any = mysqlMemRequire[version]
		switch (name) {
			case 'apache':
				Message.warn(`当前PHP将会以${apacheRequire[version].model}模式运行!`)
				break
			case 'mysql':
				if (memory.value.memTotal < mem.max) {
					Message.warn(`您的内存小于${mem.rec / 1024}GB，不建议安装MySQL-${version}`)
				}
				break
			case 'php':
				renderPhpMyAdminList(type)
				break
			case 'phpmyadmin':
				break
		}
	}

	/**
	 * @description 安装软件
	 */
	const installSoft = async (type: string) => {
		let id = 0
		const loading = Message.load('正在添加软件至消息盒子，请稍后...')
		const installType = recommend[type].install
		for (const key in recommend[type].soft) {
			const item = recommend[type].soft[key]
			if (item.selected) {
				let sName = key.toLowerCase()
				if (sName === 'php') {
					sName = 'php-' + item.value
				} else if (sName === 'pure-ftpd') {
					sName = 'pureftpd'
				} else if (sName === 'jdk') {
					try {
						installJDK({
							name: sName,
							version: item.icon === 'java' ? 'jdk' + item.value : item.value,
							type: 1,
						})
					} catch (error) {
						console.log(error)
					}
					continue
				} else if (sName === 'docker') {
					// 安装docker
					await dokcerInstall({ type: installType ? 0 : 1 })
					continue
				}
				// 判断是否选中
				try {
					let min_version = ''
					// 分割版本号,获取最小版本号,若其中有两个.，则取最后一个.之后的版本号，如1.8.8取8
					// 若只有一个小数点，则为0
					min_version = item.value.split('.').length === 3 ? item.value.split('.')[2] : '0'
					await installRecommendedSoft({
						sName: sName,
						version: item.icon === 'java' ? 'jdk' + item.value : item.value,
						min_version: min_version,
						type: installType,
						id: id++,
					})
				} catch (error) {
					console.log(error)
				}
			}
		}
		loading.close()
		await msgBoxDialog()
		getGlobalInfo()
		panelInfo.value.isSetup = true
		Message.success('已将下载任务添加到队列!')
		emits.value('close')
	}

	/**
	 * @description 取消显示推荐安装
	 */
	const cancelShowRec = async () => {
		await useConfirm({
			icon: 'warning-filled',
			title: '取消显示推荐安装',
			content: '不再显示推荐安装信息，继续操作？',
		})
		// 请求创建一个目录，忽略当前推荐安装
		await useDataHandle({
			loading: '正在取消显示推荐安装，请稍后...',
			request: createDir({ path: '/www/server/nginx' }),
			success: (res: any) => {
				if (res.status) {
					Message.success('设置成功')
				} else {
					Message.error('设置失败')
				}
				// 判断状态，关闭推荐安装套件
				emits.value('close')
			},
		})
	}

	/**
	 * @description 初始化推荐安装列表
	 * @returns Promise
	 */
	const initSoft = async () => {
		const res = await getSoftList()
		const { data } = res
		data.forEach((item: any) => {
			const { name } = item
			// 过滤掉Tomcat,目前已取消推荐
			if (name === 'Tomcat') return
			const list: Array<{ label: string; value: string; ps?: string; disabled?: boolean }> = []
			let val = ''
			item.versions.forEach(({ version }: any) => {
				const recMysqlVersion = memory.value.memTotal >= 10240 ? '8.0' : '5.7' // 推荐MySQL版本判断
				const recPhpVersion = '8.2'
				const recPhp = name === 'PHP' && version === recPhpVersion // 推荐PHP版本
				const recMysql = name === 'MySQL' && version === recMysqlVersion // 推荐MySQL版本
				const recPhpAdmin = name === 'phpMyAdmin' && version === '5.2' // 推荐phpMyAdmin版本
				const recJDK = name === 'jdk' && version.includes('1.8') // 推荐JDK版本
				const mem = mysqlMemRequire[version]
				let ps = ''
				const disabled = false

				switch (name.toLowerCase()) {
					case 'nginx':
						const supportArr = ['1.25', '1.26', '1.28']
						ps = supportArr.includes(version) ? '[支持http3]' : ''
						break
					// 内存检测,判断当前版本mysql内存推荐情况
					case 'mysql':
						if (memory.value.memTotal < mem.max) ps = `[推荐${mem.rec / 1024}G内存机器安装]`
						if (mysqlDeprecatedVersion.includes(version)) return
						break
					// 过滤掉不需要展示的PHP版本
					case 'php':
						if (phpDeprecatedVersion.includes(version)) return
						break
					// 当前apache的PHP运行模式
					case 'apache':
						ps = `[PHP运行模式：${apacheRequire[version].model}]`
						break
					// 获取phpmyadmin当前的兼容PHP版本
					case 'phpmyadmin':
						if (!phpmyadminRequire[version]) return
						if (phpmyadminDeprecatedVersion.includes(version)) return
						if (phpmyadminRequire[version].indexOf(recPhpVersion) !== -1) return // 当前phpmyadmin版本是否兼容推荐的PHP版本
						break
					case 'jdk':
						version = version.replace('jdk', '')
						break
				}
				// 判断是否存在PHP默认版本，存在就使用推荐的版本
				if ((!val && recPhp) || recMysql || recPhpAdmin || recJDK) val = version
				list.push({ label: `${name} ${version}`, value: version, ps, disabled })
			})
			// 单独的存储php,phpmyadmin，用于部分兼容和筛选
			switch (name.toLowerCase()) {
				case 'php':
					phpList.value.push(...list)
					break
				case 'phpmyadmin':
					phpmyadminList.value.push(...list)
					break
			}
			// 如果没有推荐和指定版本，则默认选中第一个
			if (!val && list.length > 0) {
				val = list[0].value
			}

			// 遍历当前软件推荐列表，将数据添加到每一项的下拉框中
			Object.keys(recommend).forEach((key: string) => {
				const data = recommend[key].soft[name]
				if (!data) return
				data.value = val
				data.options = list
				if (name === 'phpMyAdmin' && key !== 'java') {
					changeSoftwareVersion(recommend[key].soft.PHP, key)
				}
			})
		})
	}

	/**
	 * @description: 切换菜单项的可见性并更新隐藏菜单项列表。
	 * @param {Object} row - 要切换的菜单项对象。
	 * @returns {Promise<void>}
	 */
	const handleMenuChange = async (row: any) => {
		try {
			// 切换菜单项的可见性
			// eslint-disable-next-line @typescript-eslint/naming-convention
			let param: any = { hide_list: JSON.stringify([row.id]) }
			if (row.parentId) {
				param['site_menu'] = 1
			}
			const rdata = await setHideMenuList(param)
			if (rdata.status) {
				Message.success('设置成功，后期可以在左侧菜单栏中修改。')
			} else {
				Message.request(rdata)
			}
			// 更新菜单项显示隐藏列表
			await updateMenuItems()
			refreshRoute()
		} catch (error) {
			console.log(error)
		}
	}
	/**
	 * @description: 获取、更新菜单栏目显示隐藏列表
	 */
	const updateMenuItems = async () => {
		try {
			load.value = true
			const rdata = await getMenuList() // 获取菜单栏目
			const moreList = ['ftp', 'wp', 'ssl', 'mail']
			// 设置菜单栏目显示状态，兼容不规则的名称
			const list = rdata.data.map(({ id, show, title, children }: any) => {
				let name: string = (id.replace(/memu([A|_]?)/, '') || 'home').toLowerCase()
				if (name === 'dologin') name = 'exit'
				if (name === 'btwaf') name = 'waf'
				if (children) {
					children = children.map((item: any) => {
						let cname: string = item.id
						if (cname === 'proxy') cname = 'nginx'
						return { ...item, parentId: id, name: cname }
					})
				} else {
					children = false
				}
				return { name, show, title, id, children }
			})
			menuList.value = list.filter((item: any) => {
				return !moreList.includes(item.name)
			})

			// 过滤指定菜单栏目
			moreMenuList.value = list.filter((item: any) => {
				return moreList.includes(item.name)
			})

			isRefreshMenu.value = true // 刷新路由菜单
			// sessionStorage.setItem('MENU-LIST', JSON.stringify(menuList.value)) // 缓存菜单栏目显示状态
		} catch (error) {
			console.log(error)
		} finally {
			load.value = false
		}
	}
	return {
		recommend,
		initSoft,
		installSoft,
		changeSoftwareVersion,
		cancelShowRec,
		goSoft,
		goSetting,
		handleMenuChange,
		updateMenuItems,
		load,
		menuList,
		moreMenuList,
		getList,
		filterList,
		emits,
	}
})

export default HOME_REC_INSTALL_STORE

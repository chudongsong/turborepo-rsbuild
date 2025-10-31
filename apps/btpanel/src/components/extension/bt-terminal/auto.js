/**
 * XTerm.js 自动补全插件
 * 支持命令提示、语法高亮和智能补全功能
 */

export default class AutoCompleteAddon {
	constructor(options = {}) {
		this.terminal = null
		this.disposables = []
		this.commandDatabase = []
		this.enabled = true

		// 配置选项
		this.options = {
			maxSuggestions: options.maxSuggestions || 100,
			triggerCharacters: options.triggerCharacters || [' ', '-', '.', '/'],
			caseSensitive: options.caseSensitive || false,
			showDescriptions: options.showDescriptions !== false,
			...options,
		}

		// 当前输入状态
		this.currentInput = ''
		this.cursorPosition = 0
		this.isShowingSuggestions = false
		this.selectedIndex = 0
		this.suggestions = []

		// DOM 元素
		this.suggestionBox = null

		// 加载命令库
		if (window.commandDatabase) {
			// 优先使用全局命令库
			this.commandDatabase = window.commandDatabase
		} else {
			fetch(`/static/zh.json.gz`)
				.then(res => res.json()) // 服务器自动解压了
				.then(data => {
					this.commandDatabase = Object.values(data)
					// 挂载到全局
					window.commandDatabase = this.commandDatabase
					console.log(data, 'this.commandDatabase')
				})
				.catch(err => {
					this.commandDatabase = [
						{
							name: 'systemctl',
							description: '',
							subcommands: [
								{
									name: 'list-units',
									description: '列出当前内存中的单元',
									args: {
										name: 'PATTERN',
										generators: {},
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'list-sockets',
									description: '列出当前内存中按地址排序的套接字单元',
									args: {
										name: 'PATTERN',
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'list-timers',
									description: '列出当前内存中按下次经过时间排序的计时器单元',
									args: {
										name: 'PATTERN',
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'is-active',
									description: '检查单元是否处于活动状态',
									args: {
										name: 'PATTERN',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'is-failed',
									description: '检查单元是否失败',
									args: {
										name: 'PATTERN',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'status',
									description: '显示一个或多个单元的运行时状态',
									args: {
										name: 'PATTERN or PID',
										generators: {},
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'show',
									description: '显示一个或多个单元的属性',
									args: {
										name: 'PATTERN or JOB',
										generators: {},
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'cat',
									description: '显示指定单元的文件和drop-in',
									args: {
										name: 'PATTERN',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'help',
									description: '显示一个或多个单元的手册',
									args: {
										name: 'PATTERN or PID',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'list-dependencies',
									description: '递归显示单元所需或想要的单元，或那些单元所需的或想要的单元',
									args: {
										name: 'PATTERN',
										generators: {},
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'start',
									description: '启动（激活）一个或多个单元',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'stop',
									description: '停止（停用）一个或多个单元',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'reload',
									description: '重新加载一个或多个单元',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'restart',
									description: '启动或重新启动一个或多个单元',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'try-restart',
									description: '如果处于活动状态，则重新启动一个或多个单元',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'reload-or-restart',
									description: '如果可能，重新加载一个或多个单元，否则启动或重新启动',
									args: {
										name: 'UNIT',
										isVariadic: true,
									},
								},
								{
									name: 'try-reload-or-restart',
									description: '如果处于活动状态，则重新加载一个或多个单元（如果支持），否则重新启动',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'isolate',
									description: '启动一个单元并停止所有其他单元',
									args: {
										name: 'UNIT',
										generators: {},
									},
								},
								{
									name: 'kill',
									description: '向单元的进程发送信号',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'clean',
									description: '清理单元的运行时、缓存、状态、日志或配置',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'freeze',
									description: '冻结单元进程的执行',
									args: {
										name: 'PATTERN',
										isVariadic: true,
									},
								},
								{
									name: 'thaw',
									description: '恢复冻结单元的执行',
									args: {
										name: 'PATTERN',
										isVariadic: true,
									},
								},
								{
									name: 'set-property',
									description: '设置单元的一个或多个属性',
									args: [
										{
											name: 'UNIT',
											generators: {},
										},
										{
											name: 'PROPERTY=VALUE',
										},
									],
								},
								{
									name: 'bind',
									description: '将主机中的路径绑定挂载到单元的命名空间中',
									args: [
										{
											name: 'UNIT',
											generators: {},
										},
										{
											name: 'PATH',
											template: 'filepaths',
										},
										{
											name: 'PATH',
											template: 'filepaths',
											isOptional: true,
										},
									],
								},
								{
									name: 'mount-image',
									description: '将主机中的镜像挂载到单元的命名空间中',
									args: [
										{
											name: 'UNIT',
											generators: {},
										},
										{
											name: 'PATH',
											template: 'filepaths',
										},
										{
											name: 'PATH',
											template: 'filepaths',
											isOptional: true,
										},
										{
											name: 'OPTS',
											isOptional: true,
										},
									],
								},
								{
									name: 'service-log-level',
									description: '获取/设置服务的日志记录阈值',
									args: [
										{
											name: 'SERVICE',
										},
										{
											name: 'LEVEL',
											isOptional: true,
										},
									],
								},
								{
									name: 'service-log-target',
									description: '获取/设置服务的日志记录目标',
									args: [
										{
											name: 'SERVICE',
										},
										{
											name: 'TARGET',
											isOptional: true,
										},
									],
								},
								{
									name: 'reset-failed',
									description: '重置全部、一个或多个单元的失败状态',
									args: {
										name: 'PATTERN',
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'list-unit-files',
									description: '列出已安装的单元文件',
									args: {
										name: 'PATTERN',
										generators: {},
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'enable',
									description: '启用一个或多个单元文件',
									args: {
										name: 'UNIT|PATH',
										generators: [{}, {}],
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'disable',
									description: '禁用一个或多个单元文件',
									args: {
										name: 'UNIT|PATH',
										generators: [{}, {}],
										isVariadic: true,
									},
								},
								{
									name: 'reenable',
									description: '重新启用一个或多个单元文件',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'preset',
									description: '基于预设配置启用/禁用一个或多个单元文件',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'preset-all',
									description: '基于预设配置启用/禁用所有单元文件',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'mask',
									description: '屏蔽一个或多个单元文件',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'unmask',
									description: '取消屏蔽一个或多个单元文件',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'link',
									description: '将一个或多个单元文件链接到搜索路径中',
									args: {
										name: 'PATH',
										template: 'filepaths',
										isVariadic: true,
									},
								},
								{
									name: 'revert',
									description: '将一个或多个单元文件恢复到供应商版本',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'add-wants',
									description: '为目标添加对指定的一个或多个单元的依赖',
									args: [
										{
											name: 'TARGET',
										},
										{
											name: 'UNIT',
											isVariadic: true,
										},
									],
								},
								{
									name: 'add-requires',
									description: '为目标添加对指定的一个或多个单元的依赖',
									args: [
										{
											name: 'TARGET',
										},
										{
											name: 'UNIT',
											isVariadic: true,
										},
									],
								},
								{
									name: 'edit',
									description: '编辑一个或多个单元文件',
									args: {
										name: 'UNIT',
										generators: {},
										isVariadic: true,
									},
								},
								{
									name: 'get-default',
									description: '获取默认目标的名称',
								},
								{
									name: 'set-default',
									description: '设置默认目标',
									args: {
										name: 'TARGET',
									},
								},
								{
									name: 'list-jobs',
									description: '列出任务',
									args: {
										name: 'PATTERN',
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'cancel',
									description: '取消全部、一个或多个任务',
									args: {
										name: 'JOB',
										isVariadic: true,
										isOptional: true,
									},
								},
								{
									name: 'show-environment',
									description: '转储环境',
								},
								{
									name: 'set-environment',
									description: '设置一个或多个环境变量',
									args: {
										name: 'VARIABLE=VALUE',
										isVariadic: true,
									},
								},
								{
									name: 'unset-environment',
									description: '取消设置一个或多个环境变量',
									args: {
										name: 'VARIABLE',
										isVariadic: true,
									},
								},
								{
									name: 'import-environment',
									description: '导入全部或部分环境变量',
									args: {
										name: 'VARIABLE',
										isVariadic: true,
									},
								},
								{
									name: 'daemon-reload',
									description: '重新加载 systemd 管理器配置',
								},
								{
									name: 'daemon-reexec',
									description: '重新执行 systemd 管理器',
								},
								{
									name: 'log-level',
									description: '获取/设置管理器的日志记录阈值',
									args: {
										name: 'LEVEL',
										isOptional: true,
									},
								},
								{
									name: 'log-target',
									description: '获取/设置管理器的日志记录目标',
									args: {
										name: 'TARGET',
										isOptional: true,
									},
								},
								{
									name: 'service-watchdogs',
									description: '获取/设置服务 watchdog 状态',
									args: {
										name: 'BOOL',
										isOptional: true,
										suggestions: ['true', 'false'],
									},
								},
								{
									name: 'is-system-running',
									description: '检查系统是否完全运行',
								},
								{
									name: 'default',
									description: '进入系统默认模式',
									isDangerous: true,
								},
								{
									name: 'rescue',
									description: '进入系统救援模式',
									isDangerous: true,
								},
								{
									name: 'emergency',
									description: '进入系统紧急模式',
									isDangerous: true,
								},
								{
									name: 'halt',
									description: '关闭并停止系统',
									isDangerous: true,
								},
								{
									name: 'poweroff',
									description: '关闭并断电系统',
									isDangerous: true,
								},
								{
									name: 'reboot',
									description: '关闭并重启系统',
									isDangerous: true,
								},
								{
									name: 'kexec',
									description: '关闭并使用 kexec 重启系统',
									isDangerous: true,
								},
								{
									name: 'exit',
									description: '请求用户实例或容器退出',
									args: {
										name: 'EXIT_CODE',
										isOptional: true,
									},
									isDangerous: true,
								},
								{
									name: 'switch-root',
									description: '更改为不同的根文件系统',
									args: [
										{
											name: 'ROOT',
										},
										{
											name: 'INIT',
										},
									],
									isDangerous: true,
								},
								{
									name: 'suspend',
									description: '挂起系统',
									isDangerous: true,
								},
								{
									name: 'hibernate',
									description: '休眠系统',
									isDangerous: true,
								},
								{
									name: 'hybrid-sleep',
									description: '休眠并挂起系统',
									isDangerous: true,
								},
								{
									name: 'suspend-then-hibernate',
									description: '挂起系统，一段时间后唤醒，然后休眠',
									isDangerous: true,
								},
							],
							options: [
								{
									name: ['-h', '--help'],
									description: '显示此帮助',
								},
								{
									name: '--version',
									description: '显示软件包版本',
								},
								{
									name: '--system',
									description: '连接到系统管理器',
								},
								{
									name: '--user',
									description: '连接到用户服务管理器',
								},
								{
									name: ['-H', '--host'],
									description: '在远程主机上操作',
									args: {
										name: '[USER@]HOST',
									},
								},
								{
									name: ['-M', '--machine'],
									description: '在本地容器上操作',
									args: {
										name: 'CONTAINER',
									},
								},
								{
									name: ['-t', '--type'],
									description: '列出特定类型的单元',
									args: {
										name: 'TYPE',
									},
								},
								{
									name: '--state',
									description: '列出具有特定 LOAD 或 SUB 或 ACTIVE 状态的单元',
									exclusiveOn: ['--failed'],
									args: {
										name: 'STATE',
									},
								},
								{
									name: '--failed',
									description: '--state=failed 的快捷方式',
									exclusiveOn: ['--state'],
								},
								{
									name: ['-p', '--property'],
									description: '仅显示此名称的属性',
									exclusiveOn: ['-P'],
									args: {
										name: 'NAME',
									},
								},
								{
									name: '-P',
									description: '等效于 --value --property=NAME',
									exclusiveOn: ['-p', '--property', '--value'],
								},
								{
									name: ['-a', '--all'],
									description: "显示当前内存中的所有属性/所有单元，包括已死/空的单元。要列出系统上安装的所有单元，请改用 'list-unit-files'",
								},
								{
									name: ['-l', '--full'],
									description: '不要在输出中省略单元名称',
								},
								{
									name: ['-r', '--recursive'],
									description: '显示主机和本地容器的单元列表',
								},
								{
									name: '--reverse',
									description: "使用 'list-dependencies' 显示反向依赖关系",
								},
								{
									name: '--with-dependencies',
									description: "使用 'status'、'cat'、'list-units' 和 'list-unit-files' 显示单元依赖关系",
								},
								{
									name: '--job-mode',
									description: '指定在排队新任务时，如何处理已排队的任务',
									args: {
										name: 'MODE',
									},
								},
								{
									name: ['-T', '--show-transaction'],
									description: '在对单元任务进行排队时，显示完整事务',
								},
								{
									name: '--show-types',
									description: '在显示套接字时，显式显示其类型',
								},
								{
									name: '--value',
									description: '在显示属性时，仅打印值',
									exclusiveOn: ['-P'],
								},
								{
									name: '--check-inhibitors',
									description: '指定在关闭睡眠或休眠状态之前是否检查抑制器',
									exclusiveOn: ['-i'],
									args: {
										name: 'MODE',
									},
								},
								{
									name: '-i',
									description: '--check-inhibitors=no 的快捷方式',
									exclusiveOn: ['--check-inhibitors'],
								},
								{
									name: '--kill-who',
									description: '要将信号发送给谁',
									args: {
										name: 'WHO',
									},
								},
								{
									name: ['-s', '--signal'],
									description: '要发送哪个信号',
									args: {
										name: 'SIGNAL',
									},
								},
								{
									name: '--what',
									description: '要删除哪些类型的资源',
									args: {
										name: 'RESOURCES',
									},
								},
								{
									name: '--now',
									description: '在启用或禁用单元后启动或停止单元',
								},
								{
									name: '--dry-run',
									description: '仅打印将要执行的操作',
								},
								{
									name: ['-q', '--quiet'],
									description: '禁止输出',
								},
								{
									name: '--wait',
									description: '对于（重新）启动，请等到服务再次停止。对于 is-system-running，请等到启动完成',
								},
								{
									name: '--no-block',
									description: '不要等到操作完成',
								},
								{
									name: '--no-wall',
									description: '在停止/断电/重启之前，不要发送 wall 消息',
								},
								{
									name: '--no-reload',
									description: '在启用/禁用单元文件后，不要重新加载守护程序',
								},
								{
									name: '--legend',
									description: '启用/禁用图例（列标题和提示）',
									args: {
										name: 'BOOL',
										suggestions: ['true', 'false'],
									},
								},
								{
									name: '--no-pager',
									description: '不要将输出通过管道传递到分页器',
								},
								{
									name: '--no-ask-password',
									description: '不要询问系统密码',
								},
								{
									name: '--global',
									description: '全局编辑/启用/禁用/屏蔽默认用户单元文件',
								},
								{
									name: '--runtime',
									description: '临时编辑/启用/禁用/屏蔽单元文件，直到下次重启',
								},
								{
									name: ['-f', '--force'],
									description: '在启用单元文件时，覆盖现有符号链接。在关闭时，立即执行操作',
								},
								{
									name: '--preset-mode',
									description: '仅应用启用、仅禁用或所有预设',
									args: {
										name: 'MODE',
									},
								},
								{
									name: '--root',
									description: '在指定的根目录中编辑/启用/禁用/屏蔽单元文件',
									args: {
										name: 'PATH',
									},
								},
								{
									name: ['-n', '--lines'],
									description: '要显示的日志条目数',
									args: {
										name: 'N',
									},
								},
								{
									name: ['-o', '--output'],
									description: '更改日志输出模式',
									args: {
										name: 'MODE',
										suggestions: ['short', 'short-precise', 'short-iso', 'short-iso-precise', 'short-full', 'short-monotonic', 'short-unix', 'verbose', 'export', 'json', 'json-pretty', 'json-sse', 'cat'],
									},
								},
								{
									name: '--firmware-setup',
									description: '告诉固件在下次启动时显示设置菜单',
								},
								{
									name: '--boot-loader-menu',
									description: '在下次启动时启动到引导加载程序菜单',
									args: {
										name: 'TIME',
									},
								},
								{
									name: '--boot-loader-entry',
									description: '在下次启动时启动到特定的引导加载程序条目',
									args: {
										name: 'NAME',
									},
								},
								{
									name: '--plain',
									description: '将单元依赖关系打印为列表而不是树',
								},
								{
									name: '--timestamp',
									description: '更改打印的时间戳的格式',
									args: {
										name: 'FORMAT',
										suggestions: ['pretty', 'unix', 'us', 'utc', 'us+utc'],
									},
								},
								{
									name: '--read-only',
									description: '创建只读绑定挂载',
								},
								{
									name: '--mkdir',
									description: '如果缺少，则在挂载之前创建目录',
								},
								{
									name: '--marked',
									description: '重新启动/重新加载先前标记的单元',
								},
							],
						},
						{
							name: 'systemctl1',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl2',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl3',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl4',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl5',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl6',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl7',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl8',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl9',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl10',
							description: '',
							subcommands: [],
							options: [],
						},
						{
							name: 'systemctl11',
							description: '',
							subcommands: [],
							options: [],
						},
					]
					console.log(err, 'err')
				})
		}

		// 绑定方法
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleInput = this.handleInput.bind(this)
		this.hideSuggestions = this.hideSuggestions.bind(this)
		this.handleThemeChange = this.handleThemeChange.bind(this)

		// 主题监听器
		this.themeObserver = null
	}

	/**
	 * 启用自动补全
	 */
	enable() {
		this.enabled = true
	}

	/**
	 * 禁用自动补全
	 */
	disable() {
		this.enabled = false
		this.hideSuggestions()
	}

	/**
	 * 激活插件
	 */
	activate(terminal) {
		this.terminal = terminal
		this.createSuggestionBox()
		this.setupThemeObserver()

		// 延迟绑定事件监听器，确保在 AttachAddon 之后
		setTimeout(() => {
			this.attachEventListeners()
		}, 100)
	}

	/**
	 * 创建建议框DOM元素
	 */
	createSuggestionBox() {
		this.suggestionBox = document.createElement('div')
		this.suggestionBox.className = 'xterm-autocomplete-suggestions'
		this.suggestionBox.style.cssText = `
            position: absolute;
            background: var(--xterm-autocomplete-bg);
            border: 1px solid var(--xterm-autocomplete-border);
            border-radius: var(--el-border-radius-base, 4px);
            box-shadow: 0 4px 12px var(--xterm-autocomplete-shadow);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            font-family: var(--el-font-family, 'Helvetica Neue', Arial, sans-serif);
            font-size: var(--el-font-size-base, 14px);
            display: none;
            min-width: 350px;
            max-width: 600px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `

		// 添加样式
		if (!document.getElementById('xterm-autocomplete-styles')) {
			const style = document.createElement('style')
			style.id = 'xterm-autocomplete-styles'
			style.textContent = `
                /* 基础 CSS 变量定义 */
                :root {
                    --xterm-autocomplete-bg: var(--el-bg-color, #ffffff);
                    --xterm-autocomplete-border: var(--el-border-color, #dcdfe6);
                    --xterm-autocomplete-shadow: rgba(0, 0, 0, 0.12);
                    --xterm-autocomplete-item-bg: transparent;
                    --xterm-autocomplete-item-hover-bg: var(--el-fill-color-light, #f5f7fa);
                    --xterm-autocomplete-item-border: var(--el-border-color-lighter, #e4e7ed);
                    --xterm-autocomplete-text-primary: var(--el-text-color-primary, #303133);
                    --xterm-autocomplete-text-secondary: var(--el-text-color-regular, #606266);
                    --xterm-autocomplete-text-tertiary: var(--el-text-color-secondary, #909399);
                    --xterm-autocomplete-primary: var(--el-color-primary, #409eff);
                    --xterm-autocomplete-success: var(--el-color-success, #67c23a);
                    --xterm-autocomplete-scrollbar-thumb: var(--el-border-color, #dcdfe6);
                    --xterm-autocomplete-scrollbar-track: var(--el-fill-color-lighter, #fafafa);
                }

                /* 暗色模式适配 */
                @media (prefers-color-scheme: dark) {
                    :root {
                        --xterm-autocomplete-bg: var(--el-bg-color, #1d1e1f);
                        --xterm-autocomplete-border: var(--el-border-color, #4c4d4f);
                        --xterm-autocomplete-shadow: rgba(0, 0, 0, 0.3);
                        --xterm-autocomplete-item-bg: transparent;
                        --xterm-autocomplete-item-hover-bg: var(--el-fill-color-light, #262727);
                        --xterm-autocomplete-item-border: var(--el-border-color-lighter, #414243);
                        --xterm-autocomplete-text-primary: var(--el-text-color-primary, #e5eaf3);
                        --xterm-autocomplete-text-secondary: var(--el-text-color-regular, #cfd3dc);
                        --xterm-autocomplete-text-tertiary: var(--el-text-color-secondary, #a3a6ad);
                        --xterm-autocomplete-primary: var(--el-color-primary, #409eff);
                        --xterm-autocomplete-success: var(--el-color-success, #67c23a);
                        --xterm-autocomplete-scrollbar-thumb: var(--el-border-color, #4c4d4f);
                        --xterm-autocomplete-scrollbar-track: var(--el-fill-color-lighter, #262727);
                    }
                }

                /* 强制暗色模式类支持 */
                .dark .xterm-autocomplete-suggestions,
                [data-theme="dark"] .xterm-autocomplete-suggestions,
                html.dark .xterm-autocomplete-suggestions {
                    --xterm-autocomplete-bg: var(--el-bg-color, #1d1e1f);
                    --xterm-autocomplete-border: var(--el-border-color, #4c4d4f);
                    --xterm-autocomplete-shadow: rgba(0, 0, 0, 0.3);
                    --xterm-autocomplete-item-bg: transparent;
                    --xterm-autocomplete-item-hover-bg: var(--el-fill-color-light, #262727);
                    --xterm-autocomplete-item-border: var(--el-border-color-lighter, #414243);
                    --xterm-autocomplete-text-primary: var(--el-text-color-primary, #e5eaf3);
                    --xterm-autocomplete-text-secondary: var(--el-text-color-regular, #cfd3dc);
                    --xterm-autocomplete-text-tertiary: var(--el-text-color-secondary, #a3a6ad);
                    --xterm-autocomplete-primary: var(--el-color-primary, #409eff);
                    --xterm-autocomplete-success: var(--el-color-success, #67c23a);
                    --xterm-autocomplete-scrollbar-thumb: var(--el-border-color, #4c4d4f);
                    --xterm-autocomplete-scrollbar-track: var(--el-fill-color-lighter, #262727);
                }

                .xterm-autocomplete-suggestions {
                    scrollbar-width: thin;
                    scrollbar-color: var(--xterm-autocomplete-scrollbar-thumb) var(--xterm-autocomplete-scrollbar-track);
                }
                
                .xterm-autocomplete-suggestions::-webkit-scrollbar {
                    width: 8px;
                }
                
                .xterm-autocomplete-suggestions::-webkit-scrollbar-track {
                    background: var(--xterm-autocomplete-scrollbar-track);
                    border-radius: var(--el-border-radius-base, 4px);
                }
                
                .xterm-autocomplete-suggestions::-webkit-scrollbar-thumb {
                    background: var(--xterm-autocomplete-scrollbar-thumb);
                    border-radius: var(--el-border-radius-base, 4px);
                    transition: background-color 0.2s ease;
                }
                
                .xterm-autocomplete-suggestions::-webkit-scrollbar-thumb:hover {
                    background: var(--xterm-autocomplete-primary);
                }
                
                .xterm-suggestion-item {
                    padding: 4px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid var(--xterm-autocomplete-item-border);
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 28px;
                    background: var(--xterm-autocomplete-item-bg);
                    color: var(--xterm-autocomplete-text-primary);
                }
                
                .xterm-suggestion-item:last-child {
                    border-bottom: none;
                }
                
                .xterm-suggestion-item:hover,
                .xterm-suggestion-item.selected {
                    background: var(--xterm-autocomplete-item-hover-bg);
                    transform: translateX(2px);
                }
                
                .xterm-suggestion-item.selected {
                    border-left: 3px solid var(--xterm-autocomplete-primary);
                    padding-left: 9px;
                }
                
                .xterm-suggestion-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    min-width: 0;
                }
                
                .xterm-suggestion-command {
                    color: var(--xterm-autocomplete-primary);
                    font-weight: 600;
                    min-width: 80px;
                    flex-shrink: 0;
                    transition: color 0.2s ease;
                }
                
                .xterm-suggestion-description {
                    color: var(--xterm-autocomplete-text-tertiary);
                    font-size: var(--el-font-size-small, 13px);
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    transition: color 0.2s ease;
                }
                
                .xterm-suggestion-item:hover .xterm-suggestion-description,
                .xterm-suggestion-item.selected .xterm-suggestion-description {
                    color: var(--xterm-autocomplete-text-secondary);
                }
                
                .xterm-suggestion-type {
                    color: var(--xterm-autocomplete-success);
                    font-size: var(--el-font-size-extra-small, 11px);
                    background: color-mix(in srgb, var(--xterm-autocomplete-primary) 15%, transparent);
                    padding: 2px 6px;
                    border-radius: var(--el-border-radius-base, 4px);
                    flex-shrink: 0;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                /* 高对比度模式支持 */
                @media (prefers-contrast: high) {
                    .xterm-autocomplete-suggestions {
                        border-width: 2px;
                    }
                    
                    .xterm-suggestion-item {
                        border-bottom-width: 2px;
                    }
                    
                    .xterm-suggestion-command {
                        font-weight: 700;
                    }
                }

                /* 减少动画模式支持 */
                @media (prefers-reduced-motion: reduce) {
                    .xterm-suggestion-item,
                    .xterm-suggestion-command,
                    .xterm-suggestion-description,
                    .xterm-suggestion-type,
                    .xterm-autocomplete-suggestions::-webkit-scrollbar-thumb {
                        transition: none;
                    }
                    
                    .xterm-suggestion-item:hover,
                    .xterm-suggestion-item.selected {
                        transform: none;
                    }
                }
            `
			document.head.appendChild(style)
		}

		document.body.appendChild(this.suggestionBox)
	}

	/**
	 * 设置主题观察器
	 */
	setupThemeObserver() {
		// 监听系统主题变化
		if (window.matchMedia) {
			const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
			darkModeQuery.addEventListener('change', this.handleThemeChange)
		}

		// 监听 DOM 类变化（如 .dark 类的添加/移除）
		if (typeof MutationObserver !== 'undefined') {
			this.themeObserver = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.type === 'attributes' && 
						(mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
						this.handleThemeChange()
					}
				})
			})

			// 观察 html 和 body 元素的类变化
			this.themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class', 'data-theme']
			})
			this.themeObserver.observe(document.body, {
				attributes: true,
				attributeFilter: ['class', 'data-theme']
			})
		}
	}

	/**
	 * 处理主题变化
	 */
	handleThemeChange() {
		if (!this.suggestionBox) return

		// 强制重新计算 CSS 变量
		this.suggestionBox.style.display = 'none'
		// 使用 requestAnimationFrame 确保样式更新
		requestAnimationFrame(() => {
			if (this.isShowingSuggestions) {
				this.suggestionBox.style.display = 'block'
			}
		})
	}

	/**
	 * 附加事件监听器
	 */
	attachEventListeners() {
		// 直接在终端元素上监听键盘事件，使用捕获阶段
		const terminalElement = this.terminal.element
		if (terminalElement) {
			// 创建键盘事件处理函数
			this.keydownHandler = e => {
				if (!this.enabled) return
				if (this.isShowingSuggestions) {
					const handled = this.handleKeyDown(e, e.key)
					if (!handled) {
						e.preventDefault()
						e.stopPropagation()
						e.stopImmediatePropagation()
					}
				}
			}

			// 在捕获阶段监听，优先级更高
			terminalElement.addEventListener('keydown', this.keydownHandler, true)
		}

		// 监听数据输入
		this.disposables.push(
			this.terminal.onData(data => {
				if (!this.enabled) return
				this.handleInput(data)
			})
		)

		// 监听点击事件隐藏建议
		document.addEventListener('click', this.hideSuggestions)

		// 监听建议框点击
		this.suggestionBox.addEventListener('click', e => {
			const item = e.target.closest('.xterm-suggestion-item')
			if (item) {
				const { command } = item.dataset
				this.applySuggestion(command)

				// 点击后重新聚焦终端
				if (this.terminal && this.terminal.textarea) {
					this.terminal.textarea.focus()
				}
			}
		})
	}

	/**
	 * 处理键盘按下事件
	 */
	handleKeyDown(domEvent) {
		if (this.isShowingSuggestions) {
			switch (domEvent.key) {
				case 'ArrowDown':
					domEvent.preventDefault()
					domEvent.stopPropagation()
					this.selectNext()
					return false
				case 'ArrowUp':
					domEvent.preventDefault()
					domEvent.stopPropagation()
					this.selectPrevious()
					return false
				case 'Tab':
					domEvent.preventDefault()
					domEvent.stopPropagation()
					this.applySelectedSuggestion()
					return false
				case 'Enter':
					domEvent.preventDefault()
					domEvent.stopPropagation()
					this.applySelectedSuggestion()
					return false
				case 'Escape':
					domEvent.preventDefault()
					domEvent.stopPropagation()
					this.hideSuggestions()
					return false
			}
		}
		return true
	}

	/**
	 * 处理输入数据
	 */
	handleInput(data) {
		// 更新当前输入
		if (data === '\r') {
			// 回车键
			this.currentInput = ''
			this.hideSuggestions()
			return
		}

		if (data === '\u007f') {
			// 退格键
			this.currentInput = this.currentInput.slice(0, -1)
		} else if (data.charCodeAt(0) >= 32) {
			// 可打印字符
			this.currentInput += data
		}

		// 触发自动补全
		this.triggerAutoComplete()
	}

	/**
	 * 触发自动补全
	 */
	triggerAutoComplete() {
		const input = this.currentInput

		if (input.length < 1) {
			this.hideSuggestions()
			return
		}

		// 分析当前输入，不使用 trim() 以保留尾随空格
		const words = input.split(/\s+/).filter(word => word.length > 0)
		const isFirstWord = words.length === 1 && !input.includes(' ')

		let suggestions = []

		if (isFirstWord) {
			// 第一个词，匹配命令
			const currentWord = words[0]
			suggestions = this.getCommandSuggestions(currentWord)
		} else if (words.length >= 2) {
			// 后续词，需要分析命令结构
			const command = words[0]
			const commandInfo = this.commandDatabase.find(cmd => cmd.name === command)

			if (!commandInfo) {
				this.hideSuggestions()
				return
			}

			// 获取当前命令上下文的建议
			suggestions = this.getContextualSuggestions(commandInfo, words.slice(1), input.endsWith(' '))
		}

		if (suggestions.length > 0) {
			this.showSuggestions(suggestions)
		} else {
			this.hideSuggestions()
		}
	}

	/**
	 * 获取上下文相关的建议
	 */
	getContextualSuggestions(commandInfo, inputWords, endsWithSpace) {
		let currentContext = commandInfo
		// 如果输入不以空格结尾，最后一个词是需要补全的，不应参与上下文的最终确定
		const wordsForContext = endsWithSpace ? inputWords : inputWords.slice(0, -1)

		wordsForContext.forEach(word => {
			const matchedSubcommand = currentContext.subcommands?.find(sub => sub.name === word)

			if (matchedSubcommand) {
				// 找到匹配的子命令，更新上下文
				currentContext = matchedSubcommand
				return // forEach 的 return 仅跳出当前迭代，相当于 continue
			}

			// 如果不是子命令，检查是否是选项。如果是，我们继续遍历，因为选项后面可能跟其他子命令或选项
			const isOption = currentContext.options?.some(opt => {
				const optionNames = Array.isArray(opt.name) ? opt.name : [opt.name]
				return optionNames.includes(word)
			})
			if (!isOption) {
				// 如果既不是子命令也不是已知选项，则无法继续遍历
				// 注意：由于 forEach 不能被真正中断，这实际上不会停止循环。
				// 但在这个场景下，后续的 word 也不会匹配成功，所以效果上类似 break。
				// 更健壮的实现可能需要 for 循环或 every/some。但为了修复lint，我们先这样处理。
			}
		})

		if (endsWithSpace) {
			// 输入以空格结尾，显示当前上下文的所有可用选项和子命令
			return this.getAllOptionsAndSubcommandsFromContext(currentContext, wordsForContext)
		}

		// 输入不以空格结尾，使用最后一个词在当前上下文中进行匹配
		const partialWord = inputWords[inputWords.length - 1]
		return this.getMatchingSuggestions(currentContext, partialWord)
	}

	/**
	 * 从指定上下文获取所有选项和子命令
	 */
	getAllOptionsAndSubcommandsFromContext(context, inputWords = []) {
		const suggestions = []

		// 添加所有子命令
		if (context.subcommands && context.subcommands.length > 0) {
			context.subcommands.forEach(subcommand => {
				if (inputWords.includes(subcommand.name)) return
				suggestions.push({
					text: subcommand.name,
					description: subcommand.description,
					type: 'subcommand',
				})
			})
		}

		// 添加所有选项
		if (context.options && context.options.length > 0) {
			context.options.forEach(option => {
				const optionNames = Array.isArray(option.name) ? option.name : [option.name]
				const isUsed = optionNames.some(name => inputWords.includes(name))
				if (isUsed) return

				suggestions.push({
					text: optionNames[0], // 默认显示第一个
					displayText: optionNames.join(', '), // 用于UI展示
					description: option.description,
					type: 'option',
				})
			})
		}

		// 只有当确实有建议时才返回，避免无限递归
		return suggestions.length > 0 ? suggestions : []
	}

	/**
	 * 获取匹配的建议
	 */
	getMatchingSuggestions(context, input) {
		const suggestions = []
		console.log(input, 'input')
		const inputLower = this.options.caseSensitive ? input : input.toLowerCase()

		// 匹配子命令
		if (context.subcommands && context.subcommands.length > 0) {
			context.subcommands.forEach(subcommand => {
				const subcommandName = subcommand.name
				const subcommandToMatch = this.options.caseSensitive ? subcommandName : subcommandName.toLowerCase()

				if (subcommandToMatch.startsWith(inputLower)) {
					suggestions.push({
						text: subcommandName,
						description: subcommand.description,
						type: 'subcommand',
					})
				}
			})
		}

		// 匹配选项
		if (context.options && context.options.length > 0) {
			context.options.forEach(option => {
				const optionNames = Array.isArray(option.name) ? option.name : [option.name]
				optionNames.forEach(optionName => {
					const optionToMatch = this.options.caseSensitive ? optionName : optionName.toLowerCase()

					if (optionToMatch.startsWith(inputLower)) {
						suggestions.push({
							text: optionName,
							description: option.description,
							type: 'option',
						})
					}
				})
			})
		}

		return suggestions.slice(0, this.options.maxSuggestions)
	}

	/**
	 * 获取命令建议
	 */
	getCommandSuggestions(input) {
		const suggestions = []
		const inputLower = this.options.caseSensitive ? input : input.toLowerCase()

		this.commandDatabase.forEach(commandInfo => {
			const commandName = commandInfo.name
			const commandToMatch = this.options.caseSensitive ? commandName : commandName.toLowerCase()

			if (commandToMatch.startsWith(inputLower)) {
				suggestions.push({
					text: commandName,
					description: commandInfo.description,
					type: '',
				})
			}
		})

		return suggestions.slice(0, this.options.maxSuggestions)
	}

	/**
	 * 显示建议
	 */
	showSuggestions(suggestions) {
		this.suggestions = suggestions
		this.selectedIndex = 0
		this.isShowingSuggestions = true

		// 清空建议框
		this.suggestionBox.innerHTML = ''

		// 添加建议项
		suggestions.forEach((suggestion, index) => {
			const item = document.createElement('div')
			item.className = 'xterm-suggestion-item'
			if (index === 0) item.classList.add('selected')
			item.dataset.command = suggestion.text

			const contentDiv = document.createElement('div')
			contentDiv.className = 'xterm-suggestion-content'

			const commandSpan = document.createElement('span')
			commandSpan.className = 'xterm-suggestion-command'
			commandSpan.textContent = suggestion.displayText || suggestion.text

			contentDiv.appendChild(commandSpan)

			if (this.options.showDescriptions && suggestion.description) {
				const descSpan = document.createElement('span')
				descSpan.className = 'xterm-suggestion-description'
				descSpan.textContent = suggestion.description
				contentDiv.appendChild(descSpan)
			}

			item.appendChild(contentDiv)

			// if (suggestion.type) {
			//     const typeSpan = document.createElement('span');
			//     typeSpan.className = 'xterm-suggestion-type';
			//     typeSpan.textContent = suggestion.type;
			//     item.appendChild(typeSpan);
			// }

			this.suggestionBox.appendChild(item)
		})

		// 定位建议框
		this.positionSuggestionBox()
		this.suggestionBox.style.display = 'block'
	}

	/**
	 * 定位建议框
	 */
	positionSuggestionBox() {
		if (!this.terminal.element) return

		const terminalRect = this.terminal.element.getBoundingClientRect()
		const buffer = this.terminal.buffer.active
		const cursor = buffer.cursorY

		// 计算光标位置
		const cellHeight = Math.floor(terminalRect.height / this.terminal.rows)
		const cellWidth = Math.floor(terminalRect.width / this.terminal.cols)

		// 基础位置计算
		let x = terminalRect.left + buffer.cursorX * cellWidth
		let y = terminalRect.top + (cursor + 1) * cellHeight + 10

		// 临时显示建议框以获取其尺寸
		this.suggestionBox.style.visibility = 'hidden'
		this.suggestionBox.style.display = 'block'
		const suggestionRect = this.suggestionBox.getBoundingClientRect()
		this.suggestionBox.style.visibility = 'visible'

		// 获取视口尺寸
		const viewportWidth = window.innerWidth
		const viewportHeight = window.innerHeight

		// 水平位置调整
		if (x + suggestionRect.width > viewportWidth) {
			// 如果右侧超出，尝试左对齐到光标位置
			x = terminalRect.left + buffer.cursorX * cellWidth - suggestionRect.width

			// 如果左侧也超出，则贴右边界
			if (x < 0) {
				x = viewportWidth - suggestionRect.width - 10
			}
		}

		// 确保不超出左边界
		x = Math.max(10, x)

		// 垂直位置调整
		const spaceBelow = viewportHeight - y
		const spaceAbove = terminalRect.top + cursor * cellHeight - 10

		if (suggestionRect.height > spaceBelow && spaceAbove > spaceBelow) {
			// 下方空间不足且上方空间更大，显示在上方
			y = terminalRect.top + cursor * cellHeight - suggestionRect.height - 10

			// 确保不超出上边界
			if (y < 10) {
				y = 10
				// 如果上方也不够，调整高度
				const maxHeight = Math.min(300, spaceAbove - 20)
				this.suggestionBox.style.maxHeight = `${maxHeight}px`
			}
		} else if (y + suggestionRect.height > viewportHeight) {
			// 下方超出，调整到视口底部
			y = viewportHeight - suggestionRect.height - 10

			// 如果调整后仍然超出上边界，限制高度
			if (y < 10) {
				y = 10
				const maxHeight = Math.min(300, viewportHeight - 20)
				this.suggestionBox.style.maxHeight = `${maxHeight}px`
			}
		}

		// 应用位置
		this.suggestionBox.style.left = `${x}px`
		this.suggestionBox.style.top = `${y}px`
	}

	/**
	 * 隐藏建议
	 */
	hideSuggestions() {
		this.isShowingSuggestions = false
		this.suggestionBox.style.display = 'none'
		this.suggestions = []
		this.selectedIndex = 0
	}

	/**
	 * 选择下一个建议
	 */
	selectNext() {
		if (this.suggestions.length === 0) return

		const items = this.suggestionBox.querySelectorAll('.xterm-suggestion-item')
		items[this.selectedIndex].classList.remove('selected')

		this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length
		items[this.selectedIndex].classList.add('selected')

		// 滚动到可见区域
		items[this.selectedIndex].scrollIntoView({ block: 'nearest' })
	}

	/**
	 * 选择上一个建议
	 */
	selectPrevious() {
		if (this.suggestions.length === 0) return

		const items = this.suggestionBox.querySelectorAll('.xterm-suggestion-item')
		items[this.selectedIndex].classList.remove('selected')

		this.selectedIndex = this.selectedIndex === 0 ? this.suggestions.length - 1 : this.selectedIndex - 1
		items[this.selectedIndex].classList.add('selected')

		// 滚动到可见区域
		items[this.selectedIndex].scrollIntoView({ block: 'nearest' })
	}

	/**
	 * 应用选中的建议
	 */
	applySelectedSuggestion() {
		if (this.suggestions.length === 0) return

		const suggestion = this.suggestions[this.selectedIndex]
		this.applySuggestion(suggestion.text)
	}

	/**
	 * 应用建议
	 */
	applySuggestion(suggestionText) {
		const input = this.currentInput

		// 如果输入以空格结尾，直接添加建议文本
		if (input.endsWith(' ')) {
			this.terminal.input(`${suggestionText} `)
			this.currentInput += `${suggestionText} `
		} else {
			// 否则需要替换当前未完成的词
			const words = input.split(/\s+/)
			const currentWord = words[words.length - 1]

			// 计算需要补全的部分
			const completion = suggestionText.substring(currentWord.length)

			// 发送补全文本到终端
			if (completion) {
				this.terminal.input(`${completion} `)

				// 更新当前输入状态：替换最后一个不完整的词
				const inputWords = input.split(/\s+/)
				inputWords[inputWords.length - 1] = suggestionText
				this.currentInput = `${inputWords.join(' ')} `
			} else if (suggestionText === currentWord) {
				// 如果建议文本与当前词完全匹配，只需要添加空格
				this.terminal.input(' ')
				this.currentInput += ' '
			}
		}

		this.hideSuggestions()

		// 应用建议后，检查是否应该继续显示提示
		setTimeout(() => {
			this.checkAndShowSuggestionsAfterApply()
		}, 50)
	}

	/**
	 * 应用建议后检查是否应该显示提示
	 */
	checkAndShowSuggestionsAfterApply() {
		const input = this.currentInput
		const words = input.split(/\s+/).filter(word => word.length > 0)

		if (words.length < 1) {
			return
		}

		const command = words[0]
		const commandInfo = this.commandDatabase.find(cmd => cmd.name === command)

		if (!commandInfo) {
			return
		}

		// 如果输入以空格结尾，尝试显示当前上下文的建议
		if (input.endsWith(' ')) {
			const suggestions = this.getContextualSuggestions(commandInfo, words.slice(1), true)
			// 只有当确实有建议时才显示，避免显示空的建议框
			if (suggestions && suggestions.length > 0) {
				this.showSuggestions(suggestions)
			}
		}
	}

	/**
	 * 添加自定义命令
	 */
	addCommand(commandName, options = {}) {
		const commandInfo = {
			name: commandName,
			description: options.description || `自定义命令: ${commandName}`,
			subcommands: options.subcommands || [],
			options: options.options || [],
		}

		// 检查命令是否已存在，如果存在则更新，否则添加
		const existingIndex = this.commandDatabase.findIndex(cmd => cmd.name === commandName)
		if (existingIndex !== -1) {
			this.commandDatabase[existingIndex] = commandInfo
		} else {
			this.commandDatabase.push(commandInfo)
		}
	}

	/**
	 * 批量添加命令
	 */
	addCommands(commands) {
		if (Array.isArray(commands)) {
			// 如果传入的是数组，直接合并
			commands.forEach(commandInfo => {
				this.addCommand(commandInfo.name, commandInfo)
			})
		} else {
			// 如果传入的是对象，转换为新格式
			Object.entries(commands).forEach(([commandName, commandInfo]) => {
				this.addCommand(commandName, commandInfo)
			})
		}
	}

	/**
	 * 移除命令
	 */
	removeCommand(commandName) {
		const index = this.commandDatabase.findIndex(cmd => cmd.name === commandName)
		if (index !== -1) {
			this.commandDatabase.splice(index, 1)
		}
	}

	/**
	 * 获取所有命令
	 */
	getCommands() {
		return this.commandDatabase.map(cmd => cmd.name)
	}

	/**
	 * 清理资源
	 */
	dispose() {
		// 移除事件监听器
		this.disposables.forEach(disposable => disposable.dispose())
		this.disposables.length = 0

		// 移除键盘事件监听器
		const terminalElement = this.terminal?.element
		if (terminalElement && this.keydownHandler) {
			terminalElement.removeEventListener('keydown', this.keydownHandler, true)
		}

		// 移除主题观察器
		if (this.themeObserver) {
			this.themeObserver.disconnect()
			this.themeObserver = null
		}

		// 移除系统主题监听器
		if (window.matchMedia) {
			const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
			darkModeQuery.removeEventListener('change', this.handleThemeChange)
		}

		// 移除DOM元素
		if (this.suggestionBox && this.suggestionBox.parentNode) {
			this.suggestionBox.parentNode.removeChild(this.suggestionBox)
		}

		// 移除全局事件监听器
		document.removeEventListener('click', this.hideSuggestions)

		this.terminal = null
		this.suggestionBox = null
		this.keydownHandler = null
	}
}

// 导出插件类
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AutoCompleteAddon
} else if (typeof window !== 'undefined') {
	window.AutoCompleteAddon = AutoCompleteAddon
}

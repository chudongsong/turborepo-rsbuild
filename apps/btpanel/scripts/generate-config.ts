import { exec } from 'child_process'
import * as fs from 'fs'
import { resolve } from 'path'

interface PanelConfig {
	https: boolean
	proxyIp: string
	proxyKey: string
	proxyPort: number
	sshPort: number
	sshUser: string
	sshPassword: string
}

const getDockerPaneInfo = async (): Promise<PanelConfig | null> => {
	try {
		// 检查当前系统环境，是否为 linux 系统
		const isLinux = process.platform === 'linux'
		if (!isLinux) return null // 如果不是linux系统，则返回null
		const tokenPath = '/www/server/panel/config/api.json' // 面板 api 配置
		const isHttpsPath = '/www/server/panel/data/ssl.pl' // ssl 配置

		// 验证配置文件存在性
		if (!fs.existsSync(tokenPath)) {
			console.warn(`面板配置文件不存在: ${tokenPath}`)
			return null
		}

		// 执行命令，查询指定（bt-panel）服务运行端口
		const portInfo = await exec(`netstat -tlnp | grep bt-panel | awk '{print $4}' | awk -F: '{print $2}'`)
		const portOutput = portInfo.stdout?.toString().trim()
		const port = parseInt(portOutput || '0', 10)
		if (Number.isNaN(port)) {
			throw new Error('获取端口号失败')
		}

		// 检查ssl文件是否存在
		const https = fs.existsSync(isHttpsPath)

		// 读取配置文件内容
		const apiFile = await fs.promises.readFile(tokenPath, 'utf8')
		const tokenInfo = JSON.parse(apiFile)
		const { token } = tokenInfo
		// 验证必要字段
		if (!tokenInfo?.token) {
			throw new Error('配置文件缺少必要字段: token')
		}

		return {
			https, // 是否是https
			proxyKey: token, // 面板key
			proxyPort: port, // 面板端口
			proxyIp: '0.0.0.0', // 面板ip
			sshPort: 22, // ssh端口（测试）
			sshUser: 'root', // ssh用户名（测试）
			sshPassword: 'www.bt.cn', // ssh密码（测试）
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : '未知错误'
		console.error(`配置加载失败: ${errorMessage}`)
		return null
	}
}

// 生成临时配置文件
const generateTempConfig = async (): Promise<void> => {
	// 判断是否存在临时文件夹
	if (!fs.existsSync(resolve(__dirname, '../.temp'))) fs.mkdirSync(resolve(__dirname, '../.temp')) // 创建临时文件夹
	// 临时配置文件路径
	const path = resolve(__dirname, '../.temp/dockerPanel.config.json')
	// 获取docker面板信息
	const config = await getDockerPaneInfo()
	// 新建文件，如果存在则删除
	if (fs.existsSync(path)) fs.unlinkSync(path)
	// 写入文件
	fs.writeFileSync(path, JSON.stringify(config || {}, null, 2))
}

generateTempConfig()

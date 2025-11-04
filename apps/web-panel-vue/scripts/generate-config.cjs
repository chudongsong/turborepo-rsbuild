const { exec } = require('child_process')
const fs = require('fs')
const { resolve } = require('path')

async function getDockerPaneInfo() {
	try {
		// 检查Linux系统
		const isLinux = process.platform === 'linux'
		if (!isLinux) return null

		const tokenPath = '/www/server/panel/config/api.json'
		const isHttpsPath = '/www/server/panel/data/ssl.pl'

		// 检查配置文件存在性
		if (!fs.existsSync(tokenPath)) {
			console.warn(`配置文件不存在: ${tokenPath}`)
			return null
		}

		// 执行命令获取端口
		const portOutput = await new Promise((resolve, reject) => {
			exec(`netstat -tlnp | grep bt-panel | awk '{print $4}' | awk -F: '{print $2}'`, (error, stdout) => {
				if (error) reject(error)
				else resolve(stdout.toString().trim())
			})
		})

		const port = parseInt(portOutput || '0', 10)
		if (Number.isNaN(port)) {
			throw new Error('获取端口号失败')
		}

		// 检查SSL配置
		const https = fs.existsSync(isHttpsPath)

		// 读取并解析配置文件
		const apiFile = fs.readFileSync(tokenPath, 'utf8')
		const tokenInfo = JSON.parse(apiFile)

		if (!tokenInfo?.token) {
			throw new Error('配置缺少token字段')
		}

		return {
			https,
			proxyKey: tokenInfo.token,
			proxyPort: port,
			proxyIp: '0.0.0.0',
			sshPort: 22,
			sshUser: 'root',
			sshPassword: 'www.bt.cn',
		}
	} catch (error) {
		console.error(`错误: ${error.message}`)
		return null
	}
}

async function generateTempConfig() {
	try {
		const tempDir = resolve(__dirname, '../.temp')

		// 创建临时目录
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true })
		}

		const configPath = resolve(tempDir, 'dockerPanel.config.json')
		const config = await getDockerPaneInfo()

		// 清理旧文件
		if (fs.existsSync(configPath)) {
			fs.unlinkSync(configPath)
		}

		// 写入新配置
		fs.writeFileSync(configPath, JSON.stringify(config || {}, null, 2))
		console.log(`配置文件已生成: ${configPath}`)
	} catch (error) {
		console.error('生成配置文件失败:', error.message)
		process.exit(1)
	}
}

// 执行生成
generateTempConfig()

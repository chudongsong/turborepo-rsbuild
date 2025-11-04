import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import express from 'express'
import notifier from 'node-notifier'
import axios from 'axios'
// import cliProgress from 'cli-progress'

const execAsync = promisify(exec)
const app = express()
const port = 3000

app.use(express.json())
let isBuild = false
let isQueue = false

/**
 * @description 获取最新的 Git 提交信息
 * @param {string} path 项目路径
 * @returns {Promise<string>}
 */
const getLatestCommitMessage = async path => {
	try {
		await executeCommand('git', ['-C', path, 'pull'])
		const { stdout } = await execAsync(`git -C ${path} log --oneline -10`)
		// 筛选最新的提交信息，排除掉 Merge 的提交信息
		const commitList = stdout.split('\n').filter(commit => !commit.includes('Merge'))
		return commitList[0].split(' ')[1]
	} catch (error) {
		throw new Error(`Error: ${error.stderr}`)
	}
}

/**
 * @description 判断是否继续执行任务
 * @param {string} commitMessage 提交信息
 * @returns {boolean}
 */
const shouldContinue = commitMessage => {
	// 根据特定条件判断是否继续执行任务
	// 例如，如果提交信息包含 "【打包】打包生产版本"，则不继续执行任务
	return !commitMessage.includes('【打包】打包生产版本')
}

const executeCommand = (command, args) => {
	return new Promise((resolve, reject) => {
		const process = spawn(command, args)

		process.stdout.on('data', data => {
			// console.log(`stdout: ${data}`)
		})

		process.stderr.on('data', data => {
			// console.error(`stderr: ${data}`)
		})

		process.on('close', code => {
			if (code === 0) {
				resolve()
			} else {
				reject(new Error(`Command failed with exit code ${code}`))
			}
		})
	})
}

/**
 * @description 定时任务
 * @param {string} path 项目路径
 */
const scheduledTask = async path => {
	try {
		isBuild = true
		const latestCommitMessage = await getLatestCommitMessage(path) // 获取最新的 Git 提交信息
		console.log('latestCommitMessage', latestCommitMessage)
		if (shouldContinue(latestCommitMessage)) {
			notifier.notify({
				title: '已检测到提交，正在自动打包，请稍等...',
				message: `提交信息: ${latestCommitMessage}`,
			})
			await executeCommand('cmd', ['/c', 'pnpm run build --ip 197 --git 9.3.0'])
			notifier.notify({
				title: '打包完成',
				message: 'Git 提交打包完成',
			})
			sendFeishuMessage(`打包完成，\n提交信息: ${latestCommitMessage}`)
		}
	} catch (error) {
		console.error(error)
	} finally {
		isBuild = false
	}
}

/**
 * @description 打包文件
 * @param {string} message 提交信息
 */
const buildFile = async (message = '') => {
	await scheduledTask('./')
}

/**
 * @description 发送飞书机器人消息
 * @param {string} message 消息内容
 * @returns {Promise<void>}
 */
const sendFeishuMessage = async message => {
	try {
		await axios.post('https://open.feishu.cn/open-apis/bot/v2/hook/ac4beb97-7e07-4048-882f-77cabde5e6b1', {
			msg_type: 'text',
			content: {
				text: message,
			},
		})
		console.log('飞书消息发送成功')
	} catch (error) {
		console.error(`飞书消息发送失败: ${error.message}`)
		throw error
	}
}

// 创建一个接口，用于触发 Git 提交 Hook
app.post('/git/commit', async (req, res) => {
	// 设置 X-Gitlab-Token 防止恶意请求
	if (Number(req.headers['x-gitlab-token']) !== 123456) {
		return res.status(401).send('Unauthorized')
	}
	try {
		if (!isBuild) {
			await buildFile() // 执行打包任务
		} else {
			isQueue = true // 打包任务正在执行中，将任务加入队列
		}
		return res.status(200).send('打包完成，请稍等...')
	} catch (error) {
		isBuild = false
		return res.status(500).send('项目打包失败, 请手动检查项目代码')
	}
})

// 创建一个接口，用于触发 Git 提交标记 Hook
app.listen(port, async () => {
	await buildFile() // 执行打包任务
	console.log(`Server is running on http://localhost:${port}`)
})

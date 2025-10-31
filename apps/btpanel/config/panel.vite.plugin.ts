/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'node:fs' // 文件处理
import path from 'node:path' // 路径处理
import { promisify } from 'node:util' // promisify 处理
import { Client } from 'ssh2' // SSH 客户端
import archiver from 'archiver' // 压缩
import Table from 'cli-table3' // 表格美化
import { glob } from 'glob' // 匹配规则
import ora, { Ora } from 'ora'
import type { Plugin } from 'vite'
import type { FileEmptyDirRules, FileMapsRules, FileReplaceAloneRules, FileReplaceRules, SyncRemoteServerOptions } from './type' // 文件映射规则
import DevTools from './bak/panel.build' // 配置文件

const rename = promisify(fs.rename) // 重命名
const unlink = promisify(fs.unlink) // 删除文件
const readdir = promisify(fs.readdir) // 读取目录
const mkdir = promisify(fs.mkdir) // 创建目录
const rmdir = promisify(fs.rmdir) // 删除目录
const readFile = promisify(fs.readFile) // 读取文件
const writeFile = promisify(fs.writeFile) // 写入文件
const copyFile = promisify(fs.copyFile) // 复制文件
const stat = promisify(fs.stat) // 文件信息

/**
 * @description 获取项目路径
 * @returns {string} 返回项目路径
 */
const getProjectPath = (): string => {
	const projectPath = path.resolve(process.cwd()) // 项目路径
	return projectPath
}

/**
 * @description 用于对项目进行面板兼容构建
 * @param options
 */
export const pluginPanelBuild = (options: any) => ({
	name: 'vite-plugin-panel-build',
	apply: 'build',
	async closeBundle() {
		const projectPath = getProjectPath() // 获取项目路径
		const promiseList: Promise<void>[] = [] // promise列表
		for (const item of options) {
			console.log('item:', item)
			const { type } = item as any // 类型
			switch (type) {
				case 'maps': // 文件映射
					promiseList.push(...(await fileMaps(item as FileMapsRules, projectPath)))
					break
				case 'replace': // 替换文件内容
					promiseList.push(...(await modifyFileContent(item.entry, item.replaceList)))
					break
			}
		}
	},
})

const fileMaps = async (rules, projectPath) => {
	const promiseList = [] // promise列表
	for (const rule of rules) {
		// eslint-disable-next-line no-await-in-loop
		const globFiles = await glob(rule.entry, { cwd: projectPath }) // 匹配的文件信息，导入
		const exportPath = path.resolve(projectPath, rule.export) // 导出路径
		const pathList = globFiles.map(item => path.join(projectPath, item)) // 文件路径
		if (!rule?.copy) {
			promiseList.push(moveFiles(pathList, exportPath)) // 移动文件
		} else {
			promiseList.push(copyFiles(pathList, exportPath)) // 复制文件
		}
	}
	return promiseList
}

/**
 * @description 移动文件
 * @param {string} srcFile 源文件
 * @param {string} destDir 目标目录
 */
const moveFiles = async (srcFile: string | string[], destDir: string) => {
	try {
		let srcFiles = srcFile
		if (typeof srcFile === 'string') srcFiles = [srcFile] as string[]
		// 遍历文件
		for (const file of srcFiles) {
			// 检查源文件是否存在
			if (!fs.existsSync(file)) continue
			// 检查目标目录是否存在，如果不存在则创建
			if (!fs.existsSync(destDir)) {
				await mkdir(destDir, { recursive: true })
			}
			const fileName = path.basename(file) // 获取文件名
			const destFile = path.join(destDir, fileName) // 构建目标文件路径
			await rename(file, destFile) // 移动文件
		}
	} catch (error) {
		console.error('移动文件时出错:', error)
	}
}

/**
 * @description 修改文件内容
 * @param {string} file 文件路径
 * @param {string | RegExp} replace 替换内容
 * @param {string} content 替换后的内容
 * @returns
 */
const modifyFileContent = async (file: string | string[], replace: string | RegExp | FileReplaceAloneRules[], content?: string) => {
	try {
		let files = file
		let replaceList: FileReplaceAloneRules[] = []
		if (typeof file === 'string') files = [file] as string[]
		if (!Array.isArray(replace) && content === '') {
			replaceList = [{ replace, content }]
		} else {
			replaceList = replace as FileReplaceAloneRules[]
		}
		// 遍历文件
		for (const fileItem of files) {
			// 检查文件是否存在
			if (!fs.existsSync(fileItem)) throw new Error(`文件不存在: ${fileItem}`) // 文件不存在
			let fileContent = await readFile(fileItem, 'utf-8') // 读取文件内容
			for (const item of replaceList) {
				fileContent = await replaceContent(item, fileContent) // 替换内容
			}
			await writeFile(fileItem, fileContent, 'utf-8') // 写入文件
		}
	} catch (error) {
		console.error('modifyFileContent error:', error)
	}
}

/**
 * @description 复制文件
 * @param {string | string[]} srcFile 源目录
 * @param {string} destDir 目标目录
 */
const copyFiles = async (srcFile: string | string[], destDir: string) => {
	const srcFiles = Array.isArray(srcFile) ? srcFile : [srcFile]
	const mkdirIfNotExists = async (dir: string) => {
		if (!fs.existsSync(dir)) {
			await mkdir(dir, { recursive: true })
		}
	}
	await mkdirIfNotExists(destDir)
	const copyPromises = srcFiles.map(async file => {
		if (!fs.existsSync(file)) return
		const statInfo = await stat(file)
		if (!statInfo.isFile()) return
		const fileName = path.basename(file)
		const destFile = path.join(destDir, fileName)
		await copyFile(file, destFile)
	})
	await Promise.all(copyPromises)
}

/**
 * @description 替换文件内容
 * @param {FileReplaceAloneRules} item 替换规则
 * @param {string} fileContent 文件内容
 * @returns
 */
const replaceContent = async (item: FileReplaceAloneRules, fileContent: string): Promise<string> => {
	return new Promise(resolve => {
		const updatedContent = fileContent.replace(item.replace, item.content) // 替换内容
		resolve(updatedContent)
	})
}

/**
 * @description 创建文件夹
 * @param {string} dirPath 文件夹路径
 * @param {boolean} recursive 是否递归创建
 * @returns {Promise<void>}
 */
export const createDir = async (dirPath: string, recursive: boolean = true): Promise<void> => {
	try {
		if (fs.existsSync(dirPath)) return
		await fs.promises.mkdir(dirPath, { recursive })
	} catch (error) {
		console.error(`创建目录时出错: ${dirPath}`, error)
	}
}

/**
 * @description 压缩文件
 * @param {string} source 源文件路径
 * @param {string} target 目标文件路径
 */
export const compressZip = (source: string, target: string): Promise<{ size: number; spinner: Ora }> => {
	const spinner = ora({
		text: '[Plugin:Archiver]：正在创建压缩文件，请稍候...',
	}).start() // Start the spinner
	const archive = archiver('zip', { zlib: { level: 9 } }) // 设置压缩级别
	const stream = fs.createWriteStream(target) // 创建写入流
	return new Promise((resolve, reject) => {
		archive
			.glob('**', { cwd: source })
			.on('error', err => {
				spinner.fail('[Plugin:Archiver]：创建压缩文件时出错') // Stop the spinner
				reject(err)
			})
			.pipe(stream)
		stream.on('close', () => {
			const size = archive.pointer()
			spinner.succeed(`[Plugin:Archiver]：创建压缩文件成功，压缩文件大小：${(size / 1024 / 1024).toFixed(2)}MB`) // Stop the spinner
			resolve({ size, spinner })
		})
		archive.finalize()
	})
}

/**
 * @description 创建SSH连接
 */
const createSSHClient = (host: string, port: number, username: string, password: string): Promise<{ connect: Client; spinner: Ora }> => {
	const spinner = ora({
		text: '[Plugin:Client]：正在创建SSH连接，请稍候...',
	}).start() // Start the spinner
	return new Promise((resolve, reject) => {
		try {
			const connect = new Client()
			connect
				.on('ready', () => {
					spinner.succeed(`[Plugin:Client]：已创建SSH连接-${host}`) // Stop the spinner
					resolve({ connect, spinner })
				})
				.connect({
					host,
					port,
					username,
					password,
				})
		} catch (error) {
			spinner.fail(`[Plugin:Client]：SSH连接失败，请检查配置！${error}`) // Stop the spinner
			reject(error)
		}
	})
}

/**
 * @description 上传文件
 * @param {Client} connection SSH连接
 * @param {string} localPath 本地路径
 * @param {string} remotePath 远程路径
 * @returns
 */
const sshUpload = async (connection: Client, localPath: string, remotePath: string): Promise<{ spinner: Ora }> => {
	return new Promise((resolve, reject) => {
		// 上传文件
		const spinner = ora({
			text: '[Plugin:Upload]：正在上传文件，请稍候...',
			color: 'blue',
		}).start()
		try {
			connection.sftp(function (err, sftp) {
				if (err) throw err
				// console.log('sftp:', localPath, remotePath)
				const readStream = fs.createReadStream(localPath)
				const writeStream = sftp.createWriteStream(remotePath)
				const fileTotalSize = fs.statSync(localPath).size
				const fileSize = (fileTotalSize / 1024 / 1024).toFixed(2) // 文件大小
				let uploadedSize = 0
				let lastTime = Date.now()
				let lastUploadedSize = 0
				// 上传进度
				readStream.on('data', (chunk: Buffer) => {
					uploadedSize += chunk.length
					const currentTime = Date.now()
					const timeDiff = (currentTime - lastTime) / 1000 // 时间差（秒）
					const sizeDiff = uploadedSize - lastUploadedSize // 上传的字节数差
					const speed = (sizeDiff / timeDiff / 1024).toFixed(2) // 计算速度（KB/s）
					lastTime = currentTime
					lastUploadedSize = uploadedSize

					const progress = ((uploadedSize / fileTotalSize) * 100).toFixed(2)
					spinner.text = `[Plugin:Upload]: 总文件大小 ${(fileTotalSize / 1024 / 1024).toFixed(2)}MB，上传进度 ${progress}%，速度 ${speed} KB/s` // 更新进度
				})

				// 上传完成
				writeStream.on('close', () => {
					spinner.succeed(`[Plugin:Upload]: 文件上传成功-${remotePath}`) // Stop the spinner
					resolve({ spinner })
				})

				// 上传失败
				writeStream.on('error', (err: Error) => {
					console.error(err)
					// uploadSpinner.fail('[plugin:UploadFile]: 文件上传失败!'); // Stop the spinner
					reject(err)
				})

				readStream.pipe(writeStream)
			})
		} catch (error) {
			spinner.fail(`[Plugin:Upload]：上传文件失败${error}`) // Stop the spinner
		}
	})
}

/**
 * @description 发送命令
 * @param {Client} connection SSH连接
 * @param {string} command 命令
 * @returns {Promise<boolean>}
 */
const sendCommand = (connection: Client, command: string): Promise<{ spinner: Ora }> => {
	const spinner = ora({
		text: '[Plugin:SendCommand]：正在执行同步命令，请稍候...',
	}).start() // Start the spinner
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line consistent-return
		connection.exec(command, (err, stream) => {
			if (err) return reject(err)
			stream
				.on('close', function () {
					spinner.succeed('[Plugin:SendCommand]：同步命令执行完成') // Stop the spinner
					resolve({ spinner })
				})
				.on('error', function (err: Error) {
					spinner.fail('[Plugin:SendCommand]：同步命令执行失败') // Stop the spinner
					reject(err)
				})
				.on('data', () => ({}))
				.stderr.on('data', () => ({}))
		})
	})
}

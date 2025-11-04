import { status } from './../src/views/soft/public/environment-plugin/mysql/useController'
import { fileBatchCopy } from '@api/files'
/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import fs from 'node:fs' // 文件处理
import path from 'node:path' // 路径处理
import { exec } from 'child_process' // 执行命令行
import { promisify } from 'node:util' // promisify 处理
import { Client } from 'ssh2' // SSH 客户端
import archiver from 'archiver' // 压缩
// import Table from 'cli-table3' // 表格美化
import { glob } from 'glob' // 匹配规则
import ora, { type Ora } from 'ora'
import type { Plugin } from 'vite' // vite
import CleanCSS from 'clean-css' // 压缩CSS
import { minify } from 'terser' // 压缩JS
import type { FileMapsRules, FileRenameRules, FileReplaceAloneRules, FileReplaceRules, FileCompress, SyncRemoteServerOptions, SyncRemoteGitOptions, FileReplaceGroupRules } from './type' // 文件映射规则
import DevTools from './bak/panel.build' // 配置文件

export const rename = promisify(fs.rename) // 重命名
export const unlink = promisify(fs.unlink) // 删除文件
export const readdir = promisify(fs.readdir) // 读取目录
export const mkdir = promisify(fs.mkdir) // 创建目录
export const rmdir = promisify(fs.rmdir) // 删除目录
export const readFile = promisify(fs.readFile) // 读取文件
export const writeFile = promisify(fs.writeFile) // 写入文件
export const copyFile = promisify(fs.copyFile) // 复制文件
export const stat = promisify(fs.stat) // 文件信息
export const execAsync = promisify(exec) // promise化exec

const { getCommandLineArgs, getProxyInfo } = new DevTools()

const cachePath = './.temp' // 缓存路径
const cacheFiles = `${cachePath}/dist.zip` // 缓存路径
const remoteUrl = 'ssh://git@git.bt.cn:30001/root/linux-panel.git' // 仓库地址

/**
 * @description 获取项目路径
 * @returns {string} 返回项目路径
 */
export const getProjectPath = (): string => {
	const projectPath = path.resolve(process.cwd()) // 项目路径
	return projectPath
}

/**
 * @description 文件处理插件，用于处理静态资源路径、文件内容替换和清空空白目录
 * @param {FileMapsRules[]} fileMapsRules 文件映射规则
 * @param {FileReplaceRules[]} fileReplaceRules 文件+容替换规则
 * @returns {Plugin} 返回插件
 */
export const pluginPanelBuild = (fileMapsRules: FileMapsRules[], fileReplaceRules: FileReplaceRules[], fileRenameRules: FileRenameRules[], fileCompress: FileCompress[], fileInjectionHtml: any, fileInjectionHtmlUrl: any, fileRemove: any): Plugin => ({
	name: 'vite-plugin-panel-build',
	apply: 'build',
	enforce: 'post',
	async closeBundle() {
		const projectPath = getProjectPath() // 获取项目路径
		const distPath = getDistPath() // 获取输出路径
		let promiseList: Promise<void>[] = [] // promise列表

		// 文件映射处理
		for (const rule of fileMapsRules) {
			const globFiles = await glob(rule.entry, { cwd: projectPath }) // 匹配的文件信息
			const exportPath = path.resolve(projectPath, rule.export) // 导出路径
			const pathList = globFiles.map(item => path.join(projectPath, item)) // 文件路径
			if (!rule?.copy) {
				promiseList.push(moveFiles(pathList, exportPath)) // 移动文件
			} else {
				promiseList.push(copyFiles(pathList, exportPath)) // 复制文件
			}
		}
		await Promise.all(promiseList)

		promiseList = []
		// 文件内容替换处理
		for (const rule of fileReplaceRules) {
			const globFiles = await glob(rule.entry, { cwd: projectPath }) // 匹配的文件信息
			const pathList = globFiles.map(item => path.join(projectPath, item)) // 文件路径
			promiseList.push(modifyFileContent(pathList, rule)) // 修改文件内容
		}
		await Promise.all(promiseList)

		// 文件重命名处理
		promiseList = []
		for (const rule of fileRenameRules) {
			const globFiles = await glob(rule.entry, { cwd: projectPath }) // 匹配的文件信息
			const pathList = globFiles.map(item => path.join(projectPath, item)) // 文件路径
			promiseList.push(renameFile(pathList[0], rule.rename)) // 重命名文件
		}
		await Promise.all(promiseList)

		// 清除多余文件
		promiseList = []
		for (const rule of fileRemove) {
			const globFiles = await glob(rule.entry, { cwd: projectPath }) // 匹配的文件信息
			const pathList = globFiles.map(item => path.join(projectPath, item)) // 文件路径
			promiseList.push(deleteDir(pathList[0])) // 删除文件
		}
		await Promise.all(promiseList)

		// js注入html
		await pluginJsInjectionHtml(fileInjectionHtml)

		// js注入html
		await pluginJsUrlInjectionHtml(fileInjectionHtmlUrl)

		// 清空空白目录处理
		await removeEmptyDirs(distPath)

		// 压缩文件处理
		promiseList = []
		for (const rule of fileCompress) {
			if (rule.entry.indexOf('.css') > -1) {
				promiseList.push(compressCss(rule.entry, rule.export)) // 压缩CSS文件
			} else {
				promiseList.push(compressJs(rule.entry, rule.export)) // 压缩JS文件
			}
		}

		// 上传服务器
		await pluginRemoteServer({ param: '--ip' })

		// 同步git
		await syncGitFiles({
			param: '--git',
			remote: remoteUrl,
			branch: 'release',
			localPath: `./linux-panel`,
		}) // 同步git文件
	},
})

/**
 * @description js注入html插件
 * @param {string} options.entry 入口文件
 * @param {string[]} options.injectFile 注入文件
 */
export const pluginJsInjectionHtml = async (options: { entry: string; injectFile: string[] }) => {
	const { entry, injectFile } = options
	const projectPath = getProjectPath() // 获取项目路径
	const entryFile = path.resolve(projectPath, entry) // 入口文件
	const code = await readFile(entryFile, 'utf8') // 读取文件内容
	const result = await minify(code) // 压缩代码
	for (const file of injectFile) {
		const filePath = path.resolve(projectPath, file) // 文件路径
		const fileContent = await readFile(filePath, 'utf-8') // 读取文件内容
		const newFileContent = fileContent.replace('</body>', `<script src="/static/js/file-url-load.js"></script><script type="text/javascript">${result.code}</script></body>`) // 替换内容
		await writeFile(filePath, newFileContent, 'utf-8') // 写入文件
	}
}

// /**
//  * @description 获取指定目录下所有的文件路径
//  * @param {string} dir 目录路径
//  * @returns {Promise<string[]>} 返回文件路径数组
//  */
// const getAllFilePaths = async (dir: string): Promise<string[]> => {
// 	const files: string[] = []
// 	const readDir = async (dirPath: string) => {
// 		const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true })
// 		for (const dirent of dirents) {
// 			const res = path.resolve(dirPath, dirent.name)
// 			if (dirent.isDirectory()) {
// 				await readDir(res)
// 			} else {
// 				files.push(res)
// 			}
// 		}
// 	}
// 	await readDir(dir)
// 	return files
// }

/**
 * @description 获取指定目录下所有的文件路径
 * @param {string} dir 目录路径
 * @returns {Promise<string[]>} 返回文件路径数组
 */
const getAllFilePaths = async (dir: string): Promise<string[]> => {
	const files: string[] | PromiseLike<string[]> = []
	const readDir = async (dirPath: string) => {
		const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true })
		for (const dirent of dirents) {
			const res = path.resolve(dirPath, dirent.name)
			if (dirent.isDirectory()) {
				await readDir(res)
			} else {
				files.push(res)
			}
		}
	}
	await readDir(dir)
	return files
}

export const pluginJsUrlInjectionHtml = async (options: { entry: string; url: string[] }) => {
	const { entry, url } = options
	const projectPath = getProjectPath() // 获取项目路径
	const distPath = getDistPath() // 获取输出路径
	const pathNew = path.resolve(distPath, './static/js/file-url-load.js')
	const filePath = path.resolve(projectPath, entry) // 入口文件
	const globFiles = (await getAllFilePaths(filePath)) as string[] // 匹配的文件信息
	const fileList = [] as string[] // 文件列表
	globFiles.forEach(filePath => {
		fileList.push(filePath.replace(`${process.cwd()}`, '').replace(/dist/g, '').replace(/\\\\*/g, '/'))
	})
	const urlList = fileList.filter((item: string) => {
		if (item.indexOf('-legacy.') !== -1) return false
		if (url.indexOf(item) !== -1) return false
		return true
	})
	await writeFile(pathNew, `window.vite_public_preloaded_list=${JSON.stringify([...url, ...urlList])}`, 'utf-8') // 写入文件
}

/**
 * @description 压缩 CSS 文件
 * @param {string} inputFilePath 输入文件路径
 * @param {string} outputFilePath 输出文件路径
 */
export const compressCss = async (inputFilePath: string, outputFilePath: string) => {
	try {
		// 读取输入文件内容
		const inputCode = await readFile(inputFilePath, 'utf-8')
		// 使用 clean-css 压缩代码
		const result = new CleanCSS().minify(inputCode)
		// 检查是否有错误
		if (result.errors.length > 0) {
			console.error(`压缩出错: ${result.errors}`)
			return
		}
		// 将压缩后的代码写入输出文件
		await writeFile(outputFilePath, result.styles, 'utf-8')
	} catch (error) {
		console.error(`文件处理出错: ${error}`)
	}
}

/**
 * @description 文件远程同步插件
 * @param options {SyncRemoteServerOptions} 同步远程服务器配置
 */
export const pluginRemoteServer = async (options: SyncRemoteServerOptions) => {
	const projectPath = getProjectPath() // 获取项目路径
	const distPath = getDistPath() // 获取输出路径
	const tempPath = path.resolve(projectPath, cachePath) // 临时文件路径
	const uploadPath = path.resolve(projectPath, cacheFiles) // 上传文件路径
	// eslint-disable-next-line prefer-const
	let { param, remotePath, host, port, username, password } = options // 获取参数
	// 判断类型
	if (param) {
		const paramId = param.replace('--', '') // 参数id
		const argv = getCommandLineArgs([paramId]) // 获取命令行参数
		if (!argv[paramId]) {
			console.warn('未检测到参数，无法同步服务器信息')
			return false
		}
		const { proxyIp, sshPort, sshUser, sshPassword } = getProxyInfo(argv.paramId) // 服务器信息
		host = proxyIp || host // 服务器地址
		port = sshPort || port // 服务器端口
		username = sshUser || username // 用户名
		password = sshPassword || password // 密码
		remotePath = options.remotePath || '/www/server/panel/BTPanel/'
	}
	await createDir(tempPath) // 创建临时文件

	// 压缩文件 ,注意事项，压缩的需要为路径，输出的地址为文件地址
	const { spinner: spinner_1 } = await compressZip(distPath, uploadPath) // 创建压缩包
	// 创建SSH连接
	const { spinner: spinner_2, connect } = await createSSHClient(host as string, port as number, username as string, password as string)
	// 上传文件，上传路径，注意事项，远程路径必须同时为文件或者文件夹，不能一个文件夹，一个文件
	const { spinner: spinner_3 } = await sshUpload(connect, uploadPath, `${remotePath}dist.zip` as string) // 上传文件
	// 发送命令
	const { spinner: spinner_4 } = await sendCommand(connect, `cd ${remotePath} && rm -rf static && unzip -o dist.zip && rm -r dist.zip && bt 1`)
	// biome-ignore lint/complexity/noForEach: <explanation>
	;[spinner_1, spinner_2, spinner_3, spinner_4].forEach(spinner => spinner.clear())

	connect.end() // 关闭连接
}

/**
 * @description 获取输出路径
 * @returns {string} 输出路径
 */
export const getDistPath = (): string => {
	const distPath = path.resolve(process.cwd(), 'dist') // 输出路径
	return distPath
}

/**
 * @description 递归移除空目录
 * @param {string} dirPath 目录路径
 */
export const removeEmptyDirs = async (dirPath: string): Promise<void> => {
	const files = await fs.promises.readdir(dirPath)
	if (files.length === 0) {
		await fs.promises.rmdir(dirPath)
		// console.log(`Removed empty directory: ${dirPath}`);
		return
	}

	for (const file of files) {
		const fullPath = path.join(dirPath, file)
		const stat = await fs.promises.stat(fullPath)
		if (stat.isDirectory()) {
			await removeEmptyDirs(fullPath)
		}
	}

	// 再次检查目录是否为空
	const remainingFiles = await fs.promises.readdir(dirPath)
	if (remainingFiles.length === 0) {
		await fs.promises.rmdir(dirPath)
		// console.log(`Removed empty directory: ${dirPath}`);
	}
}

/**
 * @description 删除目录及其内容
 * @param {string} dirPath 目录路径
 * @returns
 */
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
export const deleteDir = async (dirPath: string) => {
	try {
		const files = await readdir(dirPath)
		for (const file of files) {
			const filePath = path.join(dirPath, file)
			const stat = fs.statSync(filePath)
			// console.log('filePath:', filePath);
			if (stat.isDirectory()) {
				await deleteDir(filePath) // 递归删除子目录
			} else {
				await unlink(filePath) // 删除文件
			}
		}
		await rmdir(dirPath) // 删除空目录
	} catch (error) {
		console.error('deleteDir error:', error)
	}
}

/**
 * @description 移动文件
 * @param {string} srcFile 源文件
 * @param {string} destDir 目标目录
 */
export const moveFiles = async (srcFile: string | string[], destDir: string) => {
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
export const modifyFileContent = async (file: string | string[], role: FileReplaceAloneRules | FileReplaceGroupRules) => {
	try {
		if (!role) return
		const files = typeof file === 'string' ? ([file] as string[]) : file
		const replaceList: FileReplaceAloneRules[] = role?.replaceList ? (role as FileReplaceGroupRules)?.replaceList : [role as FileReplaceAloneRules]

		// 遍历文件
		for (const fileItem of files) {
			// 检查文件是否存在
			if (!fs.existsSync(fileItem)) throw new Error(`文件不存在: ${fileItem}`) // 文件不存在
			const statInfo = await stat(fileItem) // 判断是否为文件
			if (!statInfo.isFile()) continue // 不是文件
			let fileContent = await readFile(fileItem, 'utf-8') // 读取文件内容
			for (const item of replaceList) {
				if (item.ignore) {
					const paths = path.resolve(process.cwd(), item.ignore)
					if (fileItem.indexOf(paths) > -1) continue
				}
				fileContent = fileContent.replace(item.replace, item.content)
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
export const copyFiles = async (srcFile: string | string[], destDir: string) => {
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
 * @description 复制目录下的所有文件
 * @param {string} srcDir 源目录
 * @param {string} destDir 目标目录
 * @returns {Promise<void>}
 */
export const copyDir = async (srcDir: string, destDir: string): Promise<void> => {
	const files = await fs.promises.readdir(srcDir)
	for (const file of files) {
		const srcPath = path.join(srcDir, file)
		const destPath = path.join(destDir, file)
		const stat = await fs.promises.stat(srcPath)
		if (stat.isDirectory()) {
			await fs.promises.mkdir(destPath, { recursive: true })
			await copyDir(srcPath, destPath)
		} else {
			await fs.promises.copyFile(srcPath, destPath)
		}
	}
}

/**
 * @description 替换文件内容
 * @param {FileReplaceAloneRules} item 替换规则
 * @param {string} fileContent 文件内容
 * @returns
 */
export const replaceContent = async (item: FileReplaceAloneRules, fileContent: string): Promise<string> => {
	return new Promise(resolve => {
		const updatedContent = fileContent.replace(item.replace, item.content) // 替换内容
		resolve(updatedContent)
	})
}

/**
 * @description 重命名文件
 * @param {string} srcFile 源文件
 * @param {string} destFile 目标文件
 */
export const renameFile = async (srcFile: string, destFile: string) => {
	try {
		console.log('srcFile:', srcFile, destFile)
		await rename(srcFile, destFile)
	} catch (error) {
		console.error(`重命名文件时出错: ${srcFile} -> ${destFile}`, error)
	}
}

/**
 * @description 创建文件夹
 * @param {string} dirPath 文件夹路径
 * @param {boolean} recursive 是否递归创建
 * @returns {Promise<void>}
 */
export const createDir = async (dirPath: string, recursive = true): Promise<void> => {
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
export const createSSHClient = (host: string, port: number, username: string, password: string): Promise<{ connect: Client; spinner: Ora }> => {
	const spinner = ora({
		text: '[Plugin:Client]：正在创建SSH连接，请稍候...',
	}).start() // Start the spinner
	return new Promise((resolve, reject) => {
		console.log('host:', host, port, username, password)
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
export const sshUpload = async (connection: Client, localPath: string, remotePath: string): Promise<{ spinner: Ora }> => {
	return new Promise((resolve, reject) => {
		// 上传文件
		const spinner = ora({
			text: '[Plugin:Upload]：正在上传文件，请稍候...',
			color: 'blue',
		}).start()
		try {
			connection.sftp((err, sftp) => {
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
export const sendCommand = (connection: Client, command: string): Promise<{ spinner: Ora }> => {
	const spinner = ora({
		text: '[Plugin:SendCommand]：正在执行同步服务器代码，请稍候...',
	}).start() // Start the spinner
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line consistent-return
		connection.exec(command, (err, stream) => {
			if (err) return reject(err)
			stream
				.on('close', () => {
					spinner.succeed('[Plugin:SendCommand]：同步服务器代码执行完成') // Stop the spinner
					resolve({ spinner })
				})
				.on('error', (err: Error) => {
					spinner.fail('[Plugin:SendCommand]：同步服务器代码执行失败') // Stop the spinner
					reject(err)
				})
				.on('data', (data: string) => {
					// console.log(data)
				})
				.stderr.on('data', () => ({}))
		})
	})
}

/**
 * @description 同步git文件
 */

export const syncGitFiles = async (options: SyncRemoteGitOptions) => {
	try {
		let { param, remote, branch, localPath } = options
		const paramId = param.replace('--', '') // 参数id
		const argv = getCommandLineArgs([paramId]) // 获取命令行参数
		const distPath = getDistPath() // 获取输出路径

		if (!argv[paramId]) {
			console.error('未检测到参数，无法同步GIT信息')
			return false
		}
		localPath = path.resolve(process.cwd(), localPath)
		if (argv[paramId]) branch = argv[paramId]
		if (!fs.existsSync(localPath)) await cloneGitFiles('./', branch, remote) // 拉取项目
		await cancelTempFiles(localPath) // 取消当前所有提交操作
		const currentBranch = await checkGitBranch(localPath, branch) // 检查分支
		if (!currentBranch) await checkoutGitBranch(localPath, branch) // 切换分支
		await pullGitFiles(localPath, branch) // 更新git项目
		await deleteDir(path.resolve(localPath, './BTPanel/static')) // 删除文件
		await copyDir(distPath, path.resolve(localPath, './BTPanel')) // 复制文件
		const { msg, status } = await getCommitMessage(localPath) // 获取提交信息
		if (!status) commitGitMark() // 提交git项目标记
		console.log('请手动复制提交内容:', msg)
		// await commitGitFiles(localPath, branch, msg) // 提交git项目
	} catch (error) {
		console.error('syncGitFiles error:', error)
	}
}

/**
 * @description 执行命令，拉取项目
 * @param {string} path 项目路径
 * @param {string} branch 分支
 * @param {string} repoUrl 仓库地址
 * @returns {Promise<Ora>}
 */
export const cloneGitFiles = async (path: string, branch: string, repoUrl: string) => {
	const spinner = ora({ text: '[Plugin:CloneGitProject]：未检测到Git目录，正在克隆Git项目...' }).start() // Start the spinner
	try {
		await execAsync(`git -C ${path} clone -b ${branch} ${repoUrl}`)
		spinner.succeed('[Plugin:CloneGitProject]：Git项目克隆成功') // Stop the spinner
	} catch (error) {
		spinner.fail('[Plugin:CloneGitProject]：Git项目克隆失败') // Stop the spinner
	}
	return { spinner }
}

/**
 * @description 检测分支
 * @param {string} path 项目路径
 * @param {string} branch 分支
 * @returns {Promise<boolean>}
 */
export const checkGitBranch = async (path = './', branch = 'release') => {
	const str = await execAsync(`git -C ${path} rev-parse --abbrev-ref HEAD`)
	return str.stdout.trim() === branch
}

/**
 * @description 执行命令，切换分支
 * @param {string} path 项目路径
 * @param {string} branch 分支
 * @returns {Promise<Ora>}
 */
export const checkoutGitBranch = async (path: string, branch: string) => {
	const spinner = ora({ text: `[Plugin:CheckoutBranch]：正在切换Git分支${branch}，请稍候...` }).start() // Start the spinner
	try {
		await execAsync(`git -C ${path} checkout ${branch}`)
		spinner.succeed(`[Plugin:CheckoutBranch]：Git分支切换成功，当前分支${branch}`) // Stop the spinner
	} catch (error) {
		spinner.fail('[Plugin:CheckoutBranch]：Git分支切换失败') // Stop the spinner
	}
	return { spinner }
}

/**
 * @description 取消当前所有提交操作
 * @param {string} path 项目路径
 * @returns {Promise<Ora>}
 */
export const cancelTempFiles = async (path: string) => {
	const spinner = ora({
		text: '[Plugin:ResetGitProject]：正在取消Git暂存文件，请稍候...',
	}).start() // Start the spinner
	try {
		await execAsync(`git -C ${path} reset --hard HEAD`)
		spinner.succeed('[Plugin:ResetGitProject]：Git暂存文件取消成功') // Stop the spinner
	} catch (error) {
		spinner.fail('[Plugin:ResetGitProject]：Git暂存文件取消失败') // Stop the spinner
	}
	return { spinner }
}

/**
 * @description 执行命令行，更新git项目
 * @param {string} path 项目路径
 * @param {string} branch 分支
 * @returns {Promise<Ora>}as
 */
export const pullGitFiles = async (path: string, branch: string) => {
	const spinner = ora({ text: '[Plugin:PullGitProject]：正在更新Git项目，请稍候...' }).start() // Start the spinner
	try {
		await execAsync(`git -C ${path} pull origin ${branch}`)
		spinner.succeed(`[Plugin:PullGitProject]：Git项目更新成功，当前分支${branch}`) // Stop the spinner
	} catch (error) {
		spinner.fail('[Plugin:PullGitProject]：Git项目更新失败') // Stop the spinner
	}
	return { spinner }
}

/**
 * @description 获取当前项目的提交信息
 */
export const getCommitMessage = async (path: string) => {
	// 获取提交信息,只获取最近99条，只获取提交信息，不包含ID、作者等信息
	// const str = await execAsync(`git -C ${path} log --oneline -20`)
	// const newLogs = str.stdout.trim().split('\n')
	const newLogs: string = (await SubmitMessage()) || '	'
	// 过滤提交信息，如果包含【打包】打包生产版本，之后的提交信息将不再返回
	return { msg: newLogs, status: newLogs.indexOf('【打包】打包生产版本') >= 0 }
}

/**
 * @description 提交git项目
 * @param {string} path 项目路径
 * @param {string} message 提交信息
 *
 * @returns {Promise<Ora>}
 */
export const commitGitFiles = async (path: string, branch: string, message: string) => {
	const spinner = ora({
		text: '[Plugin:CommitGitProject]：正在提交Git项目，请稍候...',
	}).start() // Start the spinner
	try {
		await execAsync(`git -C ${path} add .`) // 添加所有文件
		await execAsync(`git -C ${path} commit -m "${message}"`) // 提交信息
		await execAsync(`git -C ${path} push origin ${branch}`) // 推送分支
		spinner.succeed('[Plugin:CommitGitProject]：Git项目提交成功') // Stop the spinner
	} catch (error) {
		console.error(error)
		spinner.fail('[Plugin:CommitGitProject]：Git项目提交失败') // Stop the spinner
	}
	return { spinner }
}

/**
 * @description 推送git项目标记，用于标记提交
 * @param {string} path 项目路径
 * @param {string} message 提交信息
 */
export const commitGitMark = async () => {
	const spinner = ora({
		text: '[Plugin:CommitGitMark]：正在标记Git项目，请稍候...',
	}).start() // Start the spinner
	try {
		const time = new Date().toLocaleString() // 当前时间
		await execAsync(`git commit --allow-empty -m "【打包】打包生产版本，${time}"`)
		await execAsync(`git push origin main`) // 推送分支
		spinner.succeed('[Plugin:CommitGitMark]：Git项目标记成功') // Stop the spinner
	} catch (error) {
		spinner.fail('[Plugin:CommitGitMark]：Git项目标记失败') // Stop the spinner
	}
	return { spinner }
}

/**
 * @description 使用 terser 压缩 JavaScript 文件
 * @param {string} inputPath 输入文件路径
 * @param {string} outputPath 输出文件路径
 */
export const compressJs = async (inputPath: string, outputPath: string) => {
	try {
		const code = await readFile(inputPath, 'utf8')
		const result = await minify(code) // 压缩代码
		await writeFile(outputPath, result.code || '', 'utf8')
	} catch (error) {
		console.error(`压缩失败: ${error}`)
	}
}

// 执行 Git 命令获取前 20 条提交信息
export const getCommitMessages = () => {
	return new Promise((resolve, reject) => {
		exec('git log --oneline -100', (error, stdout, stderr) => {
			if (error) {
				reject(`Error: ${stderr}`)
				return
			}
			resolve(stdout.trim().split('\n'))
		})
	})
}

// 过滤提交信息
export const filterCommitMessages = (messages: string[]) => {
	const uniqueMessages = new Set()
	const filteredMessages: string[] = []

	messages.forEach((message: string) => {
		const commitMessage = message.substring(8).trim() // 去除提交 ID
		if (!commitMessage.startsWith('Merge') && !uniqueMessages.has(commitMessage)) {
			uniqueMessages.add(commitMessage)
			filteredMessages.push(commitMessage)
		}
	})

	return filteredMessages
}

// 截取最新的提交信息
export const getLatestCommitMessage = (messages: string[], keyword: string) => {
	for (let index = 0; index < messages.length; index++) {
		const message = messages[index]
		if (message.indexOf(keyword) >= 0) {
			messages.splice(index, messages.length)
			return messages.join('\r\n')
		}
	}
	return null
}

// 主函数
export const SubmitMessage = async () => {
	try {
		const messages: string[] = await getCommitMessages()
		const filteredMessages = filterCommitMessages(messages)
		const latestCommitMessage = getLatestCommitMessage(filteredMessages, '【打包】打包生产版本')
		return latestCommitMessage
	} catch (error) {
		console.error(error)
	}
}

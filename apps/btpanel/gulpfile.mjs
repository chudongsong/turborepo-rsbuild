/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-var-requires */
import gulp from 'gulp'
import fs from 'fs'
import path from 'path'
import { deleteAsync } from 'del'
import replace from 'gulp-replace'
import rename from 'gulp-rename'
import cleanCSS from 'gulp-clean-css'
import uglify from 'gulp-uglify'
import git from 'gulp-git'
import archiver from 'archiver'
import { Client } from 'ssh2'
import simpleGit from 'simple-git'

const { src, dest, series } = gulp

const sGit = simpleGit()

const temp = path.join(process.cwd(), '.temp')
const tempDist = path.join(process.cwd(), '.temp/dist')
const tempDistTemplates = path.join(tempDist, 'templates/default')
const tempDistStatic = path.join(tempDist, 'static')
const tempDistStaticJs = path.join(tempDistStatic, 'js')
const tempDistStaticCss = path.join(tempDistStatic, 'css')

// 任务一：判断/.temp根目录是否存在dist目录，存在则删除
const cleanTempDist = () => {
	if (fs.existsSync(tempDist)) {
		return deleteAsync(tempDist)
	}
	return Promise.resolve({})
}

// 任务二：使用gulp 复制/dist目录到.temp目录
const copyDistToTemp = () => {
	return new Promise((resolve, reject) => {
		const copyDirectory = (srcDir, destDir) => {
			fs.mkdirSync(destDir, { recursive: true })
			const entries = fs.readdirSync(srcDir, { withFileTypes: true })
			for (const entry of entries) {
				const srcPath = path.join(srcDir, entry.name)
				const destPath = path.join(destDir, entry.name)
				// eslint-disable-next-line no-unused-expressions
				entry.isDirectory() ? copyDirectory(srcPath, destPath) : fs.copyFileSync(srcPath, destPath)
			}
		}
		try {
			copyDirectory(path.join(process.cwd(), 'dist'), tempDist)
			resolve({})
		} catch (error) {
			reject(error)
		}
	})
}

// 任务三：修改将/.temp/dist目录根目录下的html，复制到/.temp/dist/templates/default下
const copyHtmlToTemplates = () => {
	return src(path.join(tempDist, '*.html'), { allowEmpty: true, encoding: 'utf-8' })
		.pipe(dest(tempDistTemplates))
		.on('end', () => deleteAsync(path.join(tempDist, '/*.html')))
}

// 任务三扩展：将/.temp/dist/templates/default目录下，login.html和license.html，中注入load-file.min.js文件
const injectLoadFile = () => {
	const url = [path.join(tempDistTemplates, 'login.html'), path.join(tempDistTemplates, 'license.html')]
	return src(url).pipe(replace('</body>', '<script src="/static/js/load-file.min.js"></script></head>')).pipe(dest(tempDistTemplates))
}

// 任务四：使用gulp替换/.temp/dist目录下的*.html文件内容
const replaceHtmlContent = () => {
	return src([path.join(tempDistTemplates, 'login.html'), path.join(tempDistTemplates, 'software.html')])
		.pipe(replace(/\.\/static\//g, '/static/'))
		.pipe(replace(/&#39;/g, "'"))
		.pipe(replace(/&#34;/g, '"'))
		.pipe(replace(/(<link rel="stylesheet" crossorigin href="\/static\/css\/style\.css">)/g, () => ''))
		.pipe(replace(/\/static\/ico\/favicon\.ico/g, '/static/favicon.ico'))
		.pipe(replace(/(\.(js|css)('|"))/g, '.$2?v=VERSION_NUMBER$3'))
		.pipe(dest(tempDistTemplates))
}

// 任务五：使用gulp重命名index.html文件名称为index1.html
const renameHtml = () => {
	return src(path.join(tempDistTemplates, 'index.html'))
		.pipe(rename('index1.html'))
		.pipe(replace(/(\.(js|css)('|"))/g, '.$2?v=VERSION_NUMBER$3'))
		.pipe(dest(tempDistTemplates))
		.on('end', () => deleteAsync(path.join(tempDistTemplates, 'index.html')))
}

// 任务六：使用gulp替换./dist/static/js/*.js目录下的js文件内容
const replaceJsContent = () => {
	return src(path.join(tempDistStaticJs, '*.js'))
		.pipe(replace(/\/?public\/static\//g, '/static/'))
		.pipe(replace(/(\.(js|css)('|"))/g, '.$2?v=VERSION_NUMBER$3'))
		.pipe(dest(tempDistStaticJs))
}

// 任务七：使用gulp替换./dist/static/js/utils.js目录下的js文件内容
const replaceCssContent = () => {
	return src(path.join(tempDistStaticCss, '*.css'))
		.pipe(replace(/\.\.\/\.\.\//g, '/'))
		.pipe(dest(tempDistStaticCss))
}

// 任务八：使用gulp压缩./dist/static/css/base.css文件，压缩规则
const minifyCss = () => {
	const url = [path.join(tempDistStaticCss, 'base.css'), path.join(tempDistStaticCss, 'login.css')]
	return src(url)
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(tempDistStaticCss))
		.on('end', () => deleteAsync(url))
}

// 任务九：遍历dist/static/js所有的*.js文件名，排除-legacy.js后缀的文件名，生成一个 json 数组
const generateJsFileList = async () => {
	const jsFiles = [
		'/static/css/style.css',
		'/static/js/main.js',
		'/static/js/base-lib.js',
		'/static/js/__commonjsHelpers__.js',
		'/static/js/modulepreload-polyfill.js',
		'/static/js/utils-lib.js',
		'/static/js/software.js',
		'/static/js/jquery-2.2.4.min.js',
		'/static/js/utils.min.js',
		'/static/layer/layer.js',
	]
	const entries = await fs.promises.readdir(tempDistStaticJs, { withFileTypes: true })
	for (const entry of entries) {
		if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('-legacy.js')) {
			const name = `/static/js/${entry.name}`
			if (!jsFiles.includes(name)) jsFiles.push(name)
		}
	}
	const loadFilePath = path.join(tempDistStaticJs, 'load-file.js')
	let loadFileContent = await fs.promises.readFile(loadFilePath, 'utf-8')
	loadFileContent = loadFileContent.replace('[/** injection-load-file */]', JSON.stringify(jsFiles, null, 2))
	await fs.promises.writeFile(loadFilePath, loadFileContent)
	return Promise.resolve({})
}

// 任务十：使用gulp压缩./dist/static/js/utils.js文件，压缩规则
const minifyJs = () => {
	const url = [path.join(tempDistStaticJs, 'utils.js'), path.join(tempDistStaticJs, 'load-file.js')]
	return src(url)
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(tempDistStaticJs))
		.on('end', () => deleteAsync(url))
}

// 任务十一：压缩.temp/dist整个目录，使用archiver模块进行压缩，压缩后的文件名称为dist.zip
const zipDist = () => {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(path.join(temp, 'dist.zip'))
		const archive = archiver('zip', {
			zlib: { level: 9 },
			forceZip64: false,
		})

		output.on('close', () => {
			resolve()
		})

		archive.on('error', err => {
			reject(err)
		})

		archive.pipe(output)
		archive.directory(tempDist, false)
		return archive.finalize()
	})
}

// 获取命令行执行命令的参数的函数，例如--ip
const getArgv = name => {
	const index = process.argv.indexOf(name)
	const next = process.argv[index + 1]
	return index !== -1 ? next : null
}

/**
 * @description 获取服务器信息
 */
const getServerInfo = async ip => {
	try {
		// 使用fs模块读取文件内容，将内容转换为JSON对象，获取代理信息
		const rdata = await fs.readFileSync('./config/json/proxy.config.json', 'utf-8')
		const proxyInfo = JSON.parse(rdata)
		const info = proxyInfo[ip] // 获取代理信息，非标准写法
		if (info) {
			const { HTTPS, IP, PORT, SSH_PORT, SSH_USER, SSH_PASSWORD, API } = info
			return {
				https: HTTPS,
				proxyIp: IP,
				proxyPort: PORT,
				proxyKey: API,
				sshPort: SSH_PORT,
				sshUser: SSH_USER,
				sshPassword: SSH_PASSWORD,
			}
		}
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
	} catch (error) {}
	return {}
}

// 任务十二：根据命令行参数--ip，判断是否执行上传指定服务器的操作
const uploadServer = async () => {
	const ip = getArgv('--ip')
	if (!ip) {
		console.log('未指定上传服务器的ip地址，已忽略')
		return Promise.resolve({})
	}
	const { proxyIp, sshUser, sshPassword } = await getServerInfo(ip)

	// 使用ssh2模块连接服务器，上传dist.zip文件，并执行远程脚本
	return new Promise((resolve, reject) => {
		const conn = new Client()
		conn
			.on('ready', () => {
				console.log('Client :: ready')
				conn.sftp((err, sftp) => {
					if (err) throw err
					sftp.fastPut(path.join(temp, 'dist.zip'), '/www/server/panel/BTPanel/dist.zip', err => {
						if (err) throw err
						conn.exec('cd /www/server/panel/BTPanel && rm -rf static && unzip -o dist.zip && rm -r dist.zip && bt 1', (err, stream) => {
							if (err) throw err
							stream
								.on('close', (code, signal) => {
									console.log(`Stream :: close :: code: ${code}, signal: ${signal}`)
									resolve()
									conn.end()
								})
								.on('data', data => {
									// console.log(`${data}`)
								})
								.stderr.on('data', data => {
									// console.log(`${data}`)
								})
						})
					})
				})
			})
			.connect({
				host: proxyIp,
				port: 22,
				username: sshUser,
				password: sshPassword,
			})
	})
}

// 任务十三：使用gulp操作git，
// 1、执行当前git目录是否存在，没有就拉取指定分支代码，
// 2、存在git目录，切换到指定分支，
// 3、分支和目录都存在后则复制文件到分支目录，输出最近的提交记录
const gitOperations = async () => {
	const branch = getArgv('--git')
	const repoPath = path.join(process.cwd(), 'linux-panel')
	if (!branch) {
		console.log('未指定git分支，已忽略')
		return Promise.resolve({})
	}
	if (!fs.existsSync(repoPath)) {
		// 如果目录不存在
		await new Promise((resolve, reject) => {
			git.clone('ssh://git@git.bt.cn:30001/root/linux-panel.git', { args: repoPath }, err => {
				if (err) reject(err)
				resolve()
			})
		})
	}

	// 切换分支
	await new Promise((resolve, reject) => {
		git.checkout(branch, { cwd: repoPath }, err => {
			if (err) reject(err)
			resolve()
		})
	})

	// 复制文件至指定目录
	const copyFilesToRepo = () => {
		return new Promise((resolve, reject) => {
			const copyDirectory = (srcDir, destDir) => {
				fs.mkdirSync(destDir, { recursive: true })
				const entries = fs.readdirSync(srcDir, { withFileTypes: true })
				for (const entry of entries) {
					const srcPath = path.join(srcDir, entry.name)
					const destPath = path.join(destDir, entry.name)
					// eslint-disable-next-line no-unused-expressions
					entry.isDirectory() ? copyDirectory(srcPath, destPath) : fs.copyFileSync(srcPath, destPath)
				}
			}
			try {
				copyDirectory(tempDist, path.join(repoPath, 'BTPanel'))
				resolve({})
			} catch (error) {
				reject(error)
			}
		})
	}

	await copyFilesToRepo()
}

// 任务十四：docker内部编译模式
const dockerBuild = async () => {
	const branch = getArgv('--docker build')
	// 是否存在 docker 参数
	if (!branch) {
		console.log('跳过docker内部编译模式')
		return Promise.resolve({})
	}

	// 判断是否存在 docker-compose.yml 文件
}

// 任务十五：git 同步
const gtiSync = async () => {
	const gitInfo = getArgv('--git')
	if (!gitInfo) {
		console.log('未指定git分支，已忽略')
		return Promise.resolve({})
	}
	// const repoPath = path.join(process.cwd(), 'linux-panel')
	// console.log('gitInfo', gitInfo, repoPath)
	// 执行 git pull 命令
	const pullResult = await sGit.pull('origin', gitInfo)
	console.log('pullResult', pullResult)
	return pullResult
}

// 构建模式
const build = series(cleanTempDist, copyDistToTemp, copyHtmlToTemplates, injectLoadFile, replaceHtmlContent, renameHtml, replaceJsContent, replaceCssContent, minifyCss, generateJsFileList, minifyJs, zipDist, uploadServer, gitOperations)

// 上传模式
const upload = series(uploadServer)
// 上传git模式
const uploadGit = series(gitOperations)
// docker 构建模式
const docker = series(cleanTempDist, copyDistToTemp, copyHtmlToTemplates, injectLoadFile, replaceHtmlContent, renameHtml, replaceJsContent, replaceCssContent, minifyCss, generateJsFileList, minifyJs, dockerBuild)

// 测试模式
const test = series(cleanTempDist, copyDistToTemp)

const gitTask = series(gtiSync)

const test1 = series(cleanTempDist, copyDistToTemp, copyHtmlToTemplates, replaceHtmlContent)

export { build, docker, test, test1, gitTask, upload, uploadGit }

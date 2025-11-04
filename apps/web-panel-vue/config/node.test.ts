import path from 'path'
import { getProjectPath, getDistPath, compressJs, readFile, writeFile } from './compatible.plugin'

const fn = async (entry: string, injectFile: string[]) => {
	const projectPath = getProjectPath() // 获取项目路径
	const distPath = getDistPath() // 获取输出路径
	const entryFile = path.resolve(distPath, entry) // 入口文件
	const entryFileNew = path.resolve(projectPath, `.temp/temp-js-${new Date().getTime()}.js`) // 新的入口文件
	await compressJs(entryFile, entryFileNew) // 压缩JS
	const entryContent = await readFile(entryFileNew, 'utf-8') // 读取文件内容
	// eslint-disable-next-line no-restricted-syntax
	for (const file of injectFile) {
		const filePath = path.resolve(projectPath, file) // 文件路径
		// eslint-disable-next-line no-await-in-loop
		const fileContent = await readFile(filePath, 'utf-8') // 读取文件内容
		const newFileContent = fileContent.replace('</body>', `<script type="text/javascript">${entryContent}</script></body>`) // 替换内容
		// eslint-disable-next-line no-await-in-loop
		await writeFile(filePath, newFileContent, 'utf-8') // 写入文件
	}
}
fn('./config/file-inject.js', ['./dist/templates/default/index.html', './dist/templates/default/login.html', './dist/templates/default/license.html'])

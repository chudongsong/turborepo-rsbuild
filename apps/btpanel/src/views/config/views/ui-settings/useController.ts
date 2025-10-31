import { ref } from 'vue'
import { useMessage, useConfirm } from '@/hooks/tools'
import { validateThemeFile, importThemeConfig, exportThemeConfig } from '@/api/config'
import { smartUpload, validateFileType } from '@/utils/upload-utils'
import { getConfigStore } from '@config/useStore'
import { useGlobalStore } from '@store/global'
import { setTheme, updateAllCSSVariables, type CSSVariableManager } from '@/utils/theme-config'

/**
 * UI设置导入导出控制器
 */
export const useImportExportController = () => {
	const message = useMessage()
	const { getPanelTheme } = getConfigStore()
	const { globalTheme } = useGlobalStore()

	// 导入导出状态
	const importLoading = ref(false)
	const exportLoading = ref(false)

	/**
	 * 导出配置文件
	 */
	const handleExportConfig = async () => {
		if (exportLoading.value) {
			message.success('正在导出配置，请稍候...')
			return
		}

		try {
			exportLoading.value = true
			message.success('正在准备导出配置...')

			// 调用后端API导出主题配置
			const result = await exportThemeConfig()
			if (result.status) {
				const exportInfo = result.data.data
				if (exportInfo.export_path) {
					message.success('正在下载配置文件...')

					// 创建下载链接
					const link = document.createElement('a')
					link.href = `/download?filename=${encodeURIComponent(exportInfo.export_path)}`
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link)

					message.success('配置导出成功！')
				} else {
					message.error('导出失败：无法获取导出文件路径')
				}
			} else {
				const errorMsg = result.msg || '导出配置失败'
				console.error('导出配置失败:', result)
				message.error(`导出失败：${errorMsg}`)
			}
		} catch (error: any) {
			console.error('导出配置异常:', error)
			message.error('导出配置失败')
		} finally {
			exportLoading.value = false
		}
	}

	/**
	 * 导入配置文件
	 * @param options 导入选项
	 */
	const handleImportConfig = (options?: { themeManager?: CSSVariableManager; updateVariables?: () => Promise<void>; onSuccess?: () => void }) => {
		if (importLoading.value) {
			message.success('正在导入配置，请稍候...')
			return
		}

		try {
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = '.gz,.json'
			input.onchange = async (event: any) => {
				const file = event.target.files[0]
				if (!file) return

				try {
					importLoading.value = true
					message.success('正在处理文件...')

					// 验证文件类型
					if (!validateFileType(file, ['.tar.gz'])) {
						message.error('只支持 .tar.gz 格式的文件')
						return
					}

					await smartUpload(file, {
						path: `/tmp`,
						name: file.name,
						useChunked: file.size > 10 * 1024 * 1024, // 大于10MB使用分片上传
						onProgress: percent => {
							message.success(`上传进度: ${percent}%`)
						},
						onError: error => {
							console.error('上传失败:', error)
							message.error('文件上传失败')
						},
					})

					// 验证文件
					const validateResult = await validateThemeFile({ file_path: `/tmp/${file.name}` })

					if (!validateResult.status) {
						message.error(validateResult.msg || '文件验证失败')
						return
					}

					const validationInfo = validateResult.data

					// 显示验证信息并确认导入
					let confirmContent = '确定要导入此配置吗？这将覆盖当前的界面设置。\n\n'
					if (validationInfo.file_info) {
						confirmContent += `文件信息：\n`
						confirmContent += `- 总文件数：${validationInfo.file_info.total_files}\n`
						confirmContent += `- 配置文件：${validationInfo.file_info.config_files}\n`
						confirmContent += `- 资源文件：${validationInfo.file_info.resource_files}\n`
					}

					await useConfirm({
						title: '导入配置',
						content: confirmContent,
					})

					const importResult = await importThemeConfig({
						file_path: `/tmp/${file.name}`,
						backup_existing: true,
					})

					if (importResult.status) {
						// 导入成功，重新获取主题配置
						await getPanelTheme()

						// 应用主题颜色和所有设置
						if (globalTheme.value.theme?.color && options?.themeManager) {
							setTheme(globalTheme.value.theme.color, options.themeManager)
						}

						// 更新所有CSS变量
						if (options?.updateVariables) {
							await options.updateVariables()
						} else {
							await updateAllCSSVariables()
						}

						// 执行成功回调
						if (options?.onSuccess) {
							options.onSuccess()
						}

						const importInfo = importResult.data
						let successMsg = '配置导入成功'
						if (importInfo?.import_info) {
							successMsg += `，已导入 ${importInfo.import_info.total_files} 个文件`
						}
						message.success(successMsg)
					} else {
						message.error(importResult.msg || '导入配置失败')
					}
				} catch (error: any) {
					if (error.message && error.message.includes('用户取消')) {
						return
					}
					message.error('导入配置失败：' + (error.message || '文件处理错误'))
					console.error('导入配置错误:', error)
				} finally {
					importLoading.value = false
				}
			}
			input.click()
		} catch (error: any) {
			message.error('创建文件选择器失败')
			console.error('创建文件选择器错误:', error)
			importLoading.value = false
		}
	}

	return {
		// 状态
		importLoading,
		exportLoading,

		// 方法
		handleImportConfig,
		handleExportConfig,
	}
}

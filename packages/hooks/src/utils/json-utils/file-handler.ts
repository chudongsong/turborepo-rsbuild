/**
 * JSON file upload and reading utility library
 * Provides pure frontend JSON file processing functionality
 */

/**
 * JSON file reading result interface
 */
export interface JsonFileResult<T = any> {
	success: boolean
	data?: T
	error?: string
	fileName?: string
	fileSize?: number
}

/**
 * File selection configuration interface
 */
export interface FileSelectOptions {
	multiple?: boolean // Whether to allow multiple selection
	maxSize?: number // Maximum file size in bytes
	accept?: string // Accepted file types
}

/**
 * JSON file handler class
 */
export class JsonFileHandler {
	private static readonly _defaultMaxSize = 10 * 1024 * 1024 // 10MB

	private static readonly _jsonMimeTypes = [
		'application/json',
		'text/json',
		'application/x-json',
	]

	/**
	 * Create a file selector dialog
	 * @param options File selection configuration
	 * @returns Promise<FileList | null>
	 */
	static createFileSelector(options: FileSelectOptions = {}): Promise<FileList | null> {
		return new Promise((resolve) => {
			if (typeof document === 'undefined') {
				console.error('createFileSelector: document is not available')
				resolve(null)
				return
			}

			const input = document.createElement('input')
			input.type = 'file'
			input.accept = options.accept || '.json,application/json'
			input.multiple = options.multiple || false
			input.style.display = 'none'

			input.onchange = (event) => {
				const target = event.target as HTMLInputElement
				resolve(target.files)
				document.body.removeChild(input)
			}

			input.oncancel = () => {
				resolve(null)
				document.body.removeChild(input)
			}

			document.body.appendChild(input)
			input.click()
		})
	}

	/**
	 * Validate if a file is JSON format
	 * @param file File to validate
	 * @param maxSize Maximum file size limit
	 * @returns Validation result
	 */
	static validateJsonFile(file: File, maxSize?: number): { valid: boolean; error?: string } {
		const sizeLimit = maxSize || this._defaultMaxSize

		// Check file size
		if (file.size > sizeLimit) {
			return {
				valid: false,
				error: `文件大小超出限制，最大允许 ${(sizeLimit / 1024 / 1024).toFixed(1)}MB`,
			}
		}

		// Check file extension
		const fileName = file.name.toLowerCase()
		if (!fileName.endsWith('.json')) {
			return {
				valid: false,
				error: '文件格式不正确，请选择JSON文件',
			}
		}

		// Check MIME type (if browser supports)
		if (file.type && !this._jsonMimeTypes.includes(file.type)) {
			return {
				valid: false,
				error: '文件类型不正确，请选择有效的JSON文件',
			}
		}

		return { valid: true }
	}

	/**
	 * Asynchronously read file content
	 * @param file File to read
	 * @returns Promise<string> File content
	 */
	static readFileContent(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			if (typeof FileReader === 'undefined') {
				reject(new Error('FileReader is not available'))
				return
			}

			const reader = new FileReader()

			reader.onload = (event) => {
				const result = event.target?.result
				if (typeof result === 'string') {
					resolve(result)
				} else {
					reject(new Error('文件读取失败：无法获取文件内容'))
				}
			}

			reader.onerror = () => {
				reject(new Error('文件读取失败：读取过程中发生错误'))
			}

			reader.onabort = () => {
				reject(new Error('文件读取被中断'))
			}

			reader.readAsText(file, 'UTF-8')
		})
	}

	/**
	 * Parse JSON string to JavaScript object
	 * @param jsonString JSON string
	 * @returns Parsed object
	 */
	static parseJsonString<T = any>(jsonString: string): T {
		try {
			return JSON.parse(jsonString) as T
		} catch (error) {
			throw new Error(`JSON解析失败：${error instanceof Error ? error.message : '格式不正确'}`)
		}
	}

	/**
	 * Complete JSON file reading process
	 * @param file File to process
	 * @param maxSize Maximum file size limit
	 * @returns Promise<JsonFileResult<T>>
	 */
	static async processJsonFile<T = any>(file: File, maxSize?: number): Promise<JsonFileResult<T>> {
		try {
			// 1. Validate file
			const validation = this.validateJsonFile(file, maxSize)
			if (!validation.valid) {
				return {
					success: false,
					error: validation.error,
					fileName: file.name,
					fileSize: file.size,
				}
			}

			// 2. Read file content
			const content = await this.readFileContent(file)

			// 3. Parse JSON
			const data = this.parseJsonString<T>(content)

			return {
				success: true,
				data,
				fileName: file.name,
				fileSize: file.size,
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : '未知错误',
				fileName: file.name,
				fileSize: file.size,
			}
		}
	}

	/**
	 * Select and read JSON files (complete process)
	 * @param options File selection configuration
	 * @returns Promise<JsonFileResult<T>[]>
	 */
	static async selectAndReadJsonFiles<T = any>(
		options: FileSelectOptions = {}
	): Promise<JsonFileResult<T>[]> {
		try {
			// 1. Open file selector dialog
			const files = await this.createFileSelector(options)

			if (!files || files.length === 0) {
				return [
					{
						success: false,
						error: '未选择任何文件',
					},
				]
			}

			// 2. Process all selected files
			const fileArray = Array.from(files)
			const results = await Promise.all(
				fileArray.map((file) => this.processJsonFile<T>(file, options.maxSize))
			)

			return results
		} catch (error) {
			return [
				{
					success: false,
					error: error instanceof Error ? error.message : '文件处理过程中发生未知错误',
				},
			]
		}
	}

	/**
	 * Select and read a single JSON file
	 * @param options File selection configuration
	 * @returns Promise<JsonFileResult<T>>
	 */
	static async selectAndReadJsonFile<T = any>(
		options: Omit<FileSelectOptions, 'multiple'> = {}
	): Promise<JsonFileResult<T>> {
		const results = await this.selectAndReadJsonFiles<T>({ ...options, multiple: false })
		return (
			results[0] || {
				success: false,
				error: '文件读取失败',
			}
		)
	}
}

/**
 * Convenient export functions
 */

/**
 * Select and read a single JSON file
 * @param maxSize Maximum file size limit in bytes
 * @returns Promise<JsonFileResult<T>>
 */
export const selectJsonFile = <T = any>(maxSize?: number): Promise<JsonFileResult<T>> => {
	return JsonFileHandler.selectAndReadJsonFile<T>({ maxSize })
}

/**
 * Select and read multiple JSON files
 * @param maxSize Maximum file size limit in bytes
 * @returns Promise<JsonFileResult<T>[]>
 */
export const selectJsonFiles = <T = any>(maxSize?: number): Promise<JsonFileResult<T>[]> => {
	return JsonFileHandler.selectAndReadJsonFiles<T>({ multiple: true, maxSize })
}

/**
 * Process an existing JSON file object
 * @param file File object
 * @param maxSize Maximum file size limit in bytes
 * @returns Promise<JsonFileResult<T>>
 */
export const processJsonFile = <T = any>(file: File, maxSize?: number): Promise<JsonFileResult<T>> => {
	return JsonFileHandler.processJsonFile<T>(file, maxSize)
}

/**
 * Validate if a file is a valid JSON file
 * @param file File object
 * @param maxSize Maximum file size limit in bytes
 * @returns Validation result
 */
export const validateJsonFile = (
	file: File,
	maxSize?: number
): { valid: boolean; error?: string } => {
	return JsonFileHandler.validateJsonFile(file, maxSize)
}

// Default export
export default JsonFileHandler

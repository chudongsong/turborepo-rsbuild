/* eslint-disable consistent-return */
/*
 * @Descripttion: 代码编辑器
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

// 包含三种模式：文件路径自动处理、请求数据、双向绑定自定义处理

import '/public/static/editor/ace' // 引入ace编辑器

import { getFileContent, saveFileBody } from '@/api/global'
import { isDark } from '@/utils/theme-config'
import { useMessage } from '@message/index'

const { load: $load, request: $request } = useMessage()

export default defineComponent({
	name: 'BtAceEditor',
	props: {
		// 绑定值，可为空，为空时可以使用请求数据
		modelValue: {
			type: String,
			default: '',
		},
		// 最大化
		isZoom: {
			type: Boolean,
			default: false,
		},

		// 是否滚动到底部
		isScrollBottom: {
			type: Boolean,
			default: false,
		},
		// 文件路径
		filePath: {
			type: String,
			default: '',
		},
		request: {
			type: [Object, Boolean] as PropType<
				| {
						get: () => Promise<{ data: string }>
						set: () => Promise<{ data: string }>
				  }
				| boolean
			>,
			default: false,
		},
		// 编码格式
		encoding: {
			type: String,
			default: 'utf-8',
		},
		// 自动保存
		autoSave: {
			type: Boolean,
			default: false,
		},
		// editor配置
		editorOption: {
			type: Object,
			default: () => ({}),
		},
	},
	emits: ['update:modelValue', 'save'],
	setup(props, { attrs, emit, expose }) {
		const { modelValue, editorOption } = toRefs(props)
		const type = ref('file') // 操作类型 - file:文件操作、request:请求操作、model:双向绑定操作
		const editorRef = ref() // editor容器
		const editor = shallowRef() // editor实例
		const isModelValueChange = ref(false) // 是否modelValue改变
		const editorConfig = {
			theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', // 主题
			mode: 'ace/mode/nginx', // 语言类型
			wrap: true, // 是否自动换行
			showInvisibles: false, // 是否显示空格
			showFoldWidgets: false, // 是否显示代码折叠线
			useSoftTabs: true, // 是否使用空格代替tab
			tabSize: 2, // tab宽度
			showPrintMargin: false, // 是否显示打印边距
			readOnly: false, // 是否只读
			fontSize: '12px', // 字体大小
		}
		const isZoomView = ref(false) // 是否全屏显示
		const message = useMessage() // 消息提示

		// 监听modelValue变化
		watch(
			() => modelValue.value,
			val => {
				if (editor.value) {
					if (isModelValueChange.value) {
						isModelValueChange.value = false // 重置
						return
					}
					// 如果编辑器值和modelValue值不一致，则重新设置值
					try {
						const currentValue = editor.value.getValue()
						if (currentValue !== modelValue.value) {
							editor.value.setValue(val || '') // 设置值，确保不为 null/undefined
							editor.value.moveCursorTo(0, 0) // 移动光标到第一行
						}
						if (props.isScrollBottom && editor.value.renderer?.scrollBar?.scrollHeight) {
							setTimeout(() => {
								if (editor.value) {
									editor.value.getSession().setScrollTop(editor.value.renderer.scrollBar.scrollHeight)
								}
							}, 50)
						}
					} catch (error) {
						console.log('设置编辑器值失败', error)
					}
				}
			}
		)

		// 监听 filePath 变化，重新加载文件内容
		watch(
			() => props.filePath,
			(newPath, oldPath) => {
				if (newPath !== oldPath && editor.value) {
					// 文件路径变化时，重新检测类型并加载内容
					checkEditorType()
					if (type.value !== 'model') {
						renderFileContent({ filePath: newPath, request: props.request })
					}
				}
			}
		)

		// 监听 request 变化，重新加载内容
		watch(
			() => props.request,
			(newRequest, oldRequest) => {
				if (newRequest !== oldRequest && editor.value) {
					checkEditorType()
					if (type.value === 'request') {
						renderFileContent({ filePath: props.filePath, request: newRequest })
					}
				}
			},
			{ deep: true }
		)

		// 检测当前编辑器类型
		const checkEditorType = () => {
			if (props.filePath !== '') {
				type.value = 'file'
			} else if (props?.request?.get && props?.request?.set) {
				type.value = 'request'
			} else {
				type.value = 'model'
			}
		}

		// 重新初始化编辑器（用于解决二次打开空白问题）
		const reinitEditor = async () => {
			await nextTick()
			if (editorRef.value && (!editor.value || !editor.value.container)) {
				console.log('检测到编辑器需要重新初始化')

				// 强制初始化编辑器
				const success = initEditor(true)
				if (success) {
					// 重新加载内容
					if (type.value !== 'model') {
						renderFileContent({ filePath: props.filePath, request: props.request })
					} else if (editor.value) {
						editor.value.setValue(modelValue.value || '')
						nextTick(() => {
							if (editor.value) {
								editor.value.focus()
								editor.value.moveCursorTo(0, 0)
							}
						})
					}
				}
			}
		}

		// 初始化editor
		const initEditor = (force = false) => {
			try {
				// 确保容器存在
				if (!editorRef.value) {
					console.error('编辑器容器不存在')
					return false
				}

				// 如果编辑器已存在且正常，直接返回成功
				if (editor.value && editor.value.container && editor.value.container.parentNode) {
					return true
				}

				// 检查容器是否可见（只在非强制模式下检查）
				if (!force) {
					const rect = editorRef.value.getBoundingClientRect()
					if (rect.width === 0 || rect.height === 0) {
						console.log('编辑器容器不可见，等待容器变为可见')
						return false
					}
				}

				// 清空容器内容，准备重新创建
				editorRef.value.innerHTML = ''

				window.ace.config.set('basePath', '/static/editor/') // 设置ace编辑器的路径
				const editorAce = window.ace.edit(editorRef.value, {
					...toRaw(editorConfig),
					...editorOption.value,
				}) // 创建编辑器

				editorAce.commands.addCommand({
					name: '保存文件',
					bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
					exec: () => {
						emit('save', editorAce.getValue())
						if (props.autoSave) {
							saveFileContent({
								filePath: props.filePath,
								request: props.request,
								encoding: props.encoding,
							})
						}
					},
					readOnly: false, // 如果不需要使用只读模式，这里设置为false
				})
				// 值改变
				editorAce.getSession().on('change', () => {
					emit('update:modelValue', editorAce.getValue())
				})
				editor.value = editorAce // 赋值给editor
				return true
			} catch (error) {
				console.log('初始化编辑器失败', error)
				// 重置编辑器状态
				editor.value = null
				return false
			}
		}

		/**
		 * @description 获取文件内容
		 * @param {String} data.filePath 文件路径
		 * @param {Object} data.request 请求对象
		 */
		const renderFileContent = async ({ filePath, request }: any) => {
			const loading = $load('正在加载文件内容，请稍后...')
			try {
				// 确保编辑器实例存在
				if (!editor.value) {
					console.error('编辑器实例不存在，无法设置内容')
					return
				}

				if (type.value === 'file') {
					const rdata = await getFileContent({ path: filePath })
					if (!rdata.status) {
						$request(rdata)
					} else {
						const { data } = rdata
						const content = !data ? '' : data.data || ''
						editor.value.setValue(content)
					}
				} else if (type.value === 'request') {
					const { data } = await request.get()
					editor.value.setValue(data || '')
				} else {
					isModelValueChange.value = true
					emit('update:modelValue', editor.value.getValue())
				}

				// 确保编辑器实例仍然存在再进行后续操作
				nextTick(() => {
					if (editor.value) {
						editor.value.focus() // 获取焦点
						editor.value.moveCursorTo(0, 0) // 移动光标到第一行
					}
				})
			} catch (error) {
				console.log('获取文件内容失败', error)
			} finally {
				loading.close()
			}
		}

		// 保存文件内容
		const saveFileContent = async ({ filePath, request, encoding }: any) => {
			const loadT = message.load('正在保存文件，请稍后...')
			try {
				if (type.value === 'file') {
					const rdata = await saveFileBody({
						path: filePath,
						encoding,
						data: editor.value.getValue(),
					})
					message.request(rdata)
				} else if (type.value === 'request') {
					const rdata = await request.set({
						data: editor.value.getValue(),
						encoding,
					})
					message.request(rdata)
				} else {
					emit('save', editor.value.getValue())
				}
			} catch (error) {
				message.error(error)
			} finally {
				loadT.close()
			}
		}

		// 滚动到底部
		const scrollBottom = () => {
			editor.value.scrollToLine(editor.value.session.getLength(), true, true, () => {})
		}

		// 切换全屏
		const cutZoom = () => {
			isZoomView.value = !isZoomView.value
		}

		// 监听容器大小变化，用于检测容器从隐藏到显示的状态变化
		let resizeObserver: ResizeObserver | null = null

		onMounted(async () => {
			await nextTick()
			checkEditorType() // 检测编辑器类型
			initEditor() // 初始化编辑器

			// 等待编辑器初始化完成
			await nextTick()

			if (type.value !== 'model') {
				renderFileContent({ filePath: props.filePath, request: props.request }) // 渲染文件内容
			} else if (editor.value) {
				// 双向绑定模式，直接设置值
				editor.value.setValue(modelValue.value || '')
				nextTick(() => {
					if (editor.value) {
						editor.value.focus() // 获取焦点
						editor.value.moveCursorTo(0, 0) // 移动光标到第一行
					}
				})
			}

			// 设置 ResizeObserver 监听容器大小变化
			if (editorRef.value && window.ResizeObserver) {
				resizeObserver = new ResizeObserver(entries => {
					entries.forEach(entry => {
						const { width, height } = entry.contentRect
						// 当容器从隐藏变为可见时，重新初始化编辑器
						if (width > 0 && height > 0 && (!editor.value || !editor.value.container)) {
							console.log('容器变为可见，重新初始化编辑器')
							reinitEditor()
						} else if (editor.value && width > 0 && height > 0) {
							// 容器大小变化时，调整编辑器大小
							editor.value.resize()
						}
					})
				})
				resizeObserver.observe(editorRef.value)
			}
		})

		expose({
			getEditor: () => editor.value,
		})
		return () => (
			<div class="ace-editor-content h-full relative">
				<div class={`ace-editor ${props.isZoom ? '' : ''}`} style="height:100%" ref={editorRef} {...attrs} />
				{props.isZoom ? <div class="absolute right-0 top-0 icon-zoom" title={props.isZoom ? '全屏显示' : '退出全屏'} onClick={cutZoom}></div> : null}
			</div>
		)
	},
})

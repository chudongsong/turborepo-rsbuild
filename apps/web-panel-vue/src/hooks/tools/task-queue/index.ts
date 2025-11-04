/* eslint-disable @typescript-eslint/naming-convention */
import { ref, reactive, watch, type Ref } from 'vue'

// 定义任务状态类型
interface TaskStatus<T = any> {
	result: T | null
	status: boolean
	error?: Error | null
}

// 定义任务接口
interface Task<T = any> {
	fn: () => Promise<T>
	name: string
	status: boolean
}

// 使用 hooks 改写任务队列
export function useTaskQueue() {
	const taskList = ref<Task[]>([])
	const taskResults = reactive<Record<string, TaskStatus>>({})
	const isProcessing = ref(false)

	/**
	 * 添加任务到队列
	 * @param taskName - 任务名称，不可为空
	 * @param taskFn - 异步任务函数
	 * @returns 返回 Promise，异步返回任务执行的结果
	 */
	const addTask = <T>(taskName: string, taskFn: () => Promise<T>): Promise<T> => {
		if (!taskName || !taskFn) {
			return Promise.reject(new Error('任务名称和函数不能为空'))
		}

		return new Promise((resolve, reject) => {
			// 初始化任务状态
			taskResults[taskName] = { result: null, status: false, error: null }

			taskList.value.push({
				name: taskName,
				fn: async () => {
					try {
						const result = await taskFn()
						taskResults[taskName] = { result, status: true, error: null }
						resolve(result)
						return result
					} catch (error) {
						const taskError = error instanceof Error ? error : new Error(String(error))
						taskResults[taskName] = { result: null, status: true, error: taskError }
						reject(taskError)
						throw taskError
					}
				},
				status: false,
			})

			startProcessing()
		})
	}

	/**
	 * 获取任务状态
	 * @param taskName - 要查询的任务名称
	 * @returns 返回一个 Ref 容器，包含任务状态和结果
	 */
	const getTaskStatus = <T>(taskName: string): Ref<TaskStatus<T>> => {
		if (!taskResults[taskName]) {
			throw new Error(`任务 "${taskName}" 不存在`)
		}
		return ref(taskResults[taskName]) as Ref<TaskStatus<T>>
	}

	/**
	 * 获取任务结果
	 * @param taskName - 要查询的任务名称
	 * @returns 返回 Promise，根据任务状态返回结果或错误
	 */
	const getTaskResult = <T>(taskName: string): Promise<T> => {
		return new Promise((resolve, reject) => {
			const status = getTaskStatus<T>(taskName)
			if (status.value.status) {
				// eslint-disable-next-line no-unused-expressions
				status.value.error ? reject(status.value.error) : resolve(status.value.result as T)
				return
			}
			watch(
				() => status.value,
				newStatus => {
					if (newStatus.status) {
						// eslint-disable-next-line no-unused-expressions
						newStatus.error ? reject(newStatus.error) : resolve(newStatus.result as T)
					}
				},
				{ deep: true }
			)
		})
	}

	/**
	 * 处理任务队列中的任务
	 * 依次执行队列中未处理的任务，并更新任务状态
	 */
	const processQueue = async (): Promise<void> => {
		if (taskList.value.length === 0) {
			isProcessing.value = false
			return
		}
		const taskIndex = taskList.value.findIndex(task => !task.status)
		if (taskIndex === -1) return
		const task = taskList.value[taskIndex]
		task.status = true
		try {
			await task.fn()
			taskList.value.splice(taskIndex, 1)
		} catch (error) {
			console.error(`任务 "${task.name}" 执行失败:`, error)
			task.status = false
		}
		await processQueue()
	}

	/**
	 * 清除所有任务和任务状态
	 */
	const clearAllTasks = (): void => {
		taskList.value = []
		// eslint-disable-next-line no-restricted-syntax, guard-for-in
		for (const key in taskResults) delete taskResults[key]
		isProcessing.value = false
	}

	/**
	 * 内部方法：启动任务处理
	 * 如果当前未在处理任务，则启动队列处理
	 */
	const startProcessing = (): void => {
		if (!isProcessing.value) {
			isProcessing.value = true
			processQueue()
		}
	}

	return { addTask, getTaskStatus, getTaskResult, processQueue, clearAllTasks }
}

// Worker 管理器 - 处理主题配置的异步计算任务

import type { WorkerMessage, WorkerResponse, ColorScale } from './theme-worker'

interface TaskItem {
  id: string
  resolve: (value: any) => void
  reject: (error: Error) => void
}

type WorkerTaskType = 'generateColorScale' | 'convertColor' | 'analyzeColor' | 'clearCache'

// 使用模块级变量避免类的命名问题
let workerInstance: Worker | null = null
const taskMap: Map<string, TaskItem> = new Map()
let taskCounter = 0

function initializeWorker(): void {
  try {
    workerInstance = new Worker(new URL('./theme-worker.ts', import.meta.url), {
      type: 'module'
    })

    workerInstance.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data
      const task = taskMap.get(response.id)
      if (task) {
        taskMap.delete(response.id)
        if (response.success) {
          task.resolve(response.data)
        } else {
          task.reject(new Error(response.error || 'Worker error'))
        }
      }
    }

    workerInstance.onerror = () => {
      rejectAllTasks(new Error('Worker error'))
    }
  } catch (error) {
    console.error('Worker init failed:', error)
  }
}

function rejectAllTasks(error: Error): void {
  const taskList = Array.from(taskMap.values())
  taskMap.clear()
  taskList.forEach(task => task.reject(error))
}

async function executeTask<T>(type: WorkerTaskType, payload: any): Promise<T> {
  if (!workerInstance) {
    initializeWorker()
    if (!workerInstance) {
      throw new Error('Worker not initialized')
    }
  }

  const id = `task_${++taskCounter}`
  const message: WorkerMessage = { id, type, payload }

  return new Promise((resolve, reject) => {
    taskMap.set(id, { id, resolve, reject })
    
    setTimeout(() => {
      if (taskMap.has(id)) {
        taskMap.delete(id)
        reject(new Error('Worker task timeout'))
      }
    }, 10000)

    workerInstance!.postMessage(message)
  })
}

class ThemeWorkerManager {
  async generateColorScale(primaryColor: string, config: any = {}): Promise<ColorScale> {
    return executeTask<ColorScale>('generateColorScale', { primaryColor, config })
  }

  async convertColor(color: any, from: string, to: string): Promise<any> {
    return executeTask('convertColor', { color, from, to })
  }

  async analyzeColor(color: string): Promise<any> {
    return executeTask('analyzeColor', { color })
  }

  async clearCache(): Promise<void> {
    return executeTask('clearCache', {})
  }

  destroy(): void {
    if (workerInstance) {
      rejectAllTasks(new Error('Worker destroyed'))
      workerInstance.terminate()
      workerInstance = null
      taskMap.clear()
      taskCounter = 0
    }
  }
}

let manager: ThemeWorkerManager | null = null

export function getWorkerManager(): ThemeWorkerManager {
  if (!manager) {
    manager = new ThemeWorkerManager()
  }
  return manager
}

export function destroyWorkerManager(): void {
  if (manager) {
    manager.destroy()
    manager = null
  }
}

export { ThemeWorkerManager }
export type { ColorScale }
import type { ResponseResult } from '@hooks/tools/axios/types'
import exp from 'constants'

// 分类管理
export interface TableClassProps {
	ignore?: string[]
	getClassList: () => Promise<SelectOptionProps[]> // 获取分类列表
	addClass: ({ ps: string }) => Promise<ResponseMessage> // 添加分类
	editClass: ({ id: number, ps: string }) => Promise<ResponseMessage> // 编辑分类
	deleteClass: ({ id: number }) => Promise<ResponseMessage> // 删除分类
	updateOptions?: (options: any) => void // 更新分类列表
}

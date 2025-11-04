import type { ResponseResult } from '@/hooks/tools/types.d';

import { Ref } from 'vue';

// 数据处理,函数参数
export type FnProps =
	| ((data: any) => any)
	| null
	| undefined
	| string
	| Ref<string | number | any[] | boolean> // 定义一个函数类型，接受任意类型的数据，返回任意类型的数据
	| AnyObject;
export type AnyType = ArrayConstructor | BooleanConstructor | FunctionConstructor | ObjectConstructor | StringConstructor | NumberConstructor; // 定义一个类型，包含数组、布尔、函数、对象、字符串、数字
export type KeyArray = AnyType | (() => boolean) | [AnyType | (() => boolean), FnProps];
export type KeyListProps = Record<string, KeyArray>; // 定义一个对象类型，键是字符串，值是一个包含字符串和FnProps类型函数的数组

// 数据处理处理配置
export type DataHandleProps = {
	request: Promise<ResponseResult>; // 请求挂载, 依赖于具体的请求库
	loading?: Ref<boolean> | AnyObject | string; // loading状态
	data?: KeyListProps | KeyArray | AnyType | [AnyType | (() => boolean), FnProps]; // 数据处理，依赖数据处理库
	message?: boolean; // 是否显示提示信息
	success?: (data: ResponseResult | AnyObject | AnyObject[] | T) => void; // 成功回调
	error?: (error: unknown) => void; // 失败回调
};

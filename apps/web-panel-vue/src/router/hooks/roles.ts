import { isNumber } from '@/utils'
import { type RouteRecordRaw, useRouter } from 'vue-router'

const modules = import.meta.glob('../modules/*.ts', { eager: true, import: 'default' })
// 自动导入modules下的所有路由
// const modules = import.meta.webpackContext('../modules', {
// 	// 是否搜索子目录
// 	recursive: false,
// 	regExp: /\.ts$/,
// });

// const modulesArray: any[] = [];
// for (const path of modules.keys()) {
// 	modulesArray.push(modules(path).default);
// }

const rolesRoutes = [
	...Object.keys(modules)
		.map(key => {
			return modules[key] as RouteRecordRaw
		})
		.sort((r1, r2) => {
			const r1Sort = (isNumber(r1.meta?.sort) ? r1.meta?.sort : Number.MAX_VALUE) as number
			const r2Sort = (isNumber(r2.meta?.sort) ? r2.meta?.sort : Number.MAX_VALUE) as number
			return r1Sort - r2Sort
		})
		.filter(item => {
			return item
		}),
]

// 路由跳转
export const routerPush = (name: string) => {
	const router = useRouter()
	router.push({ name })
}

// 路由配置 - 用于创建前端路由
const routes: RouteRecordRaw[] = [...rolesRoutes]

export { routes }

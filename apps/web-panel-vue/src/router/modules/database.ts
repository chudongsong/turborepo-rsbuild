import type { RouteRecordRaw } from 'vue-router'

/**
 * @description 数据库路由需要进行拆分，备注
 */
const databaseRoutes: RouteRecordRaw = {
	name: 'database',
	path: '/database',
	meta: { sort: 4, title: '数据库', icon: 'database' },
	component: () => import('@database/index.vue'),
	children: [
		{
			path: 'mysql',
			name: 'mysql',
			meta: { title: 'MySQL' },
			component: () => import('@database/views/mysql/index.vue'),
		},
		{
			path: 'sqlserver',
			name: 'sqlserver',
			meta: { title: 'SQLServer' },
			component: () => import('@database/views/sql-server/index.vue'),
		},
		{
			path: 'mongodb',
			name: 'mongodb',
			meta: { title: 'MongoDB' },
			component: () => import('@database/views/mongo-db/index.vue'),
		},
		{
			path: 'redis',
			name: 'redis',
			meta: { title: 'Redis' },
			component: () => import('@database/views/redis/index.vue'),
		},
		{
			path: 'pgsql',
			name: 'pgsql',
			meta: { title: 'PgSQL' },
			component: () => import('@database/views/pgsql/index.vue'),
		},
		{
			path: 'sqlite',
			name: 'sqlite',
			meta: { title: 'SQLite' },
			component: () => import('@database/views/sqlite/index.vue'),
		},
	],
}

export default databaseRoutes

import MySQLMaster from '@node/views/master/mysql/index.vue'
import RedisMaster from '@node/views/master/redis/index.vue'

export const tabComponent = [
	{
		label: 'MySQL',
		name: 'mysqlMaster',
		lazy: true,
		render: () => <MySQLMaster />,
	},
	{
		label: 'Redis',
		name: 'redisMaster',
		lazy: true,
		render: () => <RedisMaster />,
	},
]

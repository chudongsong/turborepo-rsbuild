import type { RouteRecordRaw } from 'vue-router';

const ftpRoutes: RouteRecordRaw = {
	name: 'ftp',
	path: '/ftp',
	meta: { sort: 3, title: 'FTP管理', icon: 'ftp' },
	component: () => import('@ftp/index.vue'),
};

export default ftpRoutes;

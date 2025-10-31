import { addFtpClass, deleteFtpClass, editFtpClass, getFtpClassList } from '@/api/ftp';
import { getDataList, getPluginInfo, getSoftStatus } from '@/api/global';
import type { RecommendProps } from '@/components/business/bt-search-history/types';
import type { SelectOptionProps } from '@/components/form/bt-select/types';
import { useCategory } from '@/hooks/business';
import { useDataHandle, useOperation, useTable } from '@/hooks/tools';
import { getPageTotal } from '@/utils';
import { useCheckbox, useLink, useOperate, usePassword, usePath, usePs, useQuota, useStatus } from '@table/column';
import { useFtpStore } from './useStore';

import BtSoftState from '@/components/extension/bt-soft-state/index.vue';
import { useSoftInstallMask } from '@/hooks/business/soft-install-mask';

const { pluginInfo } = useFtpStore();

export const recommendList: RecommendProps[] = [
	{ name: 'llll', callback: () => {} },
	{ name: '222', callback: () => {} },
	{ name: '33333', callback: () => {} },
];

// export const SoftState = useSoftState({});

/**
 * @description FTP操作
 */
export const FtpOperation = useOperation({
	options: [
		{ type: 'button', label: '添加FTP', active: true },
		{ type: 'button', label: '修改FTP端口' },
		{ type: 'button', label: 'FTP日志分析' },
		{ type: 'divider' },
		{ type: 'link', label: 'FTP分类', href: '/ftp/class' },
		{
			type: 'custom',
			render: () => <span>111</span>,
		},
	],
});

// /**
//  * @description 获取分类数据
//  * @returns {void} void
//  */
// export const getClassList = async (): Promise<SelectOptionProps[]> => {
//   let classList: SelectOptionProps[] = [];
//   await useDataHandle({
//     request: getFtpClassList(),
//     data: { msg: Array },
//     success: ({ msg: data }: { msg: { ps: string; id: number }[] }) => {
//       classList = [
//         { label: '全部分类', value: 'all' },
//         ...data.map((item: AnyObject) => ({
//           label: item.ps,
//           value: String(item.id),
//         })),
//       ];
//     },
//   });
//   // 刷新插件列表
//   return classList || [];
// };

// /**
//  * @description FTP分类
//  */
// export const FtpCategory = useCategory({
//   key: 'type',
//   name: 'FTP分类',
//   options: () => [{ label: '全部分类', value: 'all' }],
//   event: {
//     get: getClassList,
//     add: addFtpClass,
//     update: editFtpClass,
//     delete: deleteFtpClass,
//   },
// });

// /**
//  * @description FTP插件遮罩
//  */
// export const FtpSoftInstallMask = useSoftInstallMask({
//   request: async () => {
//     const { data } = await getSoftStatus({ name: 'pure-ftpd' });
//     return Promise.resolve(data);
//   },
//   extension: [],
// });

// /**
//  * @description 错误遮罩
//  */
// // export const FtpErrorMask = useErrorMask();

// /**
//  * @description FTP表格
//  */
// export const FtpTable = useTable({
//   request: async ({ page: p, limit, search, type, sort, sortField }) => {
//     try {
//       const {
//         data: { data, page, search_history, error },
//       } = await getDataList({
//         table: 'ftps',
//         limit,
//         search,
//         type_id: type === 'all' ? '' : type,
//         p,
//       });
//       return {
//         data,
//         total: getPageTotal(page),
//         history: search_history,
//         error,
//       };
//     } catch (error) {
//       return { data: [], total: 0 };
//     }
//   },
//   columns: [
//     useCheckbox(),
//     { label: '用户名', prop: 'name', minWidth: 100 },
//     usePassword(),
//     useStatus({ event: () => {}, data: ['已停用', '已启用'] }),
//     useLink({
//       label: '快速连接', // 描述
//       width: 80,
//       title: '复制快速连接信息',
//       text: '点击查看',
//       event: () => {},
//     }),
//     usePath(),
//     useQuota({
//       event: row => {},
//     }),
//     usePs({ table: 'ftps' }),
//     useOperate([
//       { onClick: () => {}, title: '配置' },
//       { onClick: () => {}, title: '修改' },
//       { onClick: () => {}, title: '日志' },
//       { onClick: () => {}, title: '删除' },
//     ]),
//   ],
//   extension: [FtpCategory, FtpSoftInstallMask],
// });

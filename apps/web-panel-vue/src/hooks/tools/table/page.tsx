import BtPagination from '@/components/data/bt-pagination';
import { TableConfigProps } from './types';

/**
 * @description 分页hook
 * @param {page,row,total} data 参数
 * @returns
 */
export const usePage = (tableConfig: TableConfigProps) => {
	return <BtPagination class="mr-[6px]" v-model:page={tableConfig.page} v-model:row={tableConfig.limit} total={tableConfig.total} />;
};

// export default (props: AnyObject, tableConfig: TableConfigProps) => {
// 	return <BtPagination class="mr-[6px]" v-model:page={tableConfig.page} v-model:row={tableConfig.limit} total={tableConfig.total} {...props} />;
// };

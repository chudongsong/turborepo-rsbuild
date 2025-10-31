import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { ConfigEventProps } from '@table/types'
import { useDialog,useConfirm,useHandleError,useDataHandle } from '@/hooks/tools';
import {DOCKER_SITE_ENV_STORE} from '@docker/views/docker-site/site-env/useStore'
import {DOCKER_SITE_LOG_STORE} from '@docker/views/docker-site/site-env/env-log/useStore';
import { storeToRefs } from 'pinia';




const store = DOCKER_SITE_LOG_STORE();
const { resteData } = store;
const {rowData} = storeToRefs(store);


/**
 * @description 日志弹窗
 * @returns {App}
 */
export const openlogDialog = (row?:any,type?:'build'): Promise<boolean> => {
	rowData.value.compose = row.compose
	rowData.value.log_file = row.log_file
	return new Promise((resolve, error) => {
		useDialog({
			title: `【${row.name}】日志`,
			area: 65,
			component: ()=>import('@docker/views/docker-site/site-env/env-log/index.vue'),
			compData: type ? type : 'run',
			// onConfirm: () => resolve(true),
			onCancel: () => {
				resteData()
				resolve(false)
			},
		});
	});
};
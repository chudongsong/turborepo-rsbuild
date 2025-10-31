import BtButton from '@/components/base/bt-button'
import { TableConfigProps } from './types'

export const useRefresh = (tableConfig: TableConfigProps, refreshTableData: () => void) => (
	<BtButton onClick={refreshTableData} disabled={tableConfig.loading}>
		<i class="svgtofont-el-refresh text-medium"></i>
	</BtButton>
)

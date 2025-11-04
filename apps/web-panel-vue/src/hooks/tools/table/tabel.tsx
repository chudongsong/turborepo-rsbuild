import BtTable from '@/components/data/bt-table'

import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { TableConfigProps } from './types'

export default (tableConfig: TableConfigProps, tableRef: AnyObject, column: Ref<TableColumnProps[]>) => <BtTable ref={tableRef} data={tableConfig.data} v-bt-loading={tableConfig.loading} v-bt-loading:title={tableConfig.loadingTitle} column={column.value} />

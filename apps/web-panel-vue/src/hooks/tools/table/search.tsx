import BtInputSearch from '@/components/extension/bt-input-search/index.vue'
import { TableConfigProps } from './types'

export const useSearch = (tableConfig: TableConfigProps, refreshTableData: () => void) => <BtInputSearch v-model={tableConfig.search} onSearch={refreshTableData} clearable />

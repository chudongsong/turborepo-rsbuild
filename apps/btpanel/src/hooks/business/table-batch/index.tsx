import BtTableBatch from '@/components/extension/bt-table-batch';
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types';

interface BatchProps {
  ref: any;
}

// 批量操作参数
interface useTableBatchProps {
  options: TableBatchOptionsProps[];
}

// 表格批量操作
export const useTableBatch = (props: useTableBatchProps) => {
  return {
    // 注册批量操作
    init: async ({ ref }: BatchProps) => {
      return {
        BtTableBatch: defineComponent(() => {
          return () => (
            <BtTableBatch
              tableRef={ref.value}
              options={props.options}></BtTableBatch>
          );
        }),
      };
    },
  };
};

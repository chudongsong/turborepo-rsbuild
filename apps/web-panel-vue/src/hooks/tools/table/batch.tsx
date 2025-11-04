import BtTableBatch from '@/components/extension/bt-table-batch';
import { TableConfigProps } from './types';

export default (props: AnyObject, tableRef: AnyObject) => {
  return <BtTableBatch tableRef={tableRef} {...props} />;
};

<template>
  <div class="px-[1.6rem] py-[1.6rem]">
    <bt-table-group>
      <template #header-left>
        <bt-input
          v-model="processName"
          :placeholder="'请输入完整的进程名称'"
        ></bt-input>
        <el-button class="ml-1rem" type="primary" @click="addProcessEvent">
          添加进程
        </el-button>
      </template>
      <template #content>
        <bt-table
          :max-height="400"
          ref="table"
          :column="tableColumn"
          :data="getData"
        ></bt-table>
      </template>
    </bt-table-group>
    <bt-help :options="help_list" class="mx-[1.6rem] mt-[1.6rem]"></bt-help>
  </div>
</template>
<script lang="tsx" setup>
import { TableColumnProps } from '@/components/table/bt-table/types';
import { useOperate } from '@/hooks/tools/table/column';
import {
  addProcessWhiteSystem,
  getProcessWhite,
  removeProcessWhite,
} from '@api/firewall';
import { useDataHandle } from '@hooks/tools';

type StringObject = {
  [key: number]: string;
};

// 页面数据
const getData = ref<Array<StringObject>>([]); //列表数据
const processName = ref<string>(''); // 进程名称
const help_list = ref<any>([
  { content: '【进程名称】请填写完整的进程名称,如: mysqld' },
  {
    content:
      '【说明】在白名单列表中的进程将不再检测范围,建议将常用软件的进程添加进白名单',
  },
]); // 帮助列表

// 表格数据
const useTableColumn = () => {
  return shallowRef<TableColumnProps[]>([
    //模式
    {
      label: '进程名称',
      prop: 'processName',
      render: (row: StringObject, index: number) => {
        return <span>{row}</span>;
      },
    },
    useOperate([
      {
        title: '删除',
        onClick: deleteRow,
      },
    ]),
  ]);
};

/**
 * @description 切换列表页面
 */
const getErrorProList = async () => {
  useDataHandle({
    loading: '正在获取进程列表，请稍后...',
    request: getProcessWhite(),
    data: [Array, getData],
  });
};

/**
 * @description 添加进程
 */
const addProcessEvent = async () => {
  useDataHandle({
    loading: '正在添加进程，请稍后...',
    request: addProcessWhiteSystem({ process_name: processName.value }),
    message: true,
    success: (res: any) => {
      if (res.status) {
        getErrorProList();
        processName.value = '';
      }
    },
  });
};

/**
 * @description 删除进程
 * @param {any} row 进程行数据
 */
const deleteRow = async (row?: any) => {
  useDataHandle({
    loading: '正在删除进程，请稍后...',
    request: removeProcessWhite({ process_name: row }),
    message: true,
    success: (res: any) => {
      if (res.status) getErrorProList();
    },
  });
};

const tableColumn = useTableColumn();

// 页面加载完成
onMounted(() => getErrorProList());
</script>

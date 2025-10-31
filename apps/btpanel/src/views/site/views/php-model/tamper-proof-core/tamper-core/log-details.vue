<template>
  <div class="p-2rem">
    <bt-table-group>
      <template #header-left></template>
      <template #header-right></template>
      <template #content>
        <bt-table :column="tableColumns" :maxHeight="400" :data="tableData" />
      </template>
      <template #footer-left></template>
      <template #footer-right>
        <bt-table-page
          v-model:page="tableParams.p"
          v-model:row="tableParams.row"
          :total="tableParams.total"
          @change="getLogData()"
        ></bt-table-page>
      </template>
    </bt-table-group>
  </div>
</template>

<script setup lang="ts">
import { useDataHandle, useDataPage } from "@/hooks/tools";
import {
  getActionLogsForDirname,
  getActionLogsForExts,
  getActionLogsForFilename,
} from "@api/site";

interface Props {
  compData: any;
}
const props = withDefaults(defineProps<Props>(), {
  compData: {},
});

const tableParams = reactive<any>(props.compData.params);
const tableData = ref<any>(props.compData.data.data);

const tableColumns = ref([
  {
    label: "操作时间",
    prop: "addtime",
    width: 150,
  },
  {
    label: "类型",
    prop: "type",
    width: 80,
  },
  {
    label: "日志",
    prop: "log",
  },
]);

/**
 * @description 获取日志数据
 */
const getLogData = async () => {
  let params: any = {
    path_id: tableParams.pid,
    row: tableParams.row,
    pid: tableParams.pid,
    p: tableParams.p,
  };
  if (tableParams.exts) {
    params.exts = tableParams.exts;
  } else if (tableParams.dirname) {
    params.dirname = tableParams.dirname;
  } else {
    params.filename = tableParams.filename;
  }
  const requestFun = tableParams.exts
    ? getActionLogsForExts
    : tableParams.dirname
    ? getActionLogsForDirname
    : getActionLogsForFilename;
  useDataHandle({
    request: requestFun(params),
    data: {
      data: [Array, tableData],
      page: useDataPage(tableParams),
    },
  });
};
</script>

import type { TableColumnProps } from "@/components/data/bt-table/types";

import { defineStore, storeToRefs } from "pinia";
import FILES_STORE from "@files/store";
import {
  cutFiles,
  fileBatchPaste,
  setCopyFiles,
  checkExistsFiles,
} from "@api/files";
import { removeCopyOrCutData } from "@files/useMethods";
import { formatTime, getByteUnit } from "@utils/index";
import { useGlobalStore } from "@/store/global";
import { Message, useConfirm, useDataHandle } from "@hooks/tools";

const FILES_OVERLAY_TIPS_STORE = defineStore("FILES-OVERLAY-TIPS-STORE", () => {
  const { getGlobalInfo } = useGlobalStore();

  const filesStore = FILES_STORE();
  const { fileTabActiveData, copyFilesData } = storeToRefs(filesStore);
  const { refreshFilesList, getRealTask } = filesStore;

  const compData = ref<any>(); // 组件数据

  const sitesPath = ref<string>(""); // 站点目录

  const overlayTableRef = ref<any>(); // 表单数据
  const tableColumns = ref<TableColumnProps[]>([
    {
      type: "selection",
      width: 40,
    },
    {
      prop: "filename",
      label: "文件名",
    },
    {
      prop: "size",
      label: "大小",
      render: (row: any) => {
        return <span>{row.is_dir ? '--' : getByteUnit(row.size)}</span>;
      },
    },
    {
      prop: "mtime",
      width: 136,
      label: "最后修改时间",
      render: (row: any) => {
        return formatTime(Number(row.mtime));
      },
    },
  ]); // 响应式数据
  const calcData = reactive({
    addend1: 0,
    addend2: 0,
    sum: 0 as any,
  }); // 表单数据

  const tableLoading = ref(false); // 表单数据
  const overlayFormRef = ref(); // 表单数据
  const checkedList = ref([]); // 表单数据
  const tableData = ref([]); // 响应式数据

  // 处理文件名称并返回带副本的文件名
  const fileFormat = (fname: string) => {
    if (fname.endsWith(".tar.gz")) {
      const base = fname.substring(0, fname.length - 7); // 移除".tar.gz"后的基本文件名
      return `${base}-副本.tar.gz`; // 在基本文件名后加上"-副本.tar.gz"
    } else {
      // 对于非.tar.gz的扩展名处理
      const index = fname.lastIndexOf(".");
      if (index === -1) {
        // 没有扩展名
        return `${fname}-副本`; // 直接在文件名后添加"-副本"
      } else {
        // 有常规扩展名
        const base = fname.substring(0, index); // 基本文件名
        const extension = fname.substring(index); // 扩展名
        return `${base}-副本${extension}`; // 构造新文件名
      }
    }
  };

  const overlayForm = reactive({
    type: "",
    size: 0,
    filename: "",
    mtime: 0,
		is_dir: false
  }); // 表单数据

  // 验证规则
  const quickRules = reactive({
    name: [
      {
        validator: (rule: any, value: any, callback: any) => {
          if (
            overlayForm.type === "rename" &&
            value === compData.value.fileData[0].filename
          ) {
            callback(new Error("名称重复，请输入新文件名!"));
          }
          if (value === "") {
            callback(new Error("请输入新文件名!"));
          } else {
            callback();
          }
        },
        trigger: ["blur"],
      },
    ],
  });

  const handleSelectionChange = (val: any) => {
    checkedList.value = val;
  };
  const getSingleData = () => {
    overlayForm.type = "rename";
    overlayForm.size = compData.value.fileData[0].size;
    overlayForm.filename = fileFormat(compData.value.fileData[0].filename);
    overlayForm.mtime = compData.value.fileData[0].mtime;
    overlayForm.is_dir = compData.value.fileData[0].is_dir;
  };

  const onConfirm = async (close: any) => {
    if (compData.value.type === "single") {
      // 判定输入的值是否有重名
      const params: any = {
        path: fileTabActiveData.value.param.path,
        name: overlayForm.filename,
      };
      const { data } = await checkExistsFiles(params);
      if (data.length > 0) {
        await useConfirm({
          title: `覆盖文件`,
          content: `检测到同名文件，您确定要覆盖当前【${overlayForm.filename}】文件？`,
        });
      }
      const fileData: any = {
        sfile: copyFilesData.value.files[0].path,
        dfile: fileTabActiveData.value.param.path + "/" + overlayForm.filename,
      };
      if (overlayForm.type === "rename") {
        fileData["rename"] = true;
      }

      const requestFun =
        copyFilesData.value.type === "copy" ? setCopyFiles : cutFiles;

      await useDataHandle({
        loading: "正在处理文件，请稍后...",
        request: requestFun(fileData),
        success: (res: any) => {
          if (res.status) {
            res.msg = "文件覆盖成功!";
            refreshFilesList();
            // 清除剪切板数据
            removeCopyOrCutData();
          }
          Message.request(res);
          getRealTask(); // 获取实时任务队列
          close();
        },
      });
      return;
    }
    // 判定输入的值是否正确
    if (calcData.sum === calcData.addend1 + calcData.addend2) {
      let arr = [
        checkedList.value.map((item: any) => {
          return item.filename;
        }),
      ];
      await useDataHandle({
        loading: "正在处理文件，请稍后...",
        request: fileBatchPaste({
          type: copyFilesData.value.type === "copy" ? 1 : 2,
          path: fileTabActiveData.value.param.path,
          skip: arr,
        }),
        message: true,
        success: (res: any) => {
          if (res.status) {
            refreshFilesList();
            // 清除剪切板数据
            removeCopyOrCutData();
          }
          getRealTask(); // 获取实时任务队列
          close();
        },
      });
    } else {
      Message.error("请输入正确的计算结果");
      return;
    }
  };

  /**
   * @description 获取站点目录
   */
  const getSitesPath = async () => {
    const data: any = await getGlobalInfo();
    sitesPath.value = data?.sites_path || "";
  };

  const watchType = (val: any) => {
    if (compData.value.type === "single") {
      if (val === "over") {
        overlayForm.filename = compData.value.fileData[0].filename;
      } else {
        overlayForm.filename = fileFormat(compData.value.fileData[0].filename);
      }
    }
  };

  const init = async () => {
    tableData.value =
      compData.value.type == "batch" ? compData.value.fileData : [];
    await getSitesPath();
    calcData.sum = undefined;
    calcData.addend1 = Math.round(Math.random() * 9 + 1);
    calcData.addend2 = Math.round(Math.random() * 9 + 1);
    if (compData.value.type == "batch") {
      tableData.value = compData.value.fileData;
      overlayTableRef.value.getTable().toggleAllSelection();
    } else {
      getSingleData();
    }
  };

  const $reset = () => {
    tableData.value = [];
    checkedList.value = [];
  };

  return {
    compData,
    fileTabActiveData,
    sitesPath,
    overlayFormRef,
    overlayForm,
    tableLoading,
    quickRules,
    calcData,
    tableColumns,
    tableData,
    handleSelectionChange,
    watchType,
    fileFormat,
    onConfirm,
    init,
    $reset,
  };
});

export default FILES_OVERLAY_TIPS_STORE;

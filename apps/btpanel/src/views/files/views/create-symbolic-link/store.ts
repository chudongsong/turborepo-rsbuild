import { defineStore } from "pinia";
import FILES_STORE from "@files/store";
import { getCreateLink } from "@api/files";
import { matchUnqualifiedString, getWholePath } from "@files/useMethods";
import { fileSelectionDialog } from "@/public/index";
import { useDataHandle } from "@hooks/tools";

const FILES_CREATE_SYMBOLIC_LINK_STORE = defineStore(
  "FILES-CREATE-SYMBOLIC-LINK-STORE",
  () => {
    const filesStore = FILES_STORE();
    const { refreshFilesList } = filesStore;

    // 表单
    const quickForm = reactive<any>({
      path: "",
      filename: "",
      disable: false,
    });
    const quickFormRef = ref();
    // 验证规则
    const quickRules = reactive({
      path: [
        {
          validator: (rule: any, value: any, callback: any) => {
            if (value === "") {
              callback(new Error("请选择正确的文件地址!"));
            } else {
              callback();
            }
          },
          trigger: ["blur", "change"],
        },
      ],
      filename: [
        {
          validator: (rule: any, value: any, callback: any) => {
            if (value === "") {
              callback(new Error("请输入新文件名!"));
            } else if (matchUnqualifiedString(value)) {
              callback(new Error('文件名不能包含 /\\:*?"<>|符号!'));
            } else {
              callback();
            }
          },
          trigger: ["blur"],
        },
      ],
    });

    /**
     * @description: 触发目录选择
     */
    const openFile = () => {
      fileSelectionDialog({
        type: "all",
        change: (path) => {
          quickForm.path = path;
        },
      });
    };

    // 提交
    const onConfirm = async (close: any) => {
      try {
        const params = {
          sfile: quickForm.path,
          dfile: getWholePath(quickForm.filename),
        };
        await quickFormRef.value.validate(); // 校验
        quickForm.disable = true; // 禁用提交按钮

        await useDataHandle({
          loading: "正在创建软链接...",
          request: getCreateLink(params),
          message: true,
          success: (res: any) => {
            if (res.status) {
              refreshFilesList();
              close();
            }
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        quickForm.disable = false;
      }
    };

    const $reset = () => {
      Object.assign(quickForm, {
        path: "",
        filename: "",
        disable: false,
      });
    };

    return {
      quickFormRef,
      quickForm,
      quickRules,
      openFile,
      onConfirm,
      $reset,
    };
  }
);

export default FILES_CREATE_SYMBOLIC_LINK_STORE;

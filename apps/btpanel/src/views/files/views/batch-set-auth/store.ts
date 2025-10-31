import { defineStore, storeToRefs } from "pinia";
import FILES_STORE from "@files/store";
import { getFileAuth, fileBatchCopy } from "@api/files";
import { Message, useDataHandle } from "@hooks/tools";

const FILES_BATCH_SET_AUTH_STORE = defineStore(
  "FILES-BATCH-SET-AUTH-STORE",
  () => {
    const filesStore = FILES_STORE();
    const { fileTabActiveData } = storeToRefs(filesStore);
    const { refreshFilesList } = filesStore;

    const fileList = ref<any>([]); // 文件信息

    // 所有者选项
    const ownerOptions = [
      { label: "root", value: "root" },
      { label: "www", value: "www" },
      { label: "mysql", value: "mysql" },
    ];

    // 权限列表
    const checkList = reactive({
      owner: [] as string[],
      group: [] as string[],
      public: [] as string[],
      auth: 0 as number | string,
      user: "root",
      isDir: true,
      checkNumber: "",
    });

    // 获取文件权限
    const getFileAuths = async () => {
      await useDataHandle({
        request: getFileAuth({
          filename: `${fileTabActiveData.value.param.path}`,
        }),
        success: (res: any) => {
          if (res.status) {
            const auth = res.data;
            checkList.auth = auth.chmod;
            checkList.user = auth.chown;
            parsePermission(Number(auth.chmod));
          } else {
            Message.error(res.msg);
          }
        },
      });
    };

    /**
     * @description 判断权限
     * @param val 权限值
     */
    const parsePermission = (permissionValue: number): void => {
      permissionValue = parseInt(permissionValue.toString(), 8);
      if (permissionValue & 0o400) {
        checkList.owner.push("r");
      } else {
        checkList.owner = checkList.owner.filter((item) => item !== "r");
      }
      if (permissionValue & 0o200) {
        checkList.owner.push("w");
      } else {
        checkList.owner = checkList.owner.filter((item) => item !== "w");
      }
      if (permissionValue & 0o100) {
        checkList.owner.push("x");
      } else {
        checkList.owner = checkList.owner.filter((item) => item !== "x");
      }
      if (permissionValue & 0o040) {
        checkList.group.push("r");
      } else {
        checkList.group = checkList.group.filter((item) => item !== "r");
      }
      if (permissionValue & 0o020) {
        checkList.group.push("w");
      } else {
        checkList.group = checkList.group.filter((item) => item !== "w");
      }
      if (permissionValue & 0o010) {
        checkList.group.push("x");
      } else {
        checkList.group = checkList.group.filter((item) => item !== "x");
      }
      if (permissionValue & 0o004) {
        checkList.public.push("r");
      } else {
        checkList.public = checkList.public.filter((item) => item !== "r");
      }
      if (permissionValue & 0o002) {
        checkList.public.push("w");
      } else {
        checkList.public = checkList.public.filter((item) => item !== "w");
      }
      if (permissionValue & 0o001) {
        checkList.public.push("x");
      } else {
        checkList.public = checkList.public.filter((item) => item !== "x");
      }
      // 去重
      checkList.owner = Array.from(new Set(checkList.owner));
      checkList.group = Array.from(new Set(checkList.group));
      checkList.public = Array.from(new Set(checkList.public));
    };

    // 权限选项
    const reversePermission = (): void => {
      let permissionValue = 0;
      let auth: any = 0;
      // Helper function to set permission based on array values
      const setPermission = (
        array: string[],
        readBit: number,
        writeBit: number,
        executeBit: number
      ) => {
        if (array.includes(`r`)) {
          permissionValue |= readBit;
        }
        if (array.includes(`w`)) {
          permissionValue |= writeBit;
        }
        if (array.includes(`x`)) {
          permissionValue |= executeBit;
        }
      };

      // Set owner permissions
      setPermission(checkList.owner, 0o400, 0o200, 0o100);

      // Set group permissions
      setPermission(checkList.group, 0o040, 0o020, 0o010);

      // Set public permissions
      setPermission(checkList.public, 0o004, 0o002, 0o001);

      checkList.auth = permissionValue.toString(8);
      while (checkList.auth.length < 3) {
        checkList.auth = "0" + checkList.auth;
      }
    };

    //去除非数字输入
    const checkNumber = (val: any) => {
      checkList.checkNumber = val;
      const reVal = String(val).replace(/[^\d]/g, "").slice(0, 3);
      checkList.auth = reVal;

      parsePermission(Number(checkList.auth));
    };

    /**
     * @description 用户改变
     * @param {string} val 用户名
     */
    const changeUser = (val: string) => {
      checkList.user = val;
    };

    // 设置文件权限
    const setFileAuths = async (close?: any) => {
      let auth = checkList.auth.toString();
      // 验证权限输入
      if (auth.length > 3) {
        Message.error("请输入正确权限");
        return;
      }
      // 判断是否有非数字
      if (checkList.checkNumber.match(/\D/g)) {
        Message.error("请输入正确权限");
        return;
      }

      // 如果包含了非数字就提示
      if (auth.match(/\D/g)) {
        Message.error("请输入正确权限");
        return;
      }

      // 如果不够3位数就在前面补0
      while (auth.length < 3) {
        auth = "0" + auth;
      }
      await useDataHandle({
        loading: "正在设置文件权限，请稍后...",
        request: fileBatchCopy({
          user: checkList.user,
          access: auth,
          all: checkList.isDir ? "True" : "False",
          type: "3",
          path: fileTabActiveData.value.param.path,
          data: JSON.stringify(fileList.value),
        }),
        message: true,
        success: (res: any) => {
          if (res.status) {
            refreshFilesList();
            close && close();
          }
        },
      });
    };

    const $reset = () => {
      Object.assign(checkList, {
        owner: [] as string[],
        group: [] as string[],
        public: [] as string[],
        auth: 0 as number | string,
        user: "root",
        isDir: true,
        checkNumber: "",
      });
      fileList.value = [];
    };

    return {
      checkList,
      fileList,
      ownerOptions,
      reversePermission,
      checkNumber,
      changeUser,
      setFileAuths,
      getFileAuths,
      $reset,
    };
  }
);

export default FILES_BATCH_SET_AUTH_STORE;

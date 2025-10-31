<template>
  <!-- 添加目录 -->
  <div>
    <el-form
      :disabled="formDisabled"
      ref="addDir"
      :rules="rules"
      :model="ruleForm"
      class="p-[2rem] addDirFrom overflow-auto max-h-[60rem]"
      label-width="5rem"
    >
      <el-form-item label="目录" prop="dirs">
        <bt-input
          type="textarea"
          v-model="ruleForm.dirs"
          width="30rem"
          class="resize-none"
          :autosize="{ minRows: 5, maxRows: 5 }"
          :placeholder="'如需填写多个目录请换行填写\n例：/www/aaa /www/bbb'"
          clearable
        ></bt-input>
      </el-form-item>
      <el-form-item>
        <div class="ml-[10rem]">
          <bt-btn-group :options="tableBtnGroup" />
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { addMonitorDir } from "@/api/firewall";
import { fileSelectionDialog } from "@/public/index";
import { getFirewallStore } from "@firewall/useStore";
import { useDialog } from "@hooks/tools";
import { useDataHandle } from "@hooks/tools";

// 全局
const {
  refs: { isRefreshSpywares },
} = getFirewallStore();

const popupClose = inject<any>("popupClose"); // 关闭弹窗

// 表单数据
const ruleForm = reactive<any>({
  dirs: "",
});

const addDir = ref<any>(); // 表单ref
const formDisabled = ref(false); // 表单禁用

// 校验规则
const rules = {
  dirs: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value.length > 0) {
          callback();
        } else {
          return callback(new Error("请输入目录"));
        }
      },
      trigger: ["blur", "change"],
    },
  ],
};

// 表格左上方按钮组
const tableBtnGroup = [
  {
    content: "添加指定目录",
    event: () => {
      fileSelectionDialog({
        type: "dir",
        change(path: any) {
          if (ruleForm.dirs == "") {
            ruleForm.dirs = path;
            return;
          }
          ruleForm.dirs = ruleForm.dirs + "\n" + path;
        },
      });
    },
  },
  {
    content: "添加网站目录",
    event: () => {
      return useDialog({
        title: "添加网站目录",
        area: 50,
        component: () => import("./add-website-dir.vue"),
        compData: ruleForm,
        showFooter: true,
      });
    },
  },
];

/**
 * @description: 提交表单
 */
const submitFrom = async (close: Function) => {
  await addDir.value.validate();
  useDataHandle({
    request: addMonitorDir({
      data: JSON.stringify({
        dirs: ruleForm.dirs.split("\n"),
      }),
    }),
    loading: formDisabled,
    success: () => {
      popupClose();
      isRefreshSpywares.value = true;
    },
  });
};

onMounted(() => {});

// provide('dir', ruleForm)

defineExpose({ onConfirm: submitFrom });
</script>
<style lang="sass"></style>

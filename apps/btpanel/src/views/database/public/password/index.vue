<template>
  <el-form
    ref="setDatabasePwdRef"
    :rules="rules"
    :model="pwdForm"
    class="p-[2rem] flex flex-col justify-center"
    label-width="auto"
  >
    <el-form-item label="用户名" prop="name">
      <bt-input
        width="32rem"
        disabled
        v-model="pwdForm.username"
        :textType="false"
      ></bt-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <bt-input-icon
        icon="el-refresh"
        v-model="pwdForm.password"
        @icon-click="() => (pwdForm.password = getRandomPwd(16))"
        width="32rem"
        name="password"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { setPassword, setsModulesPassword } from '@api/database';
import { getDatabaseStore } from '@database/useStore';
import { useDataHandle } from '@hooks/tools';

import { inputFocus } from '@utils/index';
import { getRandomPwd } from '@utils/index';

interface Props {
  compData?: {
    username: string;
    password: string;
    id: number;
    name: string;
  };
}

const {
  refs: { tabActive },
  refreshTableList,
} = getDatabaseStore();

const props = withDefaults(defineProps<Props>(), {
  compData: () => ({
    username: '',
    password: '',
    id: 0,
    name: '',
  }),
});
const { username, password, id } = props.compData; // 用户名 密码 id

const setDatabasePwdRef = ref(); // 表单实例

const pwdForm = reactive({
  id: id,
  password: password,
  username: username,
}); // 密码 用户名等相关信息

const rules = {
  password: [{ trigger: ['blur'], required: true, message: '请输入密码' }],
}; // 校验规则

/**
 * @description 提交修改密码
 * @param close 关闭弹窗
 */
const onConfirm = async (close: AnyFunction) => {
  await setDatabasePwdRef.value.validate();

  const { id, username: name, password } = pwdForm;
  const params = { id, name, password };

  await useDataHandle({
    loading: '正在提交中，请稍后...',
    request:
      tabActive.value === 'mysql'
        ? setPassword({
            ...params,
            data_name: props.compData.name,
          })
        : setsModulesPassword(
            { data: JSON.stringify(params) },
            tabActive.value
          ),
    message: true,
  });
  close();
  refreshTableList();
};

onMounted(() => {
  inputFocus(setDatabasePwdRef.value.$el, 'password'); // 聚焦密码输入框
});

defineExpose({ onConfirm });
</script>

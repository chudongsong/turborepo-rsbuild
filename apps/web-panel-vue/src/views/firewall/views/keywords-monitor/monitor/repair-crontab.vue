<template>
  <!-- 修复计划任务 -->
  <el-form
    ref="repairCronRef"
    :model="ruleForm"
    :rules="rules"
    class="p-[2rem] addfrom"
    label-width="5rem"
  >
    <el-form-item label="检测频率" prop="type">
      <div class="flex">
        <bt-select
          class="!w-[8rem] mr-4"
          v-model="ruleForm.type"
          :options="typeOptions"
          :change="typeChange"
        ></bt-select>
        <bt-select
          class="!w-[8rem] mr-4"
          v-if="ruleForm.type === 'week' ? true : false"
          v-model="ruleForm.week"
          :options="weekOptions"
        ></bt-select>
        <bt-input
          type="number"
          class="mr-4"
          width="12rem"
          min="0"
          max="31"
          v-if="
            ruleForm.type === 'day-n' || ruleForm.type === 'month'
              ? true
              : false
          "
          v-model="ruleForm.where1"
        >
          <template #append>
            {{ ruleForm.type === 'day-n' ? '天' : '日' }}
          </template>
        </bt-input>
        <bt-input
          type="number"
          width="12rem"
          class="mr-4"
          min="0"
          max="23"
          v-model="ruleForm.hour"
        >
          <template #append>小时</template>
        </bt-input>
        <bt-input
          type="number"
          width="12rem"
          min="0"
          max="59"
          v-model="ruleForm.minute"
        >
          <template #append>分</template>
        </bt-input>
      </div>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { repairCron } from '@/api/firewall';
import { Message } from '@/hooks/tools';
import { inject } from 'vue';

interface Props {
  compData: any;
}
const props = withDefaults(defineProps<Props>(), {
  compData: () => {},
});

const repairCronRef = ref<any>(null); // 表单ref

// 表单数据
const ruleForm = ref<any>({
  type: 'day',
  week: 1,
  where1: 1,
  hour: 1,
  minute: 19,
});

const typeOptions = shallowRef<any>([
  { label: '每天', value: 'day' },
  { label: 'N天', value: 'day-n' },
  { label: '每星期', value: 'week' },
  { label: '每月', value: 'month' },
]);

const weekOptions = shallowRef<any>([
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
]);

watch(
  () => props.compData,
  val => {
    typeChange('day');
  }
);

// 校验规则
const rules = {
  type: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value === 'day-n' || value === 'month') {
          if (ruleForm.value.where1 < 0 || ruleForm.value.where1 > 31) {
            return callback(new Error('请输入正确天数范围[0-31]'));
          }
        }
        if (ruleForm.value.hour < 0 || ruleForm.value.hour > 23) {
          return callback(new Error('请输入正确小时范围[0-23]'));
        }
        if (ruleForm.value.minute < 0 || ruleForm.value.minute > 59) {
          return callback(new Error('请输入正确分钟范围[0-59]'));
        }
        callback();
      },
      trigger: ['blur', 'change'],
    },
  ],
};

/**
 * @description: 检测频率改变
 */
const typeChange = (val: string) => {
  ruleForm.value.type = val;
  let hour = Math.round(Math.random() * 5);
  let minute = Math.round(Math.random() * 59);
  ruleForm.value.hour = hour;
  ruleForm.value.minute = minute;
  if (val === 'day-n') {
    ruleForm.value.where1 = 3;
  } else if (val === 'week') {
    ruleForm.value.week = 1;
  } else {
    ruleForm.value.where1 = 3;
  }
};

// 父组件页面更新方法

/**
 * @description: 点击取消/刷新表单
 */
const onCancel = () => {
  repairCronRef.value.resetFields();
  props.compData.refreshEvent();
};

/**
 * @description: 提交表单
 */
const submitFrom = async (close: Function) => {
  await repairCronRef.value.validate();
  let loading = Message.load('正在处理中，请稍后...');
  try {
    var params = reactive<any>({
      id: props.compData.id,
      type: ruleForm.value.type,
      hour: ruleForm.value.hour,
      minute: ruleForm.value.minute,
    });
    if (ruleForm.value.type === 'day-n' || ruleForm.value.type === 'month') {
      params['where1'] = ruleForm.value.where1;
    }
    if (ruleForm.value.type === 'week') {
      params['week'] = ruleForm.value.week;
    }
    const rdata = await repairCron({ data: JSON.stringify(params) });
    Message.request(rdata);
    onCancel();
    close();
  } catch (error) {
    console.log(error);
  } finally {
    loading.close();
  }
};

// 页面加载完成
onMounted(() => {});

defineExpose({ onConfirm: submitFrom, onCancel: onCancel });
</script>

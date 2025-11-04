<template>
  <div class="relative">
    <el-tooltip
      v-model:visible="isShow"
      class="item"
      effect="dark"
      :content="placeholderTips"
      :offset="offset"
      placement="top-start"
    >
      <span class="w-[100px] absolute"></span>
    </el-tooltip>
    <el-input
      ref="input"
      v-model="modelValue"
      :class="customClass"
      :placeholder="placeholderTips"
      v-bind="$attrs"
      @focus="inputFocus"
      @blur="inputBlur"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholderTips: string;
  offset?: number;
  modelValue: string;
  customClass: string;
}

withDefaults(defineProps<Props>(), {
  placeholderTips: '',
  offset: 0,
  modelValue: '',
  customClass: '!w-[200px]',
});

const isShow = ref(false); // 是否显示
const isDisabled = ref(true); // 是否禁用
const modelValue = defineModel({ default: '', type: String || Number }); // 双向绑定

// 文本框聚焦
const inputFocus = () => {
  if (modelValue.value === '') {
    isDisabled.value = false;
    isShow.value = true;
  }
};

// 文本框失焦
const inputBlur = () => {
  isShow.value = false;
  isDisabled.value = true;
};
</script>

<style scoped></style>

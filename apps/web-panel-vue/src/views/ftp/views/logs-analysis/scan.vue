<template>
  <div class="p-[2rem] leading-[4rem]">
    <el-form
      ref="setScanInfo"
      :model="ruleForm"
      class="btCustomForm p-0"
      :rules="rules"
    >
      <el-form-item prop="login_error">
        <div class="form-line">
          5分钟内多次登录失败超过
          <bt-input
            width="14rem"
            class="error-w mx-[0.6rem] !w-[14rem]"
            type="number"
            v-model="ruleForm.config.login_error"
          />
          次，触发
        </div>
      </el-form-item>
      <el-form-item>
        <div class="form-line">
          <span class="w-[9rem]">登录地区不为</span>
          <el-select
            class="mx-[0.6rem] !w-[26rem]"
            multiple
            collapse-tags
            filterable
            v-model="ruleForm.config.area.country"
          >
            <el-option
              v-for="item in areaOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="w-[6rem]">，触发</span>
        </div>
      </el-form-item>
      <el-form-item prop="se_time">
        <div class="form-line">
          <span class="!w-[9rem]">登录时间不为</span>
          <el-time-select
            class="no-icon mx-[0.6rem] !w-[12rem]"
            is-range
            v-model="ruleForm.config.start_time"
            :picker-options="{
              start: '00:00',
              step: '01:00',
              end: '23:00',
            }"
            clearable
            placeholder="请选择开始时间"
            @change="startChange"
          ></el-time-select>
          -
          <el-time-select
            class="no-icon mx-[0.6rem] !w-[12rem]"
            is-range
            v-model="ruleForm.config.end_time"
            :picker-options="{
              start: ruleForm.config.start_time,
              step: '01:00',
              end: '23:00',
            }"
            clearable
            placeholder="请选择结束时间"
            @change="endChange"
          ></el-time-select>
          ，触发
        </div>
      </el-form-item>
      <el-form-item prop="upload_shell_br">
        <div class="form-line top">
          上传脚本包含
          <bt-input
            class="!inline-block mx-[0.6rem] textarea-w !w-[32rem]"
            type="textarea"
            :rows="6"
            v-model="ruleForm.config.upload_shell_br"
            placeholder="一行一个"
          ></bt-input>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { endChange, initScan, onScan, rules, startChange } from './useMethod'
import { useFtpAnalysisStore } from './useStore'

const { ruleForm, setScanInfo, areaOptions } = useFtpAnalysisStore()

onMounted(initScan)

defineExpose({ onConfirm: onScan })
</script>

<style lang="css" scoped>
.form-line {
	display: flex;
	align-items: center;
	width: 100% !important;
	@apply flex items-center w-full;
}

.form-line.top {
	align-items: flex-start;
	@apply items-start;
}
</style>

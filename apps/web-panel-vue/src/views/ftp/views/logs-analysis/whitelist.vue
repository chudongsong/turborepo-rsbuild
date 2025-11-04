<template>
  <div class="px-[2rem] py-[2.4rem]">
    <div class="flex mb-[1rem]">
      <el-input
        class="mr-[1rem] !w-[30rem]"
        placeholder="请输入ip地址"
        v-model="ip"
      ></el-input>
      <el-button @click="addIpEvent()" type="primary">添加白名单</el-button>
    </div>

    <bt-table
      ref="ftpScanTable"
      :max-height="340"
      :column="whiteColumn"
      :data="whiteTableData"
      :description="'白名单列表为空'"
    />
  </div>
</template>

<script lang="tsx" setup>
import { addIpEvent, getWhiteListData, whiteColumn } from './useMethod'
import { useFtpAnalysisStore } from './useStore'

const { whiteTableData, ip } = useFtpAnalysisStore()

onMounted(getWhiteListData)
</script>



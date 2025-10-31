<template>
  <div>
    <bt-tabs
      type="card"
      v-model="tabActive"
      :options="tabComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { initLogs, tabActive, tabComponent } from './useController';


onMounted(initLogs);
</script>

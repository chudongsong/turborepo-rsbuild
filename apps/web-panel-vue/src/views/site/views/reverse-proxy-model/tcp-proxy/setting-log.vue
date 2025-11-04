<template>
    <div>
      <BtLog :content="logContent" :is-html="true" style="height: 55rem;width: 100%;" />
    </div>
  </template>
  
  <script setup lang="ts">
  import BtLog from '@/components/extension/bt-log/index.vue'
  import { logContent } from './useController'
  </script>
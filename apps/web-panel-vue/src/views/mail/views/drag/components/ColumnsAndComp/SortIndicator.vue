<template>
  <!-- 排序指示器 -->
  <div :class="['sort-sign']" v-if="indicatorIndex == currentIndex && sortIndicator == 'top'"></div>
  <slot></slot>
  <!-- 排序指示器 -->
  <div :class="['sort-sign']" v-if="indicatorIndex == currentIndex && sortIndicator == 'bottom'"></div>
</template>

<script setup lang="ts">
import type { DropTargetMonitor } from "vue3-dnd"
const props = defineProps<{
  currentIndex: number,
  indicatorIndex: number,
  dropRef: Ref
}>()

const sortIndicator = ref("")

// 计算指示器展示的位置
function indicatorClac(monitor: DropTargetMonitor) {
  // 拖动源偏移的rect
  const dragRect = monitor.getSourceClientOffset()
  // 拖动源的实时位置
  const dragCurrentY = dragRect!.y
  // 放置源的rect
  const dropRect = props.dropRef.value?.getBoundingClientRect()
  // 放置源中线位置
  const dropRectMiddle = dropRect.top + (dropRect.bottom - dropRect.top) / 2
  // 当拖动源top位于中线上方，则指示器在放置源上方
  if (dragCurrentY < dropRectMiddle) {
    sortIndicator.value = "top"
  }
  // 当拖动源top位于中线下方，则指示器在放置源下方
  if (dragCurrentY > dropRectMiddle) {
    sortIndicator.value = "bottom"
  }
}
</script>

<style scoped></style>
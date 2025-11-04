<template>
	<div class="p-[2rem]">
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item label="站点分类" prop="class">
        <bt-select class="!w-[26rem]" v-model="form.class" :options="classList"></bt-select>
      </el-form-item>
    </el-form>
	</div>
</template>

<script setup lang="ts">
import { setSiteTypes } from '@api/site'
import { useSiteStore } from '@site/useStore'
import { openResultDialog } from '../../useController'
import { useMessage, useDataHandle } from '@/hooks/tools'
import { defaultVerify } from '@/utils';

interface Props {
	compData: {
		rowList: any[]
		type: string,
    refresh: AnyFunction
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		return {
      type: 'php',
			rowList: [],
      refresh: () => {}
		}
	},
})

const { isRefreshList } = useSiteStore()

const Message = useMessage() // 消息提示

const { type, rowList, refresh } = props.compData

const classList = ref<any>([])
const formRef = ref<any>()
const form = reactive({
  class: ''
})
const rules = {
  class: [defaultVerify({message: '请选择站点分类'})]
}


const onConfirm = async (close: any) => {

  const params = {
    site_ids: JSON.stringify(rowList.map(item => item.id)),
    [type === 'php' ? 'id' : 'type_id']: form.class
  }

  const res: AnyObject = await useDataHandle({
    loading: '正在设置分类，请稍后...',
    request: setSiteTypes(params, type),
  })
  openResultDialog({
    resultData: rowList.map(item => ({name: item.name, status: res.status})),
    resultTitle: '设置分类结果'
  })
  close()
  isRefreshList.value = true
}

const getSiteTypeList = async () => {
  refresh((res: any) => {
    classList.value = res.filter((item: any) => item.value !== '' && item.value !== 0 && item.value > 0)
    if (classList.value.length) form.class = classList.value[0].value
  })
}

defineExpose({
	onConfirm,
})

onMounted(() => {
	getSiteTypeList()
})
</script>


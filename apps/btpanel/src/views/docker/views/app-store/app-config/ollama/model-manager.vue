<script lang="tsx">
import { useAllTable } from '@/hooks/tools'
import { tableConfig,unmountedHandle } from './useController'

import BtTableGroup from '@/components/extension/bt-table-group';

export default {
	name: 'ollama',
	props:['compData'],
	setup(props) {

		const provideFn = ref()// 表格方法容器

		// 表格组件
		const { BtTable, BtPage,BtSearch,BtRefresh,refresh,param } = useAllTable(tableConfig(provideFn))

		provideFn.value = {refresh,serviceName:props.compData.service_name,param}// 同步表格刷新



		onUnmounted(()=>{
			unmountedHandle()
		})

		return ()=>(
			<div class="relative">
				<BtTableGroup>
					{{
						'header-left':()=>{
							return (
								<div class="flex items-center">
									<BtSearch class="!w-[47rem]" placeholder="请输入模型名称/描述" />
								</div>
							)
						},
						'header-right':()=>{
							return (
								<BtRefresh />
							)
						},
						content:()=>{
							return (
								<div>
									<BtTable key="ollamaTable" max-height={410} class="!min-h-[350px]" />
								</div>
							)
						},
						'footer-right':()=>{
							return (
								<BtPage />
							)
						},
					}}
				</BtTableGroup>
			</div>
		)
	},
}
</script>
<style lang="scss" scoped>
:deep(.el-table__inner-wrapper){
	min-height: 350px;
}
</style>
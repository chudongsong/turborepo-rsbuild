<script lang="tsx">
import { useAllTable } from '@/hooks/tools'
// import { gpuInfoData } from './useController'

import BtTableGroup from '@/components/extension/bt-table-group';

export default {
	name: 'ProcessInfo',
	props:['compData'],
	setup(props) {
		const { BtTable,refresh } = useAllTable({
				request: async (params:any) => {
					// const res = await getGpuSystemInfo()
					// return res ||{
					// 	data: [],
					// 	total: 0,
					// }
					return {
						data: props.compData.value.tableList,
						total: props.compData.value.tableList.length,
					}
				},
				columns: [
						{
							label: `GPU`,
							prop: 'gpu',
						},
						{
							label: `PID`,
							prop: 'pid',
						},
						{
							label: `TYPE`,
							prop: 'type',
						},
						{
							label: `进程名称`,
							prop: 'name',
						},
						{
							label: `显存占用`,
							prop: 'memory',
						},
					]
			})
let timer:any = null
			onMounted(()=>{
				timer = setInterval(()=>{
					refresh()
				},2000)
			})
			onUnmounted(()=>{
				clearInterval(timer)
			})
		return () => (
			<div>
				<BtTableGroup>
					{{
						'content':()=>{
							return (
								<BtTable max-height={500} />
							)
						}
					}}
				</BtTableGroup>
			</div>
		);
	},
};
</script>

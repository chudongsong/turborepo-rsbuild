<template>
	<div class="h-full">
		<div v-if="!run" class="bg-darkTertiary flex items-center justify-center h-full min-h-[60rem]">
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">请开启 <bt-link class="mx-4px" @click="jumpTabEvent('state')">项目状态</bt-link> 后查看性能信息</div>
		</div>
		<div v-else-if="!jmx_status" class="bg-darkTertiary flex items-center justify-center h-full min-h-[60rem]">
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">请开启 <bt-link class="mx-4px" @click="jumpTabEvent('project')">jmx监控</bt-link> 后查看性能信息</div>
		</div>
		<bt-tabs v-else-if="!jxmMsg" v-model="tabActive" type="card" v-bt-loading="loading">
			<el-tab-pane name="system" label="系统情况" class="overflow-auto max-h-[62rem]">
				<div id="tab_table" class="divtable jvm_table">
					<table class="table table-hover table-bordered !mb-2rem">
						<thead>
							<th colspan="2" style="text-align: center">系统使用情况</th>
						</thead>
						<tbody>
							<tr>
								<td>当前打开的文件描述符数量</td>
								<td>{{ system.OpenFileDescriptorCount }}</td>
							</tr>
							<tr>
								<td>最大文件描述符数量</td>
								<td>{{ system.MaxFileDescriptorCount }}</td>
							</tr>
							<tr>
								<td>进程CPU时间</td>
								<td>{{ system.ProcessCpuTime }}</td>
							</tr>
							<tr>
								<td>可用的物理内存大小</td>
								<td>{{ system.FreePhysicalMemorySize }}</td>
							</tr>
							<tr>
								<td>总物理内存大小</td>
								<td>{{ system.TotalPhysicalMemorySize }}</td>
							</tr>
							<tr>
								<td>系统 CPU 负载(CPU 使用率)</td>
								<td>{{ system.SystemCpuLoad }}</td>
							</tr>
							<tr>
								<td>进程 CPU 负载</td>
								<td>{{ system.ProcessCpuLoad }}</td>
							</tr>
							<tr>
								<td>系统负载平均值</td>
								<td>{{ system.SystemLoadAverage }}</td>
							</tr>
						</tbody>
					</table>
					<table class="table table-hover table-bordered !mb-2rem">
						<thead>
							<th colspan="2" style="text-align: center">运行信息</th>
						</thead>
						<tbody>
							<tr>
								<td>JVM 实例的启动时间</td>
								<td>{{ runtime.StartTime }}</td>
							</tr>
							<tr>
								<td>是否支持引导类路径</td>
								<td>{{ runtime.BootClassPathSupported }}</td>
							</tr>
							<tr>
								<td>JVM 运行时间</td>
								<td>{{ runtime.Uptime }}</td>
							</tr>
							<tr>
								<td>系统属性</td>
								<td>{{ runtime.SystemProperties }}</td>
							</tr>
							<tr>
								<td>JVM 实例的名称</td>
								<td>{{ runtime.Name }}</td>
							</tr>
							<tr>
								<td>JVM 类路径</td>
								<td>{{ runtime.ClassPath }}</td>
							</tr>
						</tbody>
					</table>
					<table class="table table-hover table-bordered">
						<thead>
							<th colspan="2" style="text-align: center">线程信息</th>
						</thead>
						<tbody>
							<tr>
								<td>峰值线程数</td>
								<td>{{ thread.PeakThreadCount }}</td>
							</tr>
							<tr>
								<td>守护线程数</td>
								<td>{{ thread.DaemonThreadCount }}</td>
							</tr>
							<tr>
								<td>线程数</td>
								<td>{{ thread.ThreadCount }}</td>
							</tr>
							<tr>
								<td>启动的线程总数</td>
								<td>{{ thread.TotalStartedThreadCount }}</td>
							</tr>
							<tr>
								<td>当前线程的 CPU 时间</td>
								<td>{{ thread.CurrentThreadCpuTime }}</td>
							</tr>
							<tr>
								<td>当前线程的用户时间</td>
								<td>{{ thread.CurrentThreadUserTime }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</el-tab-pane>
			<el-tab-pane name="mem" label="内存情况" class="overflow-auto max-h-[62rem]">
				<div id="tab_table2" class="divtable">
					<table class="table table-hover table-bordered !mb-2rem">
						<thead>
							<th colspan="3" style="text-align: center">（内存）使用情况的信息</th>
						</thead>
						<tbody>
							<tr>
								<td rowspan="3">堆内存使用情况</td>
								<td>最大可用的堆内存大小</td>
								<td>{{ unmemory.HeapMemoryUsage?.max }}</td>
							</tr>
							<tr>
								<td>已使用内存</td>
								<td>{{ unmemory.HeapMemoryUsage?.used }}</td>
							</tr>
							<tr>
								<td>初始内存</td>
								<td>{{ unmemory.HeapMemoryUsage?.init }}</td>
							</tr>
							<tr>
								<td colspan="2">当前处于 finalization 队列中等待 finalization 的对象数量</td>
								<td>{{ unmemory.ObjectPendingFinalizationCount }}</td>
							</tr>
							<tr>
								<td colspan="2">是否启用详细模式</td>
								<td>{{ unmemory.Verbose }}</td>
							</tr>
							<tr>
								<td rowspan="2">非堆内存使用情况</td>
								<td>最大可用的堆内存大小</td>
								<td>{{ unmemory.NonHeapMemoryUsage?.max }}</td>
							</tr>
							<tr>
								<td>已使用内存</td>
								<td>{{ unmemory.NonHeapMemoryUsage?.used }}</td>
							</tr>
						</tbody>

						<tbody></tbody>
					</table>

					<table v-for="(item, index) in memoryPool" :key="index" class="table table-hover table-bordered !mb-2rem">
						<thead>
							<th colspan="3" style="text-align: center">{{ item.name }}</th>
						</thead>
						<tbody>
							<tr>
								<td colspan="2">内存管理器名称列表</td>
								<td>{{ item.MemoryManagerNames }}</td>
							</tr>
							<tr>
								<td colspan="2">使用阈值</td>
								<td>{{ item.UsageThreshold }}</td>
							</tr>
							<tr>
								<td colspan="2">是否超过使用阈值</td>
								<td>{{ item.UsageThresholdExceeded }}</td>
							</tr>
							<tr>
								<td colspan="2">超过使用阈值��次数</td>
								<td>{{ item.UsageThresholdCount }}</td>
							</tr>
							<tr>
								<td colspan="2">是否支持使用阈值</td>
								<td>{{ item.UsageThresholdSupported }}</td>
							</tr>
							<tr>
								<td colspan="2">收集使用阈值</td>
								<td>{{ item.CollectionUsageThreshold }}</td>
							</tr>
							<tr>
								<td colspan="2">是否超过收集使用阈值</td>
								<td>{{ item.CollectionUsageThresholdExceeded }}</td>
							</tr>
							<tr>
								<td colspan="2">超过收集使用阈值的次数</td>
								<td>{{ item.CollectionUsageThresholdCount }}</td>
							</tr>
							<tr>
								<td colspan="2">MemoryPool是否有效</td>
								<td>{{ item.CollectionUsageThresholdSupported }}</td>
							</tr>
							<tr>
								<td colspan="2">是否支持收集使用阈值</td>
								<td>{{ item.Valid }}</td>
							</tr>
							<tr>
								<td colspan="2">名称</td>
								<td>{{ item.Name }}</td>
							</tr>
							<tr>
								<td colspan="2">内存池类型</td>
								<td>{{ item.Type }}</td>
							</tr>
							<tr>
								<td colspan="2">ObjectName</td>
								<td>
									<span style="width: 200px">{{ item.ObjectName }}</span>
								</td>
							</tr>
							<tr>
								<td width="120" rowspan="3">使用情况</td>
								<td>最大可用内存</td>
								<td>{{ item.Usage?.max }}</td>
							</tr>
							<tr>
								<td>已使用内存</td>
								<td>{{ item.Usage?.used }}</td>
							</tr>
							<tr>
								<td>初始内存大小</td>
								<td>{{ item.Usage?.init }}</td>
							</tr>
							<tr>
								<td width="120" rowspan="3">PeakUsage</td>
								<td>最大可用内存</td>
								<td>{{ item.PeakUsage?.max }}</td>
							</tr>
							<tr>
								<td>已使用内存</td>
								<td>{{ item.PeakUsage?.used }}</td>
							</tr>
							<tr>
								<td>初始内存大小</td>
								<td>{{ item.PeakUsage?.init }}</td>
							</tr>
							<template v-if="item.CollectionUsage !== '无'">
								<tr>
									<td width="120" rowspan="3">CollectionUsage</td>
									<td>最大可用内存</td>
									<td>{{ item.CollectionUsage.max }}</td>
								</tr>
								<tr>
									<td>已使用内存</td>
									<td>{{ item.CollectionUsage.used }}</td>
								</tr>
								<tr>
									<td>初始内存大小</td>
									<td>{{ item.CollectionUsage.init }}</td>
								</tr>
							</template>
						</tbody>
						<tbody></tbody>
					</table>
				</div>
			</el-tab-pane>
			<el-tab-pane name="recycle" label="垃圾回收">
				<div id="tab_table3" class="divtable">
					<table class="table table-hover table-bordered w-full">
						<thead>
							<th colspan="5" style="text-align: center">垃圾回收处理信息</th>
						</thead>
						<tbody>
							<template v-for="(item, index) in garbageCollector">
								<template v-if="item.LastGcInfo !== '无'">
									<tr :key="index">
										<td rowspan="9" width="145">{{ item.name }}</td>
										<td rowspan="5">最近的垃圾回收信息</td>
										<td>垃圾回收线程数</td>
										<td>{{ item.LastGcInfo.GcThreadCount }}</td>
									</tr>
									<tr>
										<td>回收持续时间</td>
										<td>{{ item.LastGcInfo.duration }}</td>
									</tr>
									<tr>
										<td>结束时间</td>
										<td>{{ item.LastGcInfo.endTime }}</td>
									</tr>
									<tr>
										<td>开始时间</td>
										<td>{{ item.LastGcInfo.startTime }}</td>
									</tr>
									<tr>
										<td>数据库id</td>
										<td>{{ item.LastGcInfo.id }}</td>
									</tr>
									<tr>
										<td colspan="2">回收次数</td>
										<td>{{ item.CollectionCount }}</td>
									</tr>
									<tr>
										<td colspan="2">回收时间</td>
										<td>{{ item.CollectionTime }}</td>
									</tr>
									<tr>
										<td colspan="2">是否有效</td>
										<td>{{ item.Valid }}</td>
									</tr>
									<tr>
										<td colspan="2">垃圾收集器名称</td>
										<td>{{ item.Name }}</td>
									</tr>
								</template>
								<template v-else>
									<tr>
										<td rowspan="5" width="145">{{ item.name }}</td>
										<td colspan="2">最近的垃圾回收信息</td>
										<td>{{ item.LastGcInfo }}</td>
									</tr>
									<tr>
										<td colspan="2">回收次数</td>
										<td>{{ item.CollectionCount }}</td>
									</tr>
									<tr>
										<td colspan="2">回收时间</td>
										<td>{{ item.CollectionTime }}</td>
									</tr>
									<tr>
										<td colspan="2">是否有效</td>
										<td>{{ item.Valid }}</td>
									</tr>
									<tr>
										<td colspan="2">垃圾收集器名称</td>
										<td>{{ item.Name }}</td>
									</tr>
								</template>
							</template>
						</tbody>
					</table>
				</div>
			</el-tab-pane>
			<el-tab-pane name="other" label="其他" class="overflow-auto max-h-[62rem]">
				<div id="tab_table4" class="divtable">
					<table class="table table-hover table-bordered">
						<thead>
							<th colspan="2" style="text-align: center">类加载器信息</th>
						</thead>
						<tbody>
							<tr>
								<td>总加载类数</td>
								<td>{{ classical.TotalLoadedClassCount }}</td>
							</tr>
							<tr>
								<td>当前加载的类数</td>
								<td>{{ classical.LoadedClassCount }}</td>
							</tr>
							<tr>
								<td>已卸载的类数</td>
								<td>{{ classical.UnloadedClassCount }}</td>
							</tr>
							<tr>
								<td>是否启用了类加载的详细输出</td>
								<td>{{ classical.Verbose }}</td>
							</tr>
						</tbody>
					</table>

					<table class="table table-hover table-bordered mt-2rem">
						<thead>
							<th colspan="2" style="text-align: center">编译器信息</th>
						</thead>
						<tbody>
							<tr>
								<td>总编译时间</td>
								<td>{{ compilation.TotalCompilationTime }}</td>
							</tr>
							<tr>
								<td>是否支持编译时间监控</td>
								<td>{{ compilation.CompilationTimeMonitoringSupported }}</td>
							</tr>
							<tr>
								<td>编译器名称</td>
								<td>{{ compilation.Name }}</td>
							</tr>
						</tbody>
					</table>

					<table class="table table-hover table-bordered mt-2rem">
						<thead>
							<th colspan="3" style="text-align: center">缓冲池息</th>
						</thead>
						<tbody>
							<tr>
								<td width="120" rowspan="4">映射缓冲池的信息</td>
								<td>总容量</td>
								<td>{{ bufferPool.mapped?.TotalCapacity }}</td>
							</tr>
							<tr>
								<td>已使用内存</td>
								<td>{{ bufferPool.mapped?.MemoryUsed }}</td>
							</tr>
							<tr>
								<td>名称</td>
								<td>{{ bufferPool.mapped?.Name }}</td>
							</tr>
							<tr>
								<td>缓冲区数量</td>
								<td>{{ bufferPool.mapped?.Count }}</td>
							</tr>
							<tr>
								<td rowspan="4" width="120">总容量</td>
								<td>总容量</td>
								<td>{{ bufferPool.direct?.TotalCapacity }}</td>
							</tr>
							<tr>
								<td>已使用内存</td>
								<td>{{ bufferPool.direct?.MemoryUsed }}</td>
							</tr>
							<tr>
								<td>名称</td>
								<td>{{ bufferPool.direct?.Name }}</td>
							</tr>
							<tr>
								<td>缓冲区数量</td>
								<td>{{ bufferPool.direct?.Count }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</el-tab-pane>
		</bt-tabs>
		<div v-else class="bg-darkTertiary flex items-center justify-center h-full min-h-[60rem]">
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">
				{{ jxmMsg }}
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { useHandleError } from '@/hooks/tools'
import { getJmxStatus } from '@api/site'
import { SITE_STORE, useSiteStore } from '@site/useStore'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { siteInfo } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

const run = ref(siteInfo.value.pid !== null ? true : false) // 是否运行
const jmx_status = ref(siteInfo.value.project_config.jmx_status)
const loading = ref(false)
const tabActive = ref('system')
const system = ref<any>({})
const classical = ref<any>({})
const runtime = ref<any>({})
const thread = ref<any>({})
const compilation = ref<any>({})
const bufferPool = ref<any>({})
const unmemory = ref<any>({})
const memoryPool = ref<any>([])
const garbageCollector = ref<any>([])
const jxmMsg = ref('')

const getJmxData = async () => {
	try {
		loading.value = true
		const res = await getJmxStatus({ project_name: siteInfo.value.name })
		loading.value = false
		if (!res.status) return (jxmMsg.value = res.msg)
		if (res.status && res.data) {
			jxmMsg.value = ''
			system.value = res.data.OperatingSystem
			classical.value = res.data.ClassLoading
			runtime.value = res.data.Runtime
			thread.value = res.data.Threading
			compilation.value = res.data.Compilation
			bufferPool.value = res.data.BufferPool
			unmemory.value = res.data.Memory
			memoryPool.value = res.data.MemoryPool
			garbageCollector.value = res.data.GarbageCollector
		}
	} catch (error) {
		useHandleError(error)
	}
}

watch(
	() => siteInfo.value,
	val => {
		run.value = siteInfo.value?.pid !== null ? true : false
		jmx_status.value = siteInfo.value?.project_config?.jmx_status
	},
	{ immediate: true }
)
const init = () => {
	if (run.value) getJmxData()
}

onMounted(init)

defineExpose({
	init: getJmxData,
})
</script>

<style lang="css" scoped>
.divtable {
	@apply overflow-auto;
}

.divtable .table {
	@apply w-full text-secondary text-small mb-0;
	border: 0.5px solid var(--el-color-border-dark);
}
.divtable .table thead th {
	@apply bg-light text-secondary font-normal p-[0.8rem] py-[1rem];
	border-bottom: 0.5px solid var(--el-color-border-dark-tertiary);
	vertical-align: inherit;
}
.divtable .table tbody td {
	@apply p-[0.8rem];
	border: 1px solid var(--el-color-border-dark);
}
</style>

<template>
	<config-rows :label="'服务器时区'">
		<template #value>
			<el-select v-model="serverTimeZones.zone" class="!w-[10rem]" placeholder="地区" @change="getServerTimeZones(serverTimeZones.zone)">
				<el-option v-for="item in zoneList" :key="item" :label="item" :value="item"></el-option>
			</el-select>
			<el-select v-model="serverTimeZones.area" class="!ml-[1.2rem] !w-[14.8rem]" placeholder="区域">
				<el-option v-for="item in areaList" :key="item" :label="item" :value="item"></el-option>
			</el-select>
			<el-button type="primary" class="!ml-[1.2rem]" @click="onSync()"> 保存 </el-button>
		</template>
		<template #desc>
			<span> 若时区设置不正确，可能导致服务器时间'不准确'！北京时间(CST +0800)，请选择Asia/Shanghai</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'
import ConfigRows from '@config/public/config-rows-new'
import { getAListOfServerTimeZones,setServerTimeZones } from '@/api/config'

const {
	refs: { panelConfig },
	getGlobalConfig,
} = getConfigStore()

const serverTimeZones = reactive<AnyObject>({
	zone: '',
	area: '',
})

const areaList = shallowRef<string[]>([])
const zoneList = shallowRef<string[]>([])
/**
 * @description: 获取服务器时区列表
 */
const getServerTimeZones = async (val: string = '') => {
	const { data } = await getAListOfServerTimeZones({ zone: val })
	areaList.value = data.areaList || []
	zoneList.value = data.zoneList || []
	if (val === '') {
		// 获取当前的值
		serverTimeZones.zone = data.zone[0]
		serverTimeZones.area = data.zone[1]
	} else {
		// 默认取第一个
		serverTimeZones.area = areaList.value[0]
	}
}
/**
 * @description: 同步服务器时间
 */
const onSync = async () => {
	await useDataHandle({
		loading: '正在设置服务器时区，请稍候...',
		request: setServerTimeZones({ zone: serverTimeZones.zone, area: serverTimeZones.area }),
		message: true,
		success: (res) => {
			if (res.status) {
				setTimeout(() => {
					window.location.reload()
				}, 1000)
			}
		},
	})
}
getServerTimeZones()
</script>

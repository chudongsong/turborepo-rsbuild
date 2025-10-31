<template>
	<div class="p-[20px] flex flex-col" v-bt-loading="loading" v-bt-loading:title="'正在加载中，请稍候...'">
		<div class="flex items-center mb-[20px]">
			登录策略：
			<el-radio v-model="loginPolicyValue" label="allow">选中地区放行，其他地区屏蔽</el-radio>
			<el-radio v-model="loginPolicyValue" label="deny">选中地区屏蔽，其他地区放行</el-radio>
		</div>
		<div class="flex flex-col mb-[20px]">
			<div>
				地区（可选择多项）：
				<span class="bt-link" v-if="zoneList?.length" @click="clearAllChecked">一键清空地区</span>
			</div>
			<div class="area-textarea">
				<el-tag closable type="success" v-for="(item, index) in zoneList" :key="index" @close="removeZone(index)" class="mr-[8px] rounded-base mb-[4px]">
					{{ item.name }}
				</el-tag>
			</div>
		</div>
		<div class="relative">
			<el-select v-model="selectValue" @change="onChangeSelect" filterable placeholder="请选择" size="small" class="absolute-select !w-[16rem]">
				<el-option v-for="item in optionsData" :key="item.value" :label="item.label" :value="item.value">
					<span style="float: left">{{ item.label }}</span>
					<span style="float: right; color: var(--el-base-tertiary); font-size: var(--el-font-size-base)">{{ item.key }}</span>
				</el-option>
			</el-select>
			<el-tabs v-model="activeName" type="border-card" class="min-h-[39rem] relative" @tab-click="onClickTab">
				<el-tab-pane label="全部" name="all">
					<div>
						<span class="font-bold">热门城市</span>
						<el-checkbox-group @change="onChangeHotCity" v-model="hotCityChecked" class="mt-[12px]">
							<el-checkbox-button v-for="city in hotCityList" :value="city.name" :key="city.key">{{ city.name }}</el-checkbox-button>
						</el-checkbox-group>
					</div>
					<div class="flex flex-col">
						<span class="font-bold">中国省份</span>
						<div>
							<span @click="onClickZone(city, 'china')" v-for="city in chinaProvinceList" :label="city.name" :key="city.name" :class="city.checkProvince && city.num ? '!bg-primary !text-white !pr-[2.4rem]' : ''" class="el-checkbox-button__inner !text-small !py-[8px] !px-[8px]"
								><el-badge :hidden="city.num === 0" :value="city.num" class="item">{{ city.name }}</el-badge></span
							>
						</div>
					</div>
					<div>
						<span class="font-bold">其他地区</span>
						<div>
							<span v-for="city in otherCountryList" :label="city.name" @click="onClickZone(city, 'other')" :key="city.key" :class="city.checkProvince && city.num ? '!bg-primary !text-white !pr-[2.4rem]' : ''" class="el-checkbox-button__inner !text-small !py-[8px] !px-[8px]">
								<el-badge :hidden="city.num === 0" :value="city.num" class="item">{{ city.name }}</el-badge></span
							>
						</div>
					</div>
				</el-tab-pane>
				<!-- 动态渲染出来的标签页 -->
				<el-tab-pane :label="otherTabPanel.label" :name="otherTabPanel.name" v-if="otherTabPanel.tabShow">
					<div>
						<el-checkbox-group @change="onChangeChecked" v-model="otherTabPanel.tabChecked" class="mt-[12px]">
							<el-checkbox-button v-for="city in otherTabPanel.tabData" :value="city.name" :key="city.key" :disabled="otherTabPanel.cityDisabled && !city.isProvince">{{ city.name }}</el-checkbox-button>
						</el-checkbox-group>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script setup lang="ts">
import { setLimitData } from '@api/config'
import { __LocalDataCities as _Cities, optionsData } from './area-data' // 地区数据
import { useConfirm, useDataHandle } from '@hooks/tools'
import { Message } from '@hooks/tools'

interface Props {
	compData: any
}

const props = defineProps<Props>()

const loginPolicyValue = ref<string>('allow') //登陆策略
const provinces: any = ['320', '330', '340'] // 港澳台省份
const zoneList = ref<any>() // 文本域地区值
const selectValue = ref<any>([]) // 搜索选中的值

const activeName = ref<string>('all') // tab切换

const hotCityList = ref<any>([]) // 热门城市
const chinaProvinceList = ref<any>([]) // 中国省份
const otherCountryList = ref<any>([]) // 其他国家

const hotCityChecked = ref<any>([]) // 选中的值

const otherTabPanel = reactive<any>({
	name: 'other', // tab面板名称
	label: '其他', // tab面板名称
	tabShow: false, // tab面板是否显示
	tabData: [], // tab面板数据
	index: '', // tab面板索引
	tabChecked: [], // tab面板选中的值
	type: '', // tab面板类型
	cityDisabled: false, // tab面板是否禁用
}) // 其他tab面板

const loading = ref(false) // 加载状态

/**
 * @description: 检查当前选中的值是否存在于列表，将选中的值设置为选中状态
 */
const checkExistChecked = (data: any, list: any) => {
	list.forEach((item: any) => {
		data.city.forEach((city: any) => {
			if (city.code === item.index) item.checkProvince = true
		})
	})
}

/**
 * @description: 设置计数
 */
const setCodeNum = (data: any, list: any) => {
	list.forEach((item: any) => {
		if (data[item.index]) item.num = data[item.index]
	})
}

/**
 * @description: 获取各个地区的计数
 */
const getCodeNum = (data: any) => {
	// 截取res.city中每一项code前三位的值，统计每个值的次数
	const codeNum: any = {}
	data.city.forEach((item: any) => {
		// 判定codeNum中是否存在当前项的code前三位的值
		if (codeNum[item.code.substring(0, 3)]) {
			codeNum[item.code.substring(0, 3)]++
		} else {
			codeNum[item.code.substring(0, 3)] = 1
		}
	})
	// 将codeNum中的值赋值给chinaProvinceList和otherCountryList中对应数据的num
	setCodeNum(codeNum, chinaProvinceList.value)
	setCodeNum(codeNum, otherCountryList.value)
}

/**
 * @description: 获取地区限制数据
 */
const getLimitList = async () => {
	loading.value = true
	try {
		const res = props.compData.limitArea
		if (!res) return
		// 登陆策略
		loginPolicyValue.value = res.limit_type
		// 获取地区限制数据
		zoneList.value = res.city.concat(res.province.concat(res.country))
		// 获取当前已选数据中是否存在热门城市中的数据
		hotCityList.value.forEach((item: any) => {
			const found = res.city.concat(res.province).find((city: any) => city.name === item.name)
			if (found) hotCityChecked.value.push(item.name)
		})
		// 获取当前已选数据中是否存在中国省份/其他国家中的数据
		checkExistChecked(res, chinaProvinceList.value)
		checkExistChecked(res, otherCountryList.value)
		getCodeNum(res) // 计算各个省份的计数
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description: 获取热门城市 + 中国省份 + 其他国家
 */
const getCityList = async () => {
	const data = _Cities.category
	pushDataToList(data.hotcities, hotCityList) // 热门城市
	pushDataToList(data.provinces, chinaProvinceList) // 中国省份
	pushDataToList(data.continents, otherCountryList) //其他国家
	// 获取热门城市
}

/**
 * @description: 将数据push到对应的list中
 * @param {any} data 数据
 * @param {any} list 列表
 */
const pushDataToList = (data: any, list: any) => {
	data.map((item: any) => {
		list.value.push({
			name: _Cities.list[item][0], // 中文名称
			key: _Cities.list[item][1], // 英文名称
			value: _Cities.list[item][2], // 英文简称
			index: item, // 索引
		})
	})
}

/**
 * @description: 移除地区
 * @param {number} index
 */
const removeZone = (index: number) => zoneList.value?.splice(index, 1)

/**
 * @description: 点击可操作地区
 * @param {any} item
 */
const onClickZone = (item: any, type: string) => {
	if (provinces.includes(item.index)) {
		// 如果点击的是港澳台省份，则直接选中
		if (zoneList.value?.some((zone: any) => zone.code === item.index)) {
			zoneList.value = zoneList.value?.filter((zone: any) => zone.code !== item.index)
		} else {
			// 向选中的值中添加当前点击的值
			zoneList.value.push({ name: item.name, code: item.index })
		}
		return
	}
	otherTabPanel.cityDisabled = false
	// 获取地区面板数据
	const data: any = _Cities.list
	// 在地区面板数据中凭借索引index找到当前点击的地区下的区县
	// 区县编码的前三位等于index
	const cityList: any = []
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			// 当前点击的值为省份时，不添加到cityList中
			if (key === item.index) continue
			// 当前点击的值为城市时，添加到cityList中
			if (key.substring(0, 3) === item.index) {
				const city = data[key]
				cityList.push({ name: city[0], key: city[1], value: city[2], index: key })
			}
		}
	}
	// 与zoneList中的数据进行对比，如果存在则选中，赋值给otherTabPanel.tabChecked
	otherTabPanel.tabChecked = []
	cityList.forEach((city: any) => {
		zoneList.value?.forEach((zone: any) => {
			if (city.index === zone.code) otherTabPanel.tabChecked.push(city.name)
		})
	})
	//当前选中的值是否为省份，是则禁用子城市选项
	zoneList.value?.map((zone: any) => {
		if (zone.code === item.index && (item.index.length === 3 || item.checkProvince)) {
			otherTabPanel.tabChecked = [item.name]
			otherTabPanel.cityDisabled = true
		}
	})
	otherTabPanel.tabData = cityList

	// 向数据中unshift当前省份选项
	otherTabPanel.tabData.unshift({
		name: item.name,
		key: item.key,
		value: item.value,
		index: item.index,
		isProvince: true,
	})

	// 设置地区面板数据
	otherTabPanel.name = item.key
	otherTabPanel.label = item.name
	otherTabPanel.index = item.index
	otherTabPanel.type = type
	otherTabPanel.tabShow = true
	activeName.value = item.key
}

/**
 * @description: 点击tab
 * @param {any} tab
 */
const onClickTab = (tab: any) => {
	if (tab.name === 'all') {
		otherTabPanel.tabShow = false // 当点击全部时，隐藏其他tab面板
		activeName.value = 'all' // 设置当前激活的tab

		// 计算当前选中的值的长度，将值赋值给chinaProvinceList中对应数据的num
		function setNum(list: any) {
			list.forEach((item: any) => {
				if (item.index === otherTabPanel.index) {
					item.num = otherTabPanel.tabChecked.length
				}
			})
		}

		if (otherTabPanel.type == 'china') setNum(chinaProvinceList.value)
		if (otherTabPanel.type == 'other') setNum(otherCountryList.value)
		otherTabPanel.tabChecked = []
	}
}

/**
 * @description: 选中的值发生改变
 * @param {any} val
 */
const onChangeChecked = (val: any) => {
	//清空zoneList中该省份下的所有值
	zoneList.value = zoneList.value?.filter((item: any) => item.code.slice(0, 3) !== otherTabPanel.index)
	// 当前选中的值为空时，将cityDisabled设置为false
	if (!val.length) otherTabPanel.cityDisabled = false

	// 比对选中的值和zoneList中的值，不存在则添加，存在不做操作
	val.forEach((item: any) => {
		// 判断当前选中的值是否存在于zoneList中
		let flag = true
		flag = !zoneList.value?.some((zone: any) => item === zone.name)
		// 存在选中的值
		if (flag) {
			// 判断当前选中的值是否为省份
			let proFlag = false
			// 在otherTabPanel.tabData查询当前选中的值的code
			otherTabPanel.tabData.forEach((city: any) => {
				// 当选中的值为当前省份时，将cityDisabled设置为true
				if (city.name === item) {
					if (city.isProvince) {
						otherTabPanel.cityDisabled = true // 禁用子城市
						proFlag = true // 说明当前选中的值含有省份

						// 清除zoneList中该省份下的所有城市
						zoneList.value = zoneList.value.filter(zone => zone.code.substring(0, 3) !== city.index)

						// 在当前页将当前省份选中
						otherTabPanel.tabChecked = [item]
						// 设置当前省份为选中状态
						chinaProvinceList.value.find((child: any) => {
							if (child.name === item) child.checkProvince = true
						})
						// 设置当前国家为选中状态
						otherCountryList.value.find((child: any) => {
							if (child.name === item) child.checkProvince = true
						})
					}
					// 将当前选中的值添加到上方的zoneList中
					zoneList.value.push({ name: item, code: city.index })
				}
			})
			if (!proFlag) {
				// 当前选中的值不为省份时，将cityDisabled设置为false -保险操作，清空当前页禁用状态
				chinaProvinceList.value.find((child: any) => {
					if (child.name === item) delete child.checkProvince // 删除当前省份选中状态
				})
				// 当前选中值不为国家时，将cityDisabled设置为false -保险操作，清空当前页禁用状态
				otherCountryList.value.find((child: any) => {
					if (child.name === item) delete child.checkProvince // 删除当前国家选中状态
				})
			}
		} else {
			otherTabPanel.cityDisabled = false
		}
	})

	// 上方热门城市与省份内部城市联动
	// 监听zoneList值，若值中出现热门城市的值，则在hotCityChecked中添加选中的值
	hotCityChecked.value = []
	zoneList.value?.forEach((item: any) => {
		hotCityList.value.forEach((city: any) => {
			if (item.name === city.name) hotCityChecked.value.push(item.name)
		})
	})
}

/**
 * @description 选中热门城市
 * @param val
 */
const onChangeHotCity = (val: any) => {
	// 在zoneList中删除所有热门城市值，再将选中的值添加到zoneList中
	try {
		zoneList.value = zoneList.value?.filter((item: any) => !hotCityList.value.some(city => item.name === city.name))
		val.forEach((item: any) => {
			hotCityList.value.forEach((city: any) => {
				if (item === city.name) {
					// 当选中的内容中含有当前城市的上一级时，提示不可再选
					const flag = zoneList.value?.some((zone: any) => zone.code === city.index.substring(0, 3))
					if (flag) {
						Message.error('已选中当前城市省，不可再选')
						return false
					} else {
						zoneList.value.push({ name: item, code: city.index })
					}
				}
			})
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 改变右上角搜索框的值
 */
const onChangeSelect = (val: any) => {
	// 查询当前数据是否为省中数据，是省中数据则打开详细数据tab面板，否则则向zoneList中添加数据
	const chinaProvinceListData: any = _Cities.category.provinces,
		city = _Cities.list[val]
	let flag = false
	const isChinaProvince = chinaProvinceListData.includes(val) // 判断当前选中的值是否为省份
	const isOtherCountry = otherCountryList.value.some(item => item.index === val) // 判断当前选中的值是否为其他国家
	flag = isChinaProvince || isOtherCountry
	if (flag) {
		onClickZone({ name: city[0], key: city[1], value: city[2], index: val }, 'china')
	} else {
		// 向zonList中添加数据
		zoneList.value.push({ name: city[0], code: val })
	}
}

/**
 * @description: 确定
 */
const onConfirm = async (close: any) => {
	try {
		await useConfirm({
			title: `设置地区限制`,
			content: '设置后，将开启地区限制，是否继续操作？',
		})
		const params = await dealWithParams(zoneList.value)
		await useDataHandle({
			loading: '正在设置，请稍候...',
			request: setLimitData({
				limit_type: loginPolicyValue.value,
				limit_area_status: true,
				limit_area: JSON.stringify(params),
			}),
			message: true,
			success: (res: any) => {
				if (res.status) props.compData.onRefresh(), close()
			},
		})
	} catch (error) {
		console.log(error)
	}
}

// 处理地区数据
const dealWithParams = (params: any) => {
	const data: { [key: string]: any[] } = { city: [], province: [], country: [] }
	const cityList = _Cities.category
	// 当编码为省份时，将省份下的所有城市添加到data中
	params.forEach((item: any) => {
		// 当编码长度为3时，判断是否为省份
		if (item.code.length === 3) {
			const flag = cityList.gangaotai.includes(item.code) || cityList.district.includes(item.code) || cityList.provinces.includes(item.code)
			if (flag) {
				// 当编码为省份，为港澳台时，将当前省份添加到data.province中
				data.province.push({ name: item.name, code: item.code })
			}

			if (cityList.continents.includes(item.code)) {
				_Cities.relations[item.code].forEach((city: any) => {
					data.country.push({ name: _Cities.list[city][0], code: city })
				})
			}
		} else {
			// 查找当前城市的上一级，若上一级为其他地区，则将当前城市添加到data.country中
			const flag = cityList.continents.includes(item.code.substring(0, 3))
			if (flag) {
				data.country.push({ name: item.name, code: item.code })
			} else {
				data.city.push({ name: item.name, code: item.code })
			}
		}
	})
	return data
}

/**
 * @description: 清空选中的值
 */
const clearAllChecked = () => {
	zoneList.value = []
	otherTabPanel.tabChecked = []
}

/**
 * @description: 遍历当前选中的地区，计算各个省份的计数
 */
const setZoneListNum = (list: any) => {
	list.forEach((items: any) => {
		items.num = 0
		zoneList.value?.forEach((item: any) => {
			if (item.code === items.index || item.code.substring(0, 3) === items.index) {
				items.num += 1
			}
		})
	})
}

watch(
	() => zoneList.value,
	(val: any) => {
		if (!val) return
		// 监听zoneList值，若值中出现热门城市的值，则在hotCityChecked中添加选中的值
		hotCityChecked.value = []
		val?.forEach((item: any) => {
			hotCityList.value.forEach((city: any) => {
				if (item.name === city.name) hotCityChecked.value.push(item.name)
			})
		})
		// 遍历当前选中的地区，计算各个省份的计数
		setZoneListNum(chinaProvinceList.value)
		setZoneListNum(otherCountryList.value)
	}
)

defineExpose({ onConfirm })

onMounted(() => {
	getCityList() // 获取热门城市 + 中国省份 + 其他国家
	getLimitList() // 获取地区限制数据
})
</script>

<style lang="css" scoped>
:deep(.el-radio__label) {
	font-size: var(--el-font-size-small) !important;
}

:deep(.el-checkbox-button__inner) {
	margin-right: 20px;
	border: none;
	min-width: 80px;
	margin-bottom: 8px;
	border-radius: var(--el-border-radius-base) !important;
}

:deep(.el-checkbox-button:first-child .el-checkbox-button__inner) {
	margin-right: 20px !important;
	border: none;
}

:deep(.el-badge__content) {
	background-color: var(--el-color-primary-dark-2);
	line-height: 1.6rem;
	height: 2rem;
}

:deep(.el-badge__content.is-fixed) {
	top: 0.6rem;
	right: -0.2rem;
}
:deep(.el-tabs.el-tabs--border-card > .el-tabs__content) {
	padding: 15px !important;
}

.absolute-select {
	@apply absolute top-[0.6rem] right-[1.2rem] z-99;
}

.area-textarea {
	@apply max-h-[12rem] overflow-auto min-h-[8rem] border border-dark rounded-base w-full mt-[12px] p-[12px];
}
</style>

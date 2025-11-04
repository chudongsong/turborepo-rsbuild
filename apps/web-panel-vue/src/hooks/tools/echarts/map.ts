import * as echarts from 'echarts/core'
import worldMap from './data/world'
import chinaMap from './data/china'

export const useMapData = () => {
	echarts.registerMap('world', worldMap as any)
}

export const useChinaMapData = () => {
	echarts.registerMap('china', chinaMap as any)
}

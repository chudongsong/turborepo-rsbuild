<template>
	<div class="p-[50px]"><BtECharts class="!h-[500px]" /></div>
</template>

<script setup lang="tsx">
import { useECharts } from '@echarts/index';

const base = +new Date(2014, 9, 3);
const oneDay = 24 * 3600 * 1000;
const date: string[] = [];
const data: number[] = [Math.random() * 150];
let now = new Date(base);

const addData = (shift?: boolean) => {
	now = new Date(now.getTime() + oneDay);
	const formattedDate = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/');
	date.push(formattedDate);
	data.push((Math.random() - 0.4) * 10 + data[data.length - 1]);
	if (shift) {
		date.shift();
		data.shift();
	}
};

for (var i = 1; i < 100; i++) {
	addData();
}

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: [],
		},
		yAxis: {
			boundaryGap: [0, '50%'],
			type: 'value',
		},
		series: [
			{
				name: '成交',
				type: 'line',
				smooth: true,
				symbol: 'none',
				stack: 'a',
				areaStyle: {
					normal: {},
				},
				data: [],
			},
		],
	},
});

setInterval(() => {
	addData(true);
	setQuickOption(date, [data]);
}, 1000);
</script>

<style scoped></style>

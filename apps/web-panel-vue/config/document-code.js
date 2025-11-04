const axios = require('axios');
const cheerio = require('cheerio');

// 目标 URL
const url = 'https://element-plus.org/zh-CN/component/overview.html';

async function fetchData() {
	try {
		// 发送 HTTP 请求获取网页内容
		const { data } = await axios.get(url);

		// 使用 cheerio 解析 HTML
		const $ = cheerio.load(data);

		const components = []; // 存储组件信息

		// 提取所需的属性
		const links = [];
		$('.sidebar-groups .link').each((_index, element) => {
			const href = $(element).attr('href').replace('/zh-CN/component/', '');
			if (!['overview', 'icon'].includes(href)) {
				links.push(href);
			}
		});
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}

// 执行爬虫
fetchData();

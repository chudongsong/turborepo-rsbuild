import { defineStore } from 'pinia'
import { getSafeOverview } from '@api/home'

const HOME_SECURITY_OVERVIEW_STORE = defineStore('HOME-SECURITY-OVERVIEW-STORE', () => {
	const scoreData = reactive({
		score: 0, // 安全分数
		scoreLevel: '', // 安全等级
		riskNum: 0, // 风险数量
		subtitle: '',
	})

	const safeDay = ref(0) // 保护天数
	const scanTime = ref('') // 扫描时间
	const virusUpdateTime = ref('') // 病毒库更新时间
	const capabilitySwitch = reactive({
		risk_scan: { status: false, icon: 'risk', name: '风险扫描' }, // 风险扫描
		safe_detect: { status: false, icon: 'safeDetect', name: '安全检测' }, // 安全检测
		file_detection: { status: false, icon: 'ware', name: '恶意文件检测' }, // 恶意文件检测
		vul_scan: { status: false, icon: 'web', name: '漏洞扫描' }, // 漏洞扫描
		hids: { status: false, icon: 'hids', name: '入侵检测' }, // 入侵检测
		tamper: { status: false, icon: 'tamper', name: '防篡改' }, // 防篡改
	})
	const isMalwareConfirm = ref(false) // 恶意文件检测点击确认

	const risk_details = ref([
		{ title: '待修复漏洞', type: 'vul_scan', tips: '及时发现网站中存在的漏洞，及时升级版本，可避免黑客趁虚而入', value: 0 },
		{ title: '待处理恶意文件', type: 'file_detection', tips: '检测到可能窃取信息或破坏系统的恶意文件（如病毒、木马）', value: 0 },
		{ title: '入侵检测', type: 'hids', tips: '分析服务器中异常进程行为，第一时间发现潜在入侵并告警', value: 0 },
		{ title: '首页风险', type: 'homepage_risk', tips: '针对网站/面板/系统进行全方面检测，消除隐藏风险', value: 0 },
		{ title: '基线问题', type: 'safe_detect', tips: '检查服务器配置是否符合安全标准', value: 0 },
		{ title: '企业防篡改', type: 'tamper', tips: '实时保护网页内容是否被非法修改', value: 0 },
	])
	const riskInstallDetails = reactive({
		hids: false,
		tamper: false,
	})

	// 获取安全概览
	const getSafeOverviewData = async () => {
		try {
			const { data } = await getSafeOverview()
			const { security_status, risk_details: riskDetailsParams } = data
			scoreData.score = data.score
			scoreData.scoreLevel = data.level
			scoreData.riskNum = data.risk_count
			scoreData.subtitle = data.level_description

			safeDay.value = data.protect_days
			scanTime.value = data.risk_scan_time.slice(0, 10) || '-'
			virusUpdateTime.value = data.virus_update_time.slice(0, 10) || '-'
			capabilitySwitch.risk_scan.status = security_status.risk_scan
			capabilitySwitch.safe_detect.status = security_status.safe_detect
			capabilitySwitch.file_detection.status = security_status.file_detection
			capabilitySwitch.vul_scan.status = security_status.vul_scan
			capabilitySwitch.hids.status = security_status.hids
			capabilitySwitch.tamper.status = security_status.tamper

			riskInstallDetails.hids = security_status.hids_installed
			riskInstallDetails.tamper = security_status.tamper_installed

			risk_details.value[0].value = riskDetailsParams['vul_scan'].total || 0
			risk_details.value[1].value = riskDetailsParams['file_detection'].total || 0
			risk_details.value[2].value = riskDetailsParams['hids'].total || 0
			risk_details.value[3].value = riskDetailsParams['homepage_risk'].total || 0
			risk_details.value[4].value = riskDetailsParams['safe_detect'].total || 0
			risk_details.value[5].value = riskDetailsParams['tamper'].total || 0
		} catch (error) {
			console.error(error)
		}
	}

	return {
		scoreData,
		safeDay,
		scanTime,
		virusUpdateTime,
		capabilitySwitch,
		risk_details,
		riskInstallDetails,
		getSafeOverviewData,
		isMalwareConfirm,
	}
})
export default HOME_SECURITY_OVERVIEW_STORE

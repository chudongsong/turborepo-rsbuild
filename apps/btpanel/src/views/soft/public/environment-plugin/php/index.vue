<template>
	<bt-tabs v-model="tabActive" type="left-bg-card" @tab-click="handleTabClick">
		<el-tab-pane label="服务" name="service">
			<Status></Status>
		</el-tab-pane>

		<el-tab-pane label="安装扩展" name="development" lazy>
			<bt-tabs type="card" @tab-click="handleDevelopTabClick" v-model="developTabActive">
				<el-tab-pane label="安装列表" name="list">
					<bt-table :column="tableColumns" :data="tableData" v-bt-loading="textLoading" max-height="450" />
					<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
						<li><span class="bt-link" @click="getNewList">点击获取最新扩展列表</span></li>
						<li>Redis扩展仅支持一个PHP版本安装使用，若在其它PHP版本已安装redis扩展，请勿再装</li>
						<li>请按实际需求安装扩展,不要安装不必要的PHP扩展,这会影响PHP执行效率,甚至出现异常</li>
						<li>opcache/xcache/apc等脚本缓存扩展,请只安装其中1个,否则可能导致您的站点程序异常</li>
					</ul>
				</el-tab-pane>
				<el-tab-pane label="已安装扩展" name="installed">
					<bt-table :column="[{ label: '扩展名称', prop: 'name' }]" :data="installedTable" v-bt-loading="textLoading" max-height="520" />
				</el-tab-pane>
				<el-tab-pane label="pecl扩展安装" name="pecl">
					<bt-table-group>
						<template #header-left>
							<div class="flex items-center">
								<span class="mr-8px">扩展名称</span>
								<bt-input placeholder="请输入扩展名称" width="32rem" v-model="peclName"></bt-input>
								<el-button type="primary" class="ml-[8px]" @click="installPeclEvent">点击安装</el-button>
								<el-button class="ml-[8px]" @click="openPeclLog">安装日志</el-button>
							</div>
						</template>
						<template #content>
							<bt-table :column="peclColumn" :data="peclData" max-height="500" />
						</template>
						<template #footer-left>
							<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
								<li>pecl扩展与扩展安装仅能选择一处安装</li>
								<li>如出现安装异常请查看安装日志手动处理</li>
								<li>安装时的选项参数均为默认</li>
								<li>安装日志仅展示最新一次的安装日志数据</li>
							</ul>
						</template>
					</bt-table-group>

					<bt-dialog title="pecl安装日志" :area="54" v-model="peclLogPopup">
						<bt-log :title="`全屏查看日志`" :content="peclLogs" :autoScroll="true" :isHtml="true" :style="'height:460px'"></bt-log>
					</bt-dialog>
				</el-tab-pane>
			</bt-tabs>
		</el-tab-pane>

		<el-tab-pane label="配置修改" name="settings" lazy>
			<div v-bt-loading="viewLoading">
				<el-form label-position="right" label-width="200px" class="settings">
					<el-form-item :label="item.name" v-for="(item, index) in settingsData" :key="index">
						<div class="flex items-center" v-if="item.type == 2 || item.type === 3 || item.name === 'cgi.fix_pathinfo'">
							<bt-input v-model="item.value" width="12rem" class="mr-[12px]" />
							<span>{{ item.ps }}</span>
						</div>
						<div class="flex items-center" v-else>
							<el-select v-model="item.value" class="!w-[12rem] mr-[12px]">
								<el-option label="开启" value="On"></el-option>
								<el-option label="关闭" value="Off"></el-option>
							</el-select>
							<span>{{ item.ps }}</span>
						</div>
					</el-form-item>
					<el-form-item label=" " class="mt-[20px]">
						<el-button type="primary" @click="saveSettings">保存</el-button>
						<el-button type="default" @click="getPhpSettings(true)">刷新</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-tab-pane>

		<el-tab-pane label="上传限制" name="upload" v-bt-loading="viewLoading">
			<div class="flex text-secondary items-center">
				<bt-input v-model="phpData.uploadLimit" type="number" text-type="MB" width="14rem">
					<template #append>MB</template>
				</bt-input>
				<el-button type="primary" class="ml-[12px]" @click="setConfig">保存</el-button>
			</div>
		</el-tab-pane>

		<el-tab-pane label="超时限制" name="timeout" v-bt-loading="viewLoading">
			<div class="flex text-secondary items-center">
				<bt-input v-model="phpData.timeLimit" type="number" text-type="秒" width="14rem">
					<template #append>秒</template>
				</bt-input>
				<el-button type="primary" class="ml-[12px]" @click="setConfig">保存</el-button>
			</div></el-tab-pane
		>

		<el-tab-pane label="配置文件" name="config" lazy>
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[46rem] !w-[64rem]" v-model="staticContent" id="configContent" @save="saveFileEvent('php.ini')" />
			</div>
			<el-button type="primary" @click="saveFileEvent('php.ini')">保存</el-button>
			<ul class="leading-8 mt-20px text-small list-disc ml-[20px]">
				<li>此处为{{ compData.name }}主配置文件,若您不了解配置规则,请勿随意修改</li>
				<li>默认已开启Openssl/Curl/Mysql等扩展，详情可点击phpinfo查看</li>
			</ul>
		</el-tab-pane>

		<el-tab-pane label="FPM配置文件" name="fpm">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[48rem] !w-[64rem]" v-model="staticContent" id="fpmContent" @save="saveFileEvent('php-fpm.conf')" />
			</div>
			<el-button type="primary" @click="saveFileEvent('php-fpm.conf')">保存</el-button>
			<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
				<li>此处为PHP-FPM配置文件,若您不了解配置规则，请勿修改!</li>
			</ul>
		</el-tab-pane>

		<el-tab-pane label="禁用函数" name="function" lazy>
			<bt-table-group>
				<template #header-left>
					<div class="flex items-center">
						<bt-input placeholder="添加要被禁止的函数名,如: exec" width="32rem" v-model="functionData.functionInput"></bt-input>
						<el-button type="primary" class="ml-[8px]" @click="addFunction">保存</el-button>
					</div>
				</template>
				<template #content>
					<bt-table :column="functionColumn" :data="functionData.list" v-bt-loading="textLoading" max-height="500" />
				</template>
				<template #footer-left>
					<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
						<li>在此处可以禁用指定函数的调用,以增强环境安全性!</li>
						<li>强烈建议禁用如exec,system等危险函数!</li>
					</ul>
				</template>
			</bt-table-group>
		</el-tab-pane>

		<el-tab-pane label="性能调整" name="performance" lazy>
			<div class="flex flex-col text-secondary performance" v-bt-loading="viewLoading">
				<el-form label-position="right" label-width="140px" class="mb-[20px] performance-form" :model="performanceForm">
					<el-form-item label="并发方案">
						<el-select class="!w-[16rem] mr-[4px]" v-model="performanceForm.limit" @change="changePerformance">
							<el-option label="1GB内存" value="1GB内存"></el-option>
							<el-option label="2GB内存" value="2GB内存"></el-option>
							<el-option label="4GB内存" value="4GB内存"></el-option>
							<el-option label="8GB内存" value="8GB内存"></el-option>
							<el-option label="16GB内存" value="16GB内存"></el-option>
							<el-option label="32GB内存" value="32GB内存"></el-option>
							<el-option label="48GB内存" value="48GB内存"></el-option>
							<el-option label="64GB内存" value="64GB内存"></el-option>
							<el-option label="96GB内存" value="96GB内存"></el-option>
							<el-option label="128GB内存" value="128GB内存"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="连接方式">
						<div class="flex items-center">
							<el-select class="!w-[16rem] mr-[12px]" v-model="performanceForm.listen">
								<el-option label="Unix套接字" value="unix"></el-option>
								<el-option label="Tcp套接字" value="tcp"></el-option>
							</el-select>
							<span class="text-tertiary">推荐Unix套接字</span>
						</div>
					</el-form-item>
					<el-form-item label="连接信息">
						<div class="flex items-center">
							<bt-input width="16rem" v-model="performanceForm.bind_port"></bt-input>
							<span class="ml-12px text-tertiary">绑定IP:监听端口或Uinx套接字地址</span>
						</div>
					</el-form-item>
					<el-form-item label="IP白名单">
						<div class="flex items-center">
							<bt-input width="16rem" v-model="performanceForm.allowed"></bt-input>
							<span class="ml-12px text-tertiary">允许访问PHP的IP，多个请用逗号隔开</span>
						</div>
					</el-form-item>
					<el-form-item label="运行模式">
						<div class="flex items-center">
							<el-select class="!w-[16rem] mr-[12px]" v-model="performanceForm.pm">
								<el-option label="静态模式" value="static"></el-option>
								<el-option label="动态模式" value="dynamic"></el-option>
								<el-option label="按需模式" value="ondemand"></el-option>
							</el-select>
							<span class="text-tertiary">PHP-FPM运行模式</span>
						</div>
					</el-form-item>
					<template v-for="(item, index) in performanceData" :key="index">
						<el-form-item v-if="index < 4" :label="item.name">
							<div class="flex items-center">
								<bt-input v-model="item.value" width="16rem" type="number"></bt-input>
								<span class="ml-[12px] text-tertiary">{{ item.tips }}</span>
							</div>
						</el-form-item>
					</template>

					<el-form-item label=" ">
						<el-button type="primary" @click="savePerformance">保存</el-button>
					</el-form-item>
				</el-form>

				<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
					<li>【最大子进程数量】越大，并发能力越强，但max_children最大不要超过5000</li>
					<li>【内存】每个PHP子进程需要20MB左右内存，过大的max_children会导致服务器不稳定</li>
					<li>【静态模式】始终维持设置的子进程数量，对内存开销较大，但并发能力较好</li>
					<li>【动态模式】按设置最大空闲进程数来收回进程，内存开销小，建议小内存机器使用</li>
					<li>【按需模式】根据访问需求自动创建进程，内存开销极小，但并发能力略差</li>
					<li>【外网访问】若需外网访问，连接方式为TCP套接字，并将[连接信息-绑定IP]改为0.0.0.0</li>
					<li>【外网访问】配置正确的IP白名单，在防火墙/安全组放行监听端口，有安全风险，需谨慎</li>
					<li>调整完配置需要重启PHP才会生效</li>
				</ul>
			</div>
		</el-tab-pane>

		<el-tab-pane label="负载状态" name="state" v-bt-loading="viewLoading">
			<el-descriptions class="margin-top table-descriptions" :column="2" border>
				<el-descriptions-item v-for="(item, index) in loadData" :key="index" :span="2">
					<template #label> {{ item.name }} </template>
					{{ item.value }}
				</el-descriptions-item>
			</el-descriptions>
		</el-tab-pane>

		<el-tab-pane label="Session配置" name="session" lazy>
			<div>
				<el-form :form="sessionForm" class="session" v-bt-loading="viewLoading">
					<el-form-item label="存储模式">
						<el-select v-model="sessionForm.save_handler" @change="changeSession" class="!w-[24rem]">
							<el-option label="files" value="files"></el-option>
							<el-option label="Redis" value="redis"></el-option>
							<el-option label="Memcache" value="memcache"></el-option>
							<el-option label="Memcached" value="memcached"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="链接地址">
						<div class="flex items-center">
							<bt-input v-model="sessionForm.save_path" :disabled="sessionForm.save_handler === 'files'" width="24rem"></bt-input>
							<span class="ml-[8px]">支持域名和IP地址</span>
						</div>
					</el-form-item>
					<el-form-item label="端口">
						<bt-input v-model="sessionForm.port" :disabled="sessionForm.save_handler === 'files'" width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label="密码">
						<bt-input placeholder="无密码时留空" v-model="sessionForm.passwd" :disabled="sessionForm.save_handler === 'files'" width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label=" ">
						<el-button type="primary" @click="saveSession">保存</el-button>
					</el-form-item>
				</el-form>
				<ul class="mt-[8px] leading-12 text-small list-disc ml-[20px]">
					<li>若你的站点并发比较高，使用Redis，Memcache能有效提升PHP并发能力</li>
					<li>若调整Session模式后，网站访问异常，请切换回原来的模式</li>
					<li>切换Session模式会使在线的用户会话丢失，请在流量小的时候切换</li>
				</ul>
				<el-divider></el-divider>
				<div v-bt-loading="textLoading">
					<div>清理Session文件</div>
					<el-descriptions class="my-[20px] w-[50%] session table-descriptions" :column="1" border>
						<el-descriptions-item> <template #label> 总Session文件数量 </template> {{ sessionData.total }} </el-descriptions-item>
						<el-descriptions-item>
							<template #label> 可清理的Session文件数量 </template>
							{{ sessionData.oldfile }}
						</el-descriptions-item>
					</el-descriptions>
					<el-button type="primary" @click="clearSession">清理session文件</el-button>
				</div>
			</div>
		</el-tab-pane>

		<el-tab-pane label="日志" name="logs">
			<bt-log :title="`全屏查看日志`" :content="logsData.logs" :autoScroll="true" :isHtml="true" :style="'height:600px'" :refresh="getLogs"></bt-log>
		</el-tab-pane>

		<el-tab-pane label="慢日志" name="slowLogs">
			<bt-log :title="`全屏查看日志`" :content="logsData.slowLogs" :autoScroll="true" :isHtml="true" :style="'height:600px'" :refresh="getSlowLogs"></bt-log>
		</el-tab-pane>

		<el-tab-pane label="phpinfo" name="phpinfo" lazy class="overflow-auto h-full">
			<div v-bt-loading="viewLoading">
				<div class="phpinfo pb-[20px]">
					<el-button type="default" @click="openPHPInfo">查看phpinfo</el-button>
					<el-descriptions class="margin-top table-descriptions" :column="2" border title="基本信息">
						<el-descriptions-item>
							<template #label> PHP版本 </template>
							{{ phpInfoData.data.phpinfo?.php_version || '' }}
						</el-descriptions-item>
						<el-descriptions-item>
							<template #label> 安装位置 </template>
							{{ phpInfoData.data.phpinfo?.php_path || '' }}
						</el-descriptions-item>
						<el-descriptions-item :span="2">
							<template #label> php.ini </template>
							{{ phpInfoData.data.phpinfo?.php_ini || '' }}
						</el-descriptions-item>
						<el-descriptions-item :span="2">
							<template #label> 已加载 </template>
							<span class="inline-block max-w-[50rem]">{{ phpInfoData.data.phpinfo?.modules || '' }}</span>
						</el-descriptions-item>
					</el-descriptions>
					<el-descriptions :column="3" class="table-descriptions" border :title="phpInfoData.data.phpinfo.keys[item]" :key="index" v-for="(item, index) in phpInfoData.key">
						<el-descriptions-item v-for="(child, cindex) in Object.keys(phpInfoData.data[item])" :key="cindex">
							<template #label> {{ child }} </template>
							<span :class="phpInfoData.data[item][child] ? 'text-primary' : 'text-danger'">{{ phpInfoData.data[item][child] ? 'yes' : 'no' }}</span>
						</el-descriptions-item>
					</el-descriptions>
				</div>

				<bt-dialog title="phpInfo" v-model="infoPopup" :area="['90%']">
					<div v-html="infoHtml" class="overflow-auto" :style="`height:${mainHeight - 100}px`"></div>
				</bt-dialog>
			</div>
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="tsx">
import Status from '@soft/public/environment-plugin/public/service-status/index.vue'
import {
	developTabActive,
	handleDevelopTabClick,
	tabActive,
	viewLoading,
	textLoading,
	staticContent,
	phpData,
	loadData,
	logsData,
	tableColumns,
	tableData,
	settingsData,
	functionData,
	functionColumn,
	performanceForm,
	performanceData,
	sessionForm,
	sessionData,
	phpInfoData,
	infoPopup,
	infoHtml,
	setConfig,
	getLogs,
	saveFileEvent,
	getSlowLogs,
	handleTabClick,
	getPhpSettings,
	saveSettings,
	addFunction,
	changePerformance,
	savePerformance,
	changeSession,
	saveSession,
	clearSession,
	openPHPInfo,
	init,
	installedTable,
	getNewList,
	installPeclEvent,
	openPeclLog,
	peclColumn,
	peclData,
	peclLogs,
	peclName,
	peclLogPopup,
} from './useController'
import { useGlobalStore } from '@/store/global'
interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { mainHeight } = useGlobalStore()

onMounted(() => {
	init(props.compData)
})
</script>

<style lang="css" scoped>
.performance span {
	font-size: 1.2rem;
}
:deep(.performance-form .el-form-item) {
	margin-bottom: 0.4rem;
}
.el-divider {
	margin: 1rem 0 2rem 0;
}
.phpinfo :deep(.el-descriptions__header) {
	margin-bottom: 0;
	margin-top: 12px;
	padding: 4px 0;
}
.phpinfo :deep(.el-descriptions__title) {
	font-size: 1.4rem !important;
	font-weight: normal;
}
.session :deep(.el-descriptions__cell) {
	width: 60% !important;
}
.session :deep(.el-form-item) {
	margin-top: 0.4rem;
}
.settings :deep(.el-form-item) {
	margin-bottom: 0.4rem;
}
</style>

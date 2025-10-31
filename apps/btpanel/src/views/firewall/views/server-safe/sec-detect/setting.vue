<template>
    <div class="sec-setting p-[2rem] max-h-[80rem] overflow-y-auto">
        <!-- SSH端口修改 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">SSH端口修改</h3>
                    <span v-if="configSuggestions['SSH默认端口']" class="text-small text-secondary">（推荐：{{ configSuggestions['SSH默认端口'] }}）</span>
                </div>
                <div class="flex items-center gap-3">
                    <el-tag type="warning" size="small">重要</el-tag>
                    <bt-input-icon v-model="sshPort" width="20rem" class="!max-w-[20rem]" placeholder="请输入SSH端口" icon="el-refresh" @icon-click="() => generateRandomPort()"></bt-input-icon>
                    <bt-button type="primary" @click="applySshPort">应用</bt-button>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">修改SSH默认端口,避免恶意扫描</p>
            </div>
        </div>

        <!-- 密码复杂度 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">密码复杂度</h3>
                    <span v-if="configSuggestions['密码复杂度策略']" class="text-small text-secondary">（推荐：{{ configSuggestions['密码复杂度策略'] }}）</span>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary leading-[1.5]">启用密码复杂度检查，当前复杂度等级会包含 数字、大写字母、小写字母、特殊字符 其中<span class="text-primary mx-2">{{ complexityLevel }}</span>种字符类型</p>
                <div class="complexity-slider mt-[16px]">
                    <div class="flex items-center gap-4">
                        <span class="text-small mr-4">复杂度等级：</span>
                        <div class="slider-container">
                            <el-slider
                                v-model="complexityLevel"
                                :min="1"
                                :max="4"
                                :step="1"
                                show-stops
                                @change="(value: any) => handleComplexityChange(value as number)"
                            />
                        </div>
                        <span class="text-small text-primary ml-4">{{ complexityLevel }}/4</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 密码长度限制 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">密码长度限制</h3>
                    <span v-if="configSuggestions['密码长度限制']" class="text-small text-secondary">（推荐：{{ configSuggestions['密码长度限制'] }}）</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-small">最低长度:</span>
                    <el-input v-model="minPasswordLength" placeholder="12" style="width: 80px" />
                    <span class="text-small">位</span>
                    <bt-button type="primary" @click="applyPasswordLength">设置</bt-button>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">设置最低密码长度要求</p>
            </div>
        </div>

        <!-- SSH登录告警 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">SSH登录告警</h3>
                    <span v-if="configSuggestions['SSH登录告警']" class="text-small text-secondary">（推荐：{{ configSuggestions['SSH登录告警'] }}）</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-small text-secondary">{{ alarmSSLData?.status ? '已配置' : '未配置' }}</span>
                    <bt-button type="primary" @click="openAlarmForm('ssh', alarmSSLData)">配置告警</bt-button>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">SSH登录时发送告警通知</p>
            </div>
        </div>

        <!-- SSH防爆破 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">SSH防爆破</h3>
                    <span v-if="configSuggestions['SSH防爆破']" class="text-small text-secondary">（推荐：{{ configSuggestions['SSH防爆破'] }}）</span>
                </div>
                <div class="flex items-center gap-2">
                    <el-switch v-model="antiBruteForce" @change="(val: boolean | string | number) => onChangeSshBlast(Boolean(val))" />
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">开启后后台进行部署,防止暴力破解攻击</p>
            </div>
        </div>

        <!-- 面板登录告警 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">面板登录告警</h3>
                    <span v-if="configSuggestions['面板登录告警']" class="text-small text-secondary">（推荐：{{ configSuggestions['面板登录告警'] }}）</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-small text-secondary">{{ alarmPanelData?.status ? '已配置' : '未配置' }}</span>
                    <bt-button type="primary" @click="openAlarmForm('panel', alarmPanelData)">配置告警</bt-button>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">面板登录时发送告警通知</p>
            </div>
        </div>

        <!-- 面板登录动态口令认证 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">面板登录动态口令认证</h3>
                    <span v-if="configSuggestions['面板登录动态口令认证']" class="text-small text-secondary">（推荐：{{ configSuggestions['面板登录动态口令认证'] }}）</span>
                </div>
                <DynamePwd :initial-status="dynamePwdStatus" />
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">启用TOTP动态口令增强安全性</p>
            </div>
        </div>

        <!-- 未登录响应状态码 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">未登录响应状态码</h3>
                    <span v-if="configSuggestions['未登录响应状态码']" class="text-small text-secondary">（推荐：{{ configSuggestions['未登录响应状态码'] }}）</span>
                </div>
                <div class="flex items-center gap-2">
                    <el-select v-model="responseCode" style="width: 200px">
                        <el-option 
                            v-for="item in responseCodeOptions" 
                            :key="item.key" 
                            :label="item.title" 
                            :value="item.key"
                        />
                    </el-select>
                    <bt-button type="primary" @click="applyResponseCode">应用</bt-button>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">设置未登录访问时的HTTP响应状态码</p>
            </div>
        </div>

        <!-- 面板开启SSL -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">面板开启SSL</h3>
                    <span v-if="configSuggestions['面板开启SSL']" class="text-small text-secondary">（推荐：{{ configSuggestions['面板开启SSL'] }}）</span>
                </div>
                <div class="flex items-center gap-2">
                    <PanelSsl :initial-status="panelSslStatus" />
                    <!-- <span class="text-small text-secondary">未配置</span>
                    <bt-button type="primary">配置SSL</bt-button> -->
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">启用HTTPS访问 (设置会重启面板)</p>
            </div>
        </div>

        <!-- root登录设置 -->
        <div class="config-card mb-6">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">Root密码登录设置</h3>
                    <span v-if="configSuggestions['root登录设置']" class="text-small text-secondary">（推荐：{{ configSuggestions['root登录设置'] }}）</span>
                </div>
                <bt-button type="primary" @click="applyRootLogin">应用</bt-button>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">推荐仅允许密钥登录</p>
                <el-radio-group v-model="rootLoginType" class="mt-[16px]">
                    <el-radio value="without-password">只能密钥登录</el-radio>
                    <el-radio value="forced-commands-only">只能执行命令</el-radio>
                    <el-radio value="yes">可密码和密钥登录+密钥</el-radio>
                    <el-radio value="no">禁止登录</el-radio>
                </el-radio-group>
            </div>
        </div>

        <!-- root密钥设置 -->
        <div class="config-card mb-6" v-if="rootLoginType == 'without-password' || rootLoginType == 'yes'">
            <div class="card-header flex items-center mb-4">
                <div class="flex flex-1">
                    <h3 class="text-base font-600 mb-1">root密钥设置</h3>
                </div>
                <div class="flex items-center gap-2">
                    <bt-button type="primary" @click="downloadSshKey(true)">查看密钥</bt-button>
                    <bt-button type="primary" @click="downloadSshKey(false)">下载密钥</bt-button>
                </div>
            </div>
            <div class="card-content">
                <p class="text-small text-secondary">开启宝塔密钥,查看和下载</p>
            </div>
        </div>

        <!-- SSH密钥查看弹窗 -->
        <bt-dialog title="SSH密钥登录" v-model="rootKeyForm" :area="42">
            <el-form class="p-[2rem]" label-width="5rem">
                <el-form-item>
                    <bt-input v-model="rootKey" class="sshKey" type="textarea" readOnly :rows="12" width="36rem"></bt-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="copySshPaw" @click="copySshPaw(rootKey)" v-text="'复制'"></el-button>
                    <el-button type="primary" class="copy" @click="downloadKey" v-text="'下载'"></el-button>
                    <el-button type="default" class="copy" @click="resetRootKeyEvent" v-text="'重新生成'"></el-button>
                </el-form-item>
            </el-form>
        </bt-dialog>
    </div>
</template>

<script setup lang="tsx">
import DynamePwd from './views/dyname-pwd/index.vue'
import PanelSsl from './views/panel-ssl/index.vue'
import { 
    randomPort, 
    applyResponseCode, 
    responseCodeOptions,
    responseCode, 
    applyRootLogin, 
    applySshPort, 
    sshPort, 
    rootLoginType, 
    downloadSshKey, 
    rootKeyForm, 
    rootKey, 
    copySshPaw, 
    downloadKey, 
    resetRootKeyEvent,
    applyPasswordLength,
    minPasswordLength,
    complexityLevel,
    handleComplexityChange,
    openAlarmForm,
    alarmPanelData,
    alarmSSLData,
    antiBruteForce,
    onChangeSshBlast,
    configData,
    initializeStatesFromData,
    dynamePwdStatus,
    panelSslStatus,
    configSuggestions,
 } from './useController'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		configData: {}
	}),
})

// 根据传入数据初始化状态值
const initializeStates = () => {
    const { configData } = props.compData
    
    if (configData?.security_data) {
        initializeStatesFromData(configData)
    } else {
        sshPort.value = randomPort()
    }
}

// 方法
const generateRandomPort = () => {
    sshPort.value = randomPort()
}

onMounted(() => {
    initializeStates()
})

onUnmounted(() => {
    alarmPanelData.value = {}
    alarmSSLData.value = {}
})
</script>

<style scoped lang="scss">
.sec-setting {
    .config-card {
        border: 1px solid var(--el-border-color-light);
        border-radius: var(--el-border-radius-base);
        padding: 1.5rem;
        background-color: var(--el-bg-color);
        
        .card-header {
            border-bottom: 1px solid var(--el-border-color-lighter);
            padding-bottom: 1rem;
        }
        
        .card-content {
            padding: 1rem 0;
        }
        
        .complexity-slider {
            .slider-container {
                flex: 1;
                max-width: 300px;
            }
        }
    }
}
</style>
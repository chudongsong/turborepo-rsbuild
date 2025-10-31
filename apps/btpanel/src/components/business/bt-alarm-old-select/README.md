# BtAlarmOldSelect 旧版告警方式选择器

（和后端旧版配置相关）用于选择告警配置方式的组件，支持多选和配置状态显示。

## 功能特性
- 多选/单选模式切换
- 自动过滤未配置的告警方式
- 动态加载配置状态
- 支持配置跳转
- 兼容新版配置系统

## 基本用法

```vue
<template>
  <bt-alarm-old-select 
    :multiple="true"
    :limit="['mail', 'dingding']"
    @change="handleSelectionChange"
  />
</template>
```

## 组件 API 说明

### Props
| 属性名       | 说明                | 类型      | 默认值   | 可选值                          |
|-------------|-------------------|-----------|---------|--------------------------------|
| multiple    | 是否多选模式         | boolean   | true    | true/false                    |
| limit       | 限制显示的告警类型   | string[]  | []      | mail/dingding/feishu 等       |
| isDefault   | 是否默认选中首个可用项 | boolean   | false   | true/false                    |
| isShowApi   | 是否显示API告警      | boolean   | true    | true/false                    |
| allAlarm    | 是否包含"全部"选项    | boolean   | false   | true/false                    |

### 事件 (Events)
| 事件名     | 说明               | 参数类型       |
|-----------|------------------|---------------|
| change    | 选项变更时触发       | string[]      |

## 选项状态说明
| 状态样式          | 说明               |
|------------------|------------------|
| 正常选项          | 已配置且可用        |
| 禁用选项 (灰色)   | 未配置或不可用       |
| [未配置] 标签     | 红色文字提示        |
| [已配置] 标签     | 可点击跳转配置       |

## 操作说明
1. **选择告警方式**：点击下拉选择器
2. **跳转配置**：点击已配置项的「[已配置]」标签
3. **安装模块**：首次使用需自动安装依赖模块

## 配置类型对照表
| type 值       | 对应渠道       | 配置组件    |
|---------------|--------------|-----------|
| mail          | 邮件通知       | Mail      |
| dingding      | 钉钉机器人     | Common    |
| feishu        | 飞书机器人     | Common    |
| weixin        | 企业微信机器人  | Common    |
| wx_account    | 微信公众号     | WxAccount |

## 最佳实践
1. **类型过滤**：使用 limit 属性限制可选类型
2. **默认选中**：设置 isDefault 自动选择首个可用项
3. **状态同步**：通过 @change 事件更新选中值
4. **配置引导**：未配置项显示跳转按钮

## 关联接口
- `getOldSenderAlarmListInfo`：获取历史告警配置
- `installAlarmModule`：安装告警模块
- `setAlarmModuleDialog`：打开配置对话框

> 完整接口文档参考全局配置 API 文档 
import type { SelectOptionProps } from '@/components/form/bt-select/types';

export const taskTypeOptions = [
	{ value: 'toShell', label: 'Shell脚本' },
	{ value: 'site', label: '备份网站' },
	{ value: 'database', label: '备份数据库' },
	{ value: 'enterpriseBackup', label: '数据库增量备份' },
	{ value: 'logs', label: '网站日志切割' },
	{ value: 'path', label: '备份目录' },
	{ value: 'webshell', label: '木马查杀' },
	{ value: 'syncTime', label: '同步时间' },
	{ value: 'rememory', label: '释放内存' },
	{ value: 'toUrl', label: '访问URL-GET' },
	{ value: 'to_post', label: '访问URL-POST' },
	{ value: 'site_restart', label: '网站启停' },
	{ value: 'log_cleanup', label: '定时清理日志' },
] as SelectOptionProps[];

export const cycleOptions = [
	{ value: 'day', label: '每天' },
	{ value: 'day-n', label: 'N天' },
	{ value: 'hour', label: '每小时' },
	{ value: 'hour-n', label: 'N小时' },
	{ value: 'minute-n', label: 'N分钟' },
	{ value: 'week', label: '每星期' },
	{ value: 'month', label: '每月' },
	{ value: 'second-n', label: 'N秒' },
	{ value: 'custom', label: '自定义' },
] as SelectOptionProps[];

export const weekOptions = [
	{ value: 1, label: '星期一' },
	{ value: 2, label: '星期二' },
	{ value: 3, label: '星期三' },
	{ value: 4, label: '星期四' },
	{ value: 5, label: '星期五' },
	{ value: 6, label: '星期六' },
	{ value: 0, label: '星期日' },
] as SelectOptionProps[];

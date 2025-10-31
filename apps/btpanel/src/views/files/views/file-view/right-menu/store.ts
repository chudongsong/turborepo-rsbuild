import { defineStore, storeToRefs } from 'pinia';
import FILES_STORE from '@/views/files/store';
import FILES_LIST_VIEW_STORE from '../store';
import {
	addFavorites,
	BatchSetAuth,
	calculateContextMenuPosition,
	cloudStorageDialog,
	delFavorites,
	FileCompressPreview,
	openFile,
	openFileShare,
	setFileShare,
	setToping,
} from '@/views/files/useMethods';
import { Message, useConfirm, useDialog, useHandleError } from '@hooks/tools';
import { productPaymentDialog, pluginInstallDialog } from '@/public/index';
import { getPluginInfo } from '@/api/global';
import { FileDataProps } from '@/views/files/types';
import FILES_LOG_ANALYZE_STORE from '../../log-analyze/store';
import FILES_VIRUS_SCAN_STORE from '../../virus-scan/store';

const FILES_RIGHT_MENU_STORE = defineStore('FILES-RIGHT-MENU-STORE', () => {
	const filesStore = FILES_STORE();
	const { authType, copyFilesData, createListType } = storeToRefs(filesStore);
	const { refreshFilesList, watchCreateListType } = filesStore;

	const listStore = FILES_LIST_VIEW_STORE();
	const { contextRow, isBatch } = storeToRefs(listStore);

	const contextmenu = ref<any>(null);
	const showOpen = ref<boolean>(true); // 打开按钮

	/**
	 * @description 监听日志
	 * @param {FileDataProps} fileItem 文件信息
	 * @return void
	 */
	const openLogAnalyze = (fileItem: FileDataProps) => {
		const { compData } = storeToRefs(FILES_LOG_ANALYZE_STORE());
		compData.value = { fileItem };
		useDialog({
			title: `【${fileItem.fileName}】日志写入分析`,
			area: 85,
			component: () => import('@files/views/log-analyze/index.vue'),
		});
	};

	// 收藏事件
	const collection = async () => {
		if (!contextRow.value || Array.isArray(contextRow.value)) return;
		if (!contextRow.value.isFav) {
			addFavorites(contextRow.value, setContextFav);
		} else {
			await useConfirm({
				title: `收藏文件`,
				icon: 'warning',
				content: `您是否要取消【${contextRow.value.fileName}】的收藏？`,
			});
			delFavorites(contextRow.value, setContextFav);
		}
	};

	// 设置收藏状态
	const setContextFav = () => {
		if (contextRow.value) {
			contextRow.value.isFav = !contextRow.value.isFav;
			watchCurrentRow();
		}
	};

	// 分享事件
	const share = async () => {
		if (!contextRow.value || Array.isArray(contextRow.value)) return;
		if (!contextRow.value?.isShare) {
			setFileShare(contextRow.value);
		} else {
			openFileShare(contextRow.value);
		}
	};

	// 置顶事件
	const toping = async () => {
		if (Array.isArray(contextRow.value)) return;
		if (contextRow.value?.isTop) {
			await useConfirm({
				title: `取消置顶文件`,
				content: `您是否要取消置顶【${contextRow.value.fileName}】？`,
			});
		}
		if (contextRow.value) setToping(contextRow.value, contextRow.value.isTop ? 'unset' : 'set');
	};

	// 重命名
	const handleReName = (row: any) => {
		row.oldName = row.fileName;
		row.isReName = true;
	};

	// 打开事件
	const openEvent = (fileItem: any, openBtnText: string, showUnzip: boolean) => {
		if (openBtnText.includes('压缩预览')) {
			if (authType.value !== 'ltd') {
				// 打开企业版付费
				productPaymentDialog({ disablePro: true, sourceId: 171 });
			} else {
				if (showUnzip) {
					FileCompressPreview(fileItem);
				} else {
					Message.error('暂不支持该类型文件预览');
				}
			}
		} else {
			openFile(fileItem);
		}
	};

	// 创建文件夹/文件
	const create = (type: 'dir' | 'file') => {
		createListType.value = type;
		watchCreateListType(type);
	};

	/**
	 * @description 打开云存储
	 * @param type
	 */
	const openCloud = async (pname: string, type: string = 'down') => {
		if (authType.value !== 'ltd') {
			productPaymentDialog({
				sourceId: 73,
			});
		} else {
			try {
				const { data } = await getPluginInfo({ sName: pname });
				if (!data.setup) {
					// 安装
					pluginInstallDialog({
						name: data.name,
						type: 'i',
						pluginInfo: data,
					});
					return;
				}
				const rowData: any = {
					type,
					zName: data.title,
					pname,
				};
				rowData['rowData'] = contextRow.value;
				cloudStorageDialog(rowData);
			} catch (error) {
				useHandleError(error);
			}
		}
	};

	/**
	 * @description 显示菜单
	 * @param e 传入鼠标事件
	 */
	const show = (e: any) => {
		contextmenu.value.visible = true;
		nextTick(() => {
			calculateContextMenuPosition(e, contextmenu.value.contextmenuRef);
		});
	};

	/**
	 * @description 隐藏菜单
	 */
	const hide = () => {
		contextmenu.value.visible = false;
	};

	/**
	 * @description 全局点击事件处理程序
	 * @param e 传入鼠标事件
	 */
	const handleClickOutside = (e: MouseEvent) => {
		if (contextmenu.value && contextmenu.value.visible) {
			hide();
		}
	};

	/**
	 * @description 木马扫描
	 * @param {FileDataProps} fileItem 文件信息
	 * @return void
	 */
	const openTrojanScan = (fileItem: FileDataProps) => {
		const virusScanStore = FILES_VIRUS_SCAN_STORE();
		const { path } = storeToRefs(virusScanStore);
		path.value = fileItem.path;
		useDialog({
			title: `木马扫描【${fileItem.fileName}】`,
			area: 85,
			component: () => import('@files/views/virus-scan/index.vue'),
		});
	};

	// 监听当前行 是否打开按钮
	const watchCurrentRow = () => {
		if (contextRow.value) showOpen.value = true;
	};

	return {
		authType,
		refreshFilesList,
		contextmenu,
		showOpen,
		contextRow,
		isBatch,
		copyFilesData,
		watchCurrentRow,
		openCloud,
		openEvent,
		handleReName,
		show,
		hide,
		handleClickOutside,
		create,
		toping,
		share,
		collection,
		openLogAnalyze,
		openTrojanScan,
	};
});

export default FILES_RIGHT_MENU_STORE;

import { fileSelectionDialog } from '@/public/index';

/**
 * @description: 触发目录选择
 */
export const openFile = (formData:any) => {
  fileSelectionDialog({
    type: 'dir',
    path: formData.value.path || '/www/dk_project/wwwroot',
    change: (path: string, type: string) => {
      formData.value.path = path;
    },
  });
};

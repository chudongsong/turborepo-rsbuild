/**
 * 纯函数：根据文件名后缀推断图标名（来自 other.ts 的纯逻辑部分）。
 */

export function getFileIcon(fileName: string): string {
  const extArr = fileName.split('.')
  const exts = [
    'folder','folder-unempty','sql','c','cpp','cs','flv','css','js','htm','html','java','log','mht','php','url','xml','ai','bmp','cdr','gif','ico','jpeg','jpg','JPG','png','psd','webp','ape','avi','mkv','mov','mp3','mp4','mpeg','mpg','rm','rmvb','swf','wav','webm','wma','wmv','rtf','docx','fdf','potm','pptx','txt','xlsb','xlsx','7z','cab','iso','rar','zip','gz','bt','file','apk','bookfolder','folder-empty','fromchromefolder','documentfolder','fromphonefolder','mix','musicfolder','picturefolder','videofolder','sefolder','access','mdb','accdb','fla','doc','docm','dotx','dotm','dot','pdf','ppt','pptm','pot','xls','csv','xlsm','bt_split','bt_split_json'
  ]
  const extLastName = extArr[extArr.length - 1]
  for (let i = 0; i < exts.length; i++) {
    if (exts[i] === extLastName) return exts[i]
  }
  return 'file'
}
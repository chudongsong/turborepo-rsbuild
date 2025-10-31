import { getDirAuth, getFileDeny } from '@/api/site';
import useWPLocalStore from '@/views/wordpress/view/local/useStore';

const { localRow } = storeToRefs(useWPLocalStore());

/** 访问限制 */
export const getLimitList = async (params: any) => {
    try {
        const {data} = await getDirAuth({ id: localRow.value.id })
        return { data: data[localRow.value.name], total: 0, other: { search_history: [] } };
    } catch (error) {
        console.error(error)
        return { data: [], total: 0, other: { search_history: [] } };
    }
}

/** 拒绝访问 */
export const getDenyList = async (params: any) => {
    try {
        const {data} = await getFileDeny({ website: localRow.value.name })
        return { data: data, total: 0, other: { search_history: [] } };
    } catch (error) {
        console.error(error)
        return { data: [], total: 0, other: { search_history: [] } };
    }
}

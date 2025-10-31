import { getCrossOriginAccess, setCrossOriginAccess, deleteCrossOriginAccess } from "@/api/site"
import { useDataHandle } from "@/hooks/tools"
import { useCrossOriginAccessStore } from "./useStore"

const { formData } = useCrossOriginAccessStore()

interface CrossOriginAccessParams {
    siteName: string;
    project_type: string;
    [key: string]: any;
}

export const getCrossOriginAccessData = async (params: CrossOriginAccessParams) => {
    useDataHandle({
        request: getCrossOriginAccess({
            siteName: params.siteName,
            project_type: params.project_type
        }),
        loading: '正在获取跨域访问配置...',
        success: ({data}: any) => {
            formData.value.siteName = params.siteName
            formData.value.project_type = params.project_type
            formData.value.status = data.status
            formData.value.allowed_origin = data.allowed_origins
            formData.value.allowed_methods = data.allow_methods
            formData.value.allowed_headers = data.allow_headers
            formData.value.exposed_headers = data.expose_headers
            formData.value.allow_credentials = data.allow_credentials
        },
    })
}

export const setCrossOriginAccessData = async (params: CrossOriginAccessParams) => {
    useDataHandle({
        request: setCrossOriginAccess(params),
        loading: '正在设置跨域访问配置...',
        message: true,
        success: (res: any) => {
            if(res.status) {
                getCrossOriginAccessData({
                    siteName: params.siteName,
                    project_type: params.project_type
                })
            }
        }
    })
}

export const deleteCrossOriginAccessData = async (params: CrossOriginAccessParams) => {
    useDataHandle({
        request: deleteCrossOriginAccess({
            siteName: params.siteName,
            project_type: params.project_type
        }),
        loading: '正在删除跨域访问配置...',
        message: true,
        success: (res: any) => {
            if(res.status) {
                getCrossOriginAccessData({
                    siteName: params.siteName,
                    project_type: params.project_type
                })
            }
        }
    })
}

export const submitCrossOriginAccessData = async (params: CrossOriginAccessParams) => {
    if(formData.value.status) {
        setCrossOriginAccessData(params)
    } else {
        deleteCrossOriginAccessData(params)
    }
}

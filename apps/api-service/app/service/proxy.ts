import { Service } from "egg";
import axios, { AxiosRequestConfig } from "axios";
import md5 from "md5";
import { UrlValidator, PathValidator } from "../utils/validation";

/** 面板类型定义 */
type PanelType = "bt" | "1panel";

/** HTTP方法类型 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** 排序字段 */
type SortField = "name" | "size" | "mtime";

/** 文件列表请求参数 */
interface FileListParams {
  p?: number; // 分页
  showRow?: number; // 显示数量
  path: string; // 目录地址
  sort?: SortField; // 排序字段
  reverse?: boolean; // 排序方式（True/False）
}

/** 文件信息 */
interface FileInfo {
  name: string; // 文件/文件夹名
  size: number; // 文件大小（字节）
  mtime: number; // 修改时间（时间戳）
  isDir: boolean; // 是否为文件夹
  path: string; // 完整路径
  type?: string; // 文件类型
}

/** 文件列表响应数据 */
interface FileListResponse {
  total: number; // 总数量
  page: number; // 当前页
  pageSize: number; // 每页大小
  list: FileInfo[]; // 文件/文件夹列表
  path: string; // 当前目录
}

/** 代理响应接口 */
interface ProxyResponse {
  code: number;
  message: string;
  data?: any;
}

/**
 * 代理服务类
 *
 * 负责面板密钥绑定与请求转发：
 * - 支持bt和1panel两种面板类型
 * - 自动处理bt面板的签名认证
 * - 统一错误处理和响应格式
 */
export default class ProxyService extends Service {
  /** 默认HTTP方法 */
  private static readonly DEFAULT_METHOD: HttpMethod = "POST";

  /** 错误状态码 */
  private static readonly ERROR_CODES = {
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  } as const;

  /** 错误消息 */
  private static readonly ERROR_MESSAGES = {
    PANEL_NOT_CONFIGURED: "Panel not configured.",
    PROXY_ERROR: "proxy error",
    SUCCESS: "success",
  } as const;

  /**
   * 绑定面板密钥
   *
   * @param {PanelType} type 面板类型
   * @param {string} url 面板基础地址
   * @param {string} key 访问密钥
   * @returns {Promise<void>} 无返回值，写入持久化存储
   */
  async bindPanelKey(type: PanelType, url: string, key: string): Promise<void> {
    this.ctx.service.storage.bindPanelKey(type, url, key);
  }

  /**
   * 获取文件列表
   *
   * @param {PanelType} panelType 面板类型
   * @param {FileListParams} params 文件列表请求参数
   * @returns {Promise<FileListResponse>} 文件列表响应数据
   */
  async getFileList(
    panelType: PanelType,
    params: FileListParams
  ): Promise<FileListResponse> {
    const panel = this.ctx.service.storage.getPanel(panelType);

    if (!panel || !panel.url) {
      throw new Error(ProxyService.ERROR_MESSAGES.PANEL_NOT_CONFIGURED);
    }

    // 验证路径参数，防止路径遍历攻击
    if (params.path) {
      const pathValidator = new PathValidator();
      if (!pathValidator.validatePath(params.path)) {
        throw new Error(`Invalid path: ${params.path}`);
      }
    }

    try {
      // 构建代理请求参数
      const requestParams = {
        action: "GetDirNew",
        p: params.p || 1,
        showRow: params.showRow || 20,
        path: params.path,
        sort: params.sort || "name",
        reverse: params.reverse || false,
      };

      // 构建axios配置
      const axiosConfig = this.buildAxiosConfig(panel, {
        panelType,
        path: "files",
        params: requestParams,
        method: "GET",
      });

      // 发起请求
      const response = await axios(axiosConfig);

      // 处理响应数据
      const fileListData = this.formatFileListData(response.data);

      return fileListData;
    } catch (error: any) {
      throw new Error(`获取文件列表失败: ${error.message}`);
    }
  }

  /**
   * 格式化文件列表数据
   *
   * @private
   * @param {any} rawData 原始数据
   * @returns {FileListResponse} 格式化后的文件列表数据
   */
  private formatFileListData(rawData: any): FileListResponse {
    // 这里假设原始数据格式为 { total, list: [...] }
    // 需要根据实际接口响应格式调整
    const list = (rawData?.list || []).map((item: any) => ({
      name: item.name || item.filename || "",
      size: item.size || 0,
      mtime: item.mtime || item.modify_time || 0,
      isDir: item.is_dir === true || item.isDir === true,
      path: item.path || "",
      type: item.type || (item.is_dir ? "folder" : this.getFileType(item.name)),
    }));

    return {
      total: rawData?.total || list.length,
      page: rawData?.page || 1,
      pageSize: rawData?.showRow || 20,
      list,
      path: rawData?.path || "",
    };
  }

  /**
   * 根据文件名获取文件类型
   *
   * @private
   * @param {string} filename 文件名
   * @returns {string} 文件类型
   */
  private getFileType(filename: string): string {
    if (!filename) return "unknown";

    const ext = filename.split(".").pop()?.toLowerCase() || "";

    // 常见文件类型映射
    const typeMap: Record<string, string> = {
      // 压缩文件
      zip: "archive",
      rar: "archive",
      "7z": "archive",
      tar: "archive",
      gz: "archive",

      // 图片文件
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      bmp: "image",
      svg: "image",
      webp: "image",

      // 文档文件
      pdf: "document",
      doc: "document",
      docx: "document",
      xls: "document",
      xlsx: "document",
      ppt: "document",
      pptx: "document",
      txt: "text",
      md: "text",

      // 音频文件
      mp3: "audio",
      wav: "audio",
      flac: "audio",
      aac: "audio",

      // 视频文件
      mp4: "video",
      avi: "video",
      mkv: "video",
      mov: "video",
      wmv: "video",

      // 代码文件
      js: "code",
      ts: "code",
      jsx: "code",
      tsx: "code",
      html: "code",
      css: "code",
      scss: "code",
      sass: "code",
      vue: "code",
      py: "code",
      java: "code",
      cpp: "code",
      c: "code",
      php: "code",
      rb: "code",
      go: "code",
      rs: "code",
      json: "code",
      xml: "code",
      yaml: "code",
      yml: "code",
    };

    return typeMap[ext] || "file";
  }

  /**
   * 处理代理请求并转发到配置的面板
   *
   * @param {any} ctx Egg 请求上下文；允许从 `body`/`query` 读取 `panelType`、`url`、`params`、`method`
   * @returns {Promise<ProxyResponse>} 下游响应包装；错误时 `code` 为下游状态码或 500
   */
  async handleRequest(ctx: any): Promise<ProxyResponse> {
    try {
      const requestParams = this.extractRequestParams(ctx);
      const panel = this.ctx.service.storage.getPanel(requestParams.panelType);
      console.log("-------- panel ----------", panel);
      if (!panel || !panel.url) {
        ctx.status = ProxyService.ERROR_CODES.BAD_REQUEST;
        return {
          code: ProxyService.ERROR_CODES.BAD_REQUEST,
          message: ProxyService.ERROR_MESSAGES.PANEL_NOT_CONFIGURED,
        };
      }

      const axiosConfig = this.buildAxiosConfig(panel, requestParams);
      console.log("-------- axiosConfig ----------", axiosConfig);
      const response = await axios(axiosConfig);

      return {
        code: 200,
        message: ProxyService.ERROR_MESSAGES.SUCCESS,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleProxyError(error);
    }
  }

  /**
   * 从请求上下文中提取参数
   *
   * @private
   * @param {any} ctx 请求上下文
   * @returns 提取的请求参数
   */
  private extractRequestParams(ctx: any) {
    const panelType = (ctx.request.body?.panelType ||
      ctx.query?.panelType) as PanelType;
    const path = (ctx.request.body?.url || ctx.query?.url) as string;
    const params = (ctx.request.body?.params || {}) as Record<string, any>;
    const overrideMethod = (ctx.request.body?.method || ctx.query?.method) as
      | string
      | undefined;
    const method = (
      overrideMethod ||
      ctx.method ||
      ProxyService.DEFAULT_METHOD
    ).toUpperCase() as HttpMethod;

    return { panelType, path, params, method };
  }

  /**
   * 构建axios请求配置
   *
   * @private
   * @param {object} panel 面板配置
   * @param {object} requestParams 请求参数
   * @returns {AxiosRequestConfig} axios配置对象
   */
  private buildAxiosConfig(
    panel: { url: string; key: string },
    requestParams: {
      panelType: PanelType;
      path: string;
      params: Record<string, any>;
      method: HttpMethod;
    }
  ): AxiosRequestConfig {
    const { panelType, path, params, method } = requestParams;

    // 处理bt面板的签名认证
    let reqParams = { ...params };
    if (panelType === "bt") {
      reqParams = this.addBtAuthentication(reqParams, panel.key);
    }

    // 构建完整URL
    const url = this.buildUrl(panel.url, path);

    return {
      method,
      url,
      data: reqParams,
      params: method === "GET" ? reqParams : undefined,
    };
  }

  /**
   * 为bt面板添加认证参数
   *
   * @private
   * @param {Record<string, any>} params 原始参数
   * @param {string} key 面板密钥
   * @returns {Record<string, any>} 添加认证后的参数
   */
  private addBtAuthentication(
    params: Record<string, any>,
    key: string
  ): Record<string, any> {
    const request_time = Math.floor(Date.now() / 1000);
    const request_token = md5(key + request_time);
    return { ...params, request_time, request_token };
  }

  /**
   * 构建完整的请求URL
   *
   * @private
   * @param {string} baseUrl 基础URL
   * @param {string} path 路径
   * @returns {string} 完整URL
   */
  private buildUrl(baseUrl: string, path: string): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanPath = path?.startsWith("/") ? path : `/${path || ""}`;
    const fullUrl = cleanBaseUrl + cleanPath;
    
    // 验证URL是否安全
    const urlValidator = new UrlValidator();
    if (!urlValidator.validateUrl(fullUrl)) {
      throw new Error(`Invalid URL: ${fullUrl}`);
    }
    
    return fullUrl;
  }

  /**
   * 处理代理请求错误
   *
   * @private
   * @param {any} error 错误对象
   * @returns {ProxyResponse} 错误响应
   */
  private handleProxyError(error: any): ProxyResponse {
    const status =
      error?.response?.status || ProxyService.ERROR_CODES.INTERNAL_SERVER_ERROR;
    const message = error?.message || ProxyService.ERROR_MESSAGES.PROXY_ERROR;
    const data = error?.response?.data;

    return { code: status, message, data };
  }
}

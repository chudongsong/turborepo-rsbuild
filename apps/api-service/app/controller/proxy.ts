import { Controller } from "egg";
import type { Context } from "egg";

/**
 * ProxyController - 代理请求处理
 *
 * 专门用于处理代理请求的控制器：
 * - `request`：处理代理请求
 * - `getFileList`：获取文件列表
 * @controller Proxy
 */
export default class ProxyController extends Controller {
  /**
   * 处理代理请求
   * @summary 处理代理请求
   * @description 将请求代理到配置的面板服务器
   * @router all /api/v1/proxy/request
   */
  async request(ctx: Context) {
    try {
      const data = await ctx.service.proxy.handleRequest(ctx);
      if (typeof data?.code === "number") ctx.status = data.code;
      ctx.body = data;
    } catch (error) {
      ctx.logger.error("代理请求处理失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.internalError("代理请求处理失败", errorMessage);
    }
  }

  /**
   * 获取文件列表
   * @summary 获取文件列表
   * @description 通过代理接口获取指定目录的文件和文件夹列表
   * @router get /api/v1/proxy/files
   * @query {string} panelType 面板类型 (bt|1panel)
   * @query {number} [p=1] 分页页码
   * @query {number} [showRow=20] 每页显示数量
   * @query {string} path 目录路径 (必填)
   * @query {string} [sort=name] 排序字段 (name|size|mtime)
   * @query {boolean} [reverse=false] 排序方式 (true|false)
   */
  async getFileList(ctx: Context) {
    try {
      const panelType = (ctx.query.panelType as "bt" | "1panel") || "bt";
      const params = {
        p: ctx.query.p ? parseInt(ctx.query.p as string) : undefined,
        showRow: ctx.query.showRow
          ? parseInt(ctx.query.showRow as string)
          : undefined,
        path: ctx.query.path as string,
        sort: ctx.query.sort as "name" | "size" | "mtime",
        reverse: ctx.query.reverse === "true",
      };

      // 验证必填参数
      if (!params.path) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: "参数错误：缺少必填参数 'path'",
        };
        return;
      }

      // 获取文件列表
      const fileList = await ctx.service.proxy.getFileList(panelType, params);

      ctx.body = {
        code: 200,
        message: "success",
        data: fileList,
      };
    } catch (error) {
      ctx.logger.error("获取文件列表失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.internalError("获取文件列表失败", errorMessage);
    }
  }
}

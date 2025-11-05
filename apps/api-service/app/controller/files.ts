import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 文件管理控制器
 *
 * 提供文件上传、下载、管理等 RESTful API
 * 遵循动词+宾语规范，仅使用GET和POST方法
 */
export default class FilesController extends Controller {
  /**
   * 上传文件
   *
   * @router POST /api/v1/upload_file
   * @summary 上传文件
   * @description 上传文件到存储系统
   * @request body uploadFileRequest
   * @response 200 uploadFileResponse
   */
  async upload(ctx: Context) {
    try {
      const file = ctx.request.files?.[0]
      if (!file) {
        ctx.throw(400, 'No file provided')
      }

      const { directory, owner_id, permissions, is_public, metadata } = ctx.request.body || {}

      const result = await ctx.service.files.uploadFile(file, {
        directory,
        owner_id,
        permissions,
        is_public: is_public === 'true' || is_public === true,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      })

      ctx.success(result, 'File uploaded successfully')
    } catch (error) {
      ctx.logger.error('上传文件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('exceeds')) {
        ctx.badRequest(errorMessage)
      } else if (errorMessage.includes('not allowed')) {
        ctx.badRequest(errorMessage)
      } else {
        ctx.internalError('Upload file failed', errorMessage)
      }
    }
  }

  /**
   * 获取文件列表
   *
   * @router GET /api/v1/get_files
   * @summary 获取文件列表
   * @description 分页查询文件列表，支持目录、类型、搜索过滤
   * @request query integer limit - 每页数量（默认20）
   * @request query integer offset - 偏移量（默认0）
   * @request query string directory - 目录过滤
   * @request query string owner_id - 所有者过滤
   * @request query string mime_type - 文件类型过滤
   * @request query string search - 搜索关键词
   * @response 200 getFilesResponse
   */
  async index(ctx: Context) {
    try {
      const { limit, offset, directory, owner_id, mime_type, search } = ctx.query

      const result = await ctx.service.files.getFiles({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        directory,
        owner_id,
        mime_type,
        search,
      })

      ctx.success(result)
    } catch (error) {
      ctx.logger.error('获取文件列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get files list failed', errorMessage)
    }
  }

  /**
   * 获取文件详情
   *
   * @router POST /api/v1/get_file_detail
   * @summary 获取文件详情
   * @description 根据ID获取文件详细信息
   * @request body getFileDetailRequest
   * @response 200 getFileDetailResponse
   */
  async show(ctx: Context) {
    try {
      const { id } = ctx.request.body

      if (!id) {
        ctx.throw(400, 'File ID is required')
      }

      const file = await ctx.service.files.getFile(parseInt(id))

      ctx.success(file)
    } catch (error) {
      ctx.logger.error('获取文件详情失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('not found')) {
        ctx.notFound(errorMessage)
      } else {
        ctx.internalError('Get file detail failed', errorMessage)
      }
    }
  }

  /**
   * 更新文件信息
   *
   * @router POST /api/v1/update_file
   * @summary 更新文件信息
   * @description 更新文件的元信息（不包含文件内容）
   * @request body updateFileRequest
   * @response 200 updateFileResponse
   */
  async update(ctx: Context) {
    try {
      const { id, filename, directory, permissions, is_public, metadata } = ctx.request.body

      if (!id) {
        ctx.throw(400, 'File ID is required')
      }

      const updates: any = {}
      if (filename !== undefined) updates.filename = filename
      if (directory !== undefined) updates.directory = directory
      if (permissions !== undefined) updates.permissions = permissions
      if (is_public !== undefined) updates.is_public = is_public === 'true' || is_public === true
      if (metadata !== undefined) {
        if (typeof metadata === 'string') {
          updates.metadata = metadata
        } else {
          updates.metadata = JSON.stringify(metadata)
        }
      }

      const result = await ctx.service.files.updateFile(parseInt(id), updates)

      ctx.success(result, 'File updated successfully')
    } catch (error) {
      ctx.logger.error('更新文件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('not found')) {
        ctx.notFound(errorMessage)
      } else if (errorMessage.includes('Invalid metadata')) {
        ctx.badRequest(errorMessage)
      } else {
        ctx.internalError('Update file failed', errorMessage)
      }
    }
  }

  /**
   * 删除文件（软删除）
   *
   * @router POST /api/v1/delete_file
   * @summary 删除文件
   * @description 软删除文件记录
   * @request body deleteFileRequest
   * @response 200 deleteFileResponse
   */
  async destroy(ctx: Context) {
    try {
      const { id } = ctx.request.body

      if (!id) {
        ctx.throw(400, 'File ID is required')
      }

      const result = await ctx.service.files.deleteFile(parseInt(id))

      ctx.success(result, 'File deleted successfully')
    } catch (error) {
      ctx.logger.error('删除文件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('not found')) {
        ctx.notFound(errorMessage)
      } else {
        ctx.internalError('Delete file failed', errorMessage)
      }
    }
  }

  /**
   * 永久删除文件
   *
   * @router POST /api/v1/permanently_delete_file
   * @summary 永久删除文件
   * @description 永久删除文件记录和物理文件
   * @request body permanentlyDeleteFileRequest
   * @response 200 permanentlyDeleteFileResponse
   */
  async permanentlyDelete(ctx: Context) {
    try {
      const { id } = ctx.request.body

      if (!id) {
        ctx.throw(400, 'File ID is required')
      }

      const result = await ctx.service.files.permanentlyDeleteFile(parseInt(id))

      ctx.success(result, 'File permanently deleted')
    } catch (error) {
      ctx.logger.error('永久删除文件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('not found')) {
        ctx.notFound(errorMessage)
      } else {
        ctx.internalError('Permanently delete file failed', errorMessage)
      }
    }
  }

  /**
   * 获取目录列表
   *
   * @router GET /api/v1/get_directories
   * @summary 获取目录列表
   * @description 获取所有目录及其文件统计信息
   * @request query string parent_dir - 父目录（可选）
   * @response 200 getDirectoriesResponse
   */
  async listDirectories(ctx: Context) {
    try {
      const { parent_dir } = ctx.query

      const result = await ctx.service.files.getDirectories(parent_dir as string)

      ctx.success(result)
    } catch (error) {
      ctx.logger.error('获取目录列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get directories failed', errorMessage)
    }
  }

  /**
   * 获取文件统计信息
   *
   * @router GET /api/v1/get_file_stats
   * @summary 获取文件统计信息
   * @description 获取文件数量、大小、类型分布等统计信息
   * @response 200 getFileStatsResponse
   */
  async stats(ctx: Context) {
    try {
      const result = await ctx.service.files.getFileStats()

      ctx.success(result)
    } catch (error) {
      ctx.logger.error('获取文件统计失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get file stats failed', errorMessage)
    }
  }
}

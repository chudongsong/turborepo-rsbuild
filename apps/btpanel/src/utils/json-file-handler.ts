/**
 * JSON文件上传与读取公共方法库
 * 提供纯前端实现的JSON文件处理功能
 * @author Generated
 * @version 1.0.0
 */

/**
 * JSON文件读取结果接口
 */
export interface JsonFileResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * 文件选择配置接口
 */
export interface FileSelectOptions {
  multiple?: boolean; // 是否允许多选
  maxSize?: number;   // 最大文件大小（字节）
  accept?: string;    // 接受的文件类型
}

/**
 * JSON文件处理器类
 */
export class JsonFileHandler {
  private static readonly _defaultMaxSize = 10 * 1024 * 1024; // 10MB

  private static readonly _jsonMimeTypes = [
    'application/json',
    'text/json',
    'application/x-json'
  ];

  /**
   * 创建文件选择对话框
   * @param options 文件选择配置
   * @returns Promise<FileList | null>
   */
  static createFileSelector(options: FileSelectOptions = {}): Promise<FileList | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.accept || '.json,application/json';
      input.multiple = options.multiple || false;
      input.style.display = 'none';

      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        resolve(target.files);
        document.body.removeChild(input);
      };

      input.oncancel = () => {
        resolve(null);
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * 验证文件是否为JSON格式
   * @param file 要验证的文件
   * @param maxSize 最大文件大小限制
   * @returns 验证结果
   */
  static validateJsonFile(file: File, maxSize?: number): { valid: boolean; error?: string } {
    const sizeLimit = maxSize || this._defaultMaxSize;

    // 检查文件大小
    if (file.size > sizeLimit) {
      return {
        valid: false,
        error: `文件大小超出限制，最大允许 ${(sizeLimit / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // 检查文件扩展名
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json')) {
      return {
        valid: false,
        error: '文件格式不正确，请选择JSON文件'
      };
    }

    // 检查MIME类型（如果浏览器支持）
    if (file.type && !this._jsonMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: '文件类型不正确，请选择有效的JSON文件'
      };
    }

    return { valid: true };
  }

  /**
   * 异步读取文件内容
   * @param file 要读取的文件
   * @returns Promise<string> 文件内容
   */
  static readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('文件读取失败：无法获取文件内容'));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败：读取过程中发生错误'));
      };

      reader.onabort = () => {
        reject(new Error('文件读取被中断'));
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 解析JSON字符串为JavaScript对象
   * @param jsonString JSON字符串
   * @returns 解析后的对象
   */
  static parseJsonString<T = any>(jsonString: string): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      throw new Error(`JSON解析失败：${error instanceof Error ? error.message : '格式不正确'}`);
    }
  }

  /**
   * 完整的JSON文件读取流程
   * @param file 要处理的文件
   * @param maxSize 最大文件大小限制
   * @returns Promise<JsonFileResult<T>>
   */
  static async processJsonFile<T = any>(file: File, maxSize?: number): Promise<JsonFileResult<T>> {
    try {
      // 1. 验证文件
      const validation = this.validateJsonFile(file, maxSize);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          fileName: file.name,
          fileSize: file.size
        };
      }

      // 2. 读取文件内容
      const content = await this.readFileContent(file);

      // 3. 解析JSON
      const data = this.parseJsonString<T>(content);

      return {
        success: true,
        data,
        fileName: file.name,
        fileSize: file.size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        fileName: file.name,
        fileSize: file.size
      };
    }
  }

  /**
   * 选择并读取JSON文件（完整流程）
   * @param options 文件选择配置
   * @returns Promise<JsonFileResult<T>[]>
   */
  static async selectAndReadJsonFiles<T = any>(options: FileSelectOptions = {}): Promise<JsonFileResult<T>[]> {
    try {
      // 1. 打开文件选择对话框
      const files = await this.createFileSelector(options);
      
      if (!files || files.length === 0) {
        return [{
          success: false,
          error: '未选择任何文件'
        }];
      }

      // 2. 处理所有选中的文件
      const fileArray = Array.from(files);
      const results = await Promise.all(
        fileArray.map(file => this.processJsonFile<T>(file, options.maxSize))
      );

      return results;
    } catch (error) {
      return [{
        success: false,
        error: error instanceof Error ? error.message : '文件处理过程中发生未知错误'
      }];
    }
  }

  /**
   * 选择并读取单个JSON文件
   * @param options 文件选择配置
   * @returns Promise<JsonFileResult<T>>
   */
  static async selectAndReadJsonFile<T = any>(options: Omit<FileSelectOptions, 'multiple'> = {}): Promise<JsonFileResult<T>> {
    const results = await this.selectAndReadJsonFiles<T>({ ...options, multiple: false });
    return results[0] || {
      success: false,
      error: '文件读取失败'
    };
  }
}

/**
 * 便捷的导出函数
 */

/**
 * 选择并读取单个JSON文件
 * @param maxSize 最大文件大小限制（字节）
 * @returns Promise<JsonFileResult<T>>
 */
export const selectJsonFile = <T = any>(maxSize?: number): Promise<JsonFileResult<T>> => {
  return JsonFileHandler.selectAndReadJsonFile<T>({ maxSize });
};

/**
 * 选择并读取多个JSON文件
 * @param maxSize 最大文件大小限制（字节）
 * @returns Promise<JsonFileResult<T>[]>
 */
export const selectJsonFiles = <T = any>(maxSize?: number): Promise<JsonFileResult<T>[]> => {
  return JsonFileHandler.selectAndReadJsonFiles<T>({ multiple: true, maxSize });
};

/**
 * 处理已有的JSON文件对象
 * @param file 文件对象
 * @param maxSize 最大文件大小限制（字节）
 * @returns Promise<JsonFileResult<T>>
 */
export const processJsonFile = <T = any>(file: File, maxSize?: number): Promise<JsonFileResult<T>> => {
  return JsonFileHandler.processJsonFile<T>(file, maxSize);
};

/**
 * 验证文件是否为有效的JSON文件
 * @param file 文件对象
 * @param maxSize 最大文件大小限制（字节）
 * @returns 验证结果
 */
export const validateJsonFile = (file: File, maxSize?: number): { valid: boolean; error?: string } => {
  return JsonFileHandler.validateJsonFile(file, maxSize);
};

// 默认导出
export default JsonFileHandler;